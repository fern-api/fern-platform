import { FdrAPI } from "@fern-api/fdr-sdk";
import { SnippetTemplateResolver } from "@fern-api/template-resolver";

import { SnippetsService } from "../../api";
import {
  InvalidPageError,
  SnippetTemplateNotFoundError,
  UnauthorizedError,
} from "../../api/generated/api";
import { type FdrApplication } from "../../app";
import { DbSnippetsPage } from "../../db/snippets/SnippetsDao";
import { APIResolver } from "./APIResolver";

export function getSnippetsService(app: FdrApplication): SnippetsService {
  return new SnippetsService({
    get: async (req, res) => {
      if (req.headers.authorization === undefined) {
        throw new UnauthorizedError("You must be authorized to load snippets");
      }
      const apiInferrer = new APIResolver(app, req.headers.authorization);
      const apiInfo = await apiInferrer.resolveApi({
        orgId: req.body.orgId,
        apiId: req.body.apiId,
      });
      await app.services.auth.checkOrgHasSnippetsApiAccess({
        authHeader: req.headers.authorization,
        orgId: apiInfo.orgId,
        failHard: true,
      });
      const payload = req.body.payload;
      if (payload == null) {
        const response: DbSnippetsPage = await app.dao
          .snippets()
          .loadSnippetsPage({
            loadSnippetsInfo: {
              orgId: apiInfo.orgId,
              apiId: apiInfo.apiId,
              endpointIdentifier: req.body.endpoint,
              exampleIdentifier: req.body.exampleIdentifier,
              sdks: req.body.sdks,
              page: undefined,
            },
          });

        let snippetsForEndpoint;
        if (req.body.endpoint.identifierOverride != null) {
          snippetsForEndpoint =
            response.snippetsByEndpointId[req.body.endpoint.identifierOverride];
        }

        // If you have any snippets from using the identifierOverride, you're set, but if not or if the override isn't
        // specified, you'll need to go leverage the legacy route (path + method).
        if (
          req.body.endpoint.identifierOverride == null ||
          snippetsForEndpoint == undefined ||
          snippetsForEndpoint.length == 0
        ) {
          const snippetsForEndpointPath =
            response.snippets[req.body.endpoint.path];
          if (snippetsForEndpointPath === undefined) {
            return res.send([]);
          }
          const snippetsForEndpointMethod =
            snippetsForEndpointPath[req.body.endpoint.method];
          snippetsForEndpoint = snippetsForEndpointMethod ?? [];
        }
        return res.send(snippetsForEndpoint ?? []);
      } else {
        try {
          const snippets: FdrAPI.Snippet[] = [];

          for (const sdk of req.body.sdks ?? []) {
            const endpointSnippetTemplate: FdrAPI.EndpointSnippetTemplate | null =
              await app.dao.snippetTemplates().loadSnippetTemplate({
                loadSnippetTemplateRequest: {
                  orgId: apiInfo.orgId,
                  apiId: apiInfo.apiId,
                  endpointId: req.body.endpoint,
                  sdk,
                },
              });
            if (endpointSnippetTemplate == null) {
              throw new SnippetTemplateNotFoundError("Snippet not found");
            }
            const templateResolver = new SnippetTemplateResolver({
              payload,
              endpointSnippetTemplate,
            });

            snippets.push(templateResolver.resolve());
          }

          return await res.send(snippets);
        } catch (_e) {
          return await res.send([]);
        }
      }
    },
    load: async (req, res) => {
      if (req.headers.authorization === undefined) {
        throw new UnauthorizedError("You must be authorized to load snippets");
      }
      const apiInferrer = new APIResolver(app, req.headers.authorization);
      const apiInfo = await apiInferrer.resolveApi({
        orgId: req.body.orgId,
        apiId: req.body.apiId,
      });
      await app.services.auth.checkOrgHasSnippetsApiAccess({
        authHeader: req.headers.authorization,
        orgId: apiInfo.orgId,
        failHard: true,
      });
      // TODO: The cast shouldn't be necessary but the query parameter is being
      // passed in as a string (even though it's typed as a number), so we
      // need to use the + operator to make it a number.
      const page: number | undefined =
        req.query.page !== undefined ? +req.query.page : undefined;
      if (page !== undefined && page <= 0) {
        throw new InvalidPageError("Query parameter 'page' must be >= 1");
      }
      const response: DbSnippetsPage = await app.dao
        .snippets()
        .loadSnippetsPage({
          loadSnippetsInfo: {
            orgId: apiInfo.orgId,
            apiId: apiInfo.apiId,
            endpointIdentifier: undefined,
            exampleIdentifier: undefined,
            sdks: req.body.sdks,
            page,
          },
        });
      return res.send({
        next: response.nextPage,
        snippets: response.snippets,
      });
    },
  });
}
