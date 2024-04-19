import { SnippetsService } from "../../api";
import { InvalidPageError, UnauthorizedError } from "../../api/generated/api";
import { type FdrApplication } from "../../app";
import { DbSnippetsPage } from "../../db/snippets/SnippetsDao";
import { APIResolver, ResolvedAPI } from "./APIResolver";

async function resolveApi({
    orgId,
    apiId,
    apiInferrer,
}: {
    orgId: string | undefined;
    apiId: string | undefined;
    apiInferrer: APIResolver;
}): Promise<ResolvedAPI> {
    if (orgId != null && apiId != null) {
        return await apiInferrer.resolveWithOrgAndApiId({ orgId, apiId });
    } else if (orgId != null && apiId == null) {
        return await apiInferrer.resolveWithOrgId({ orgId });
    } else if (orgId == null && apiId != null) {
        return await apiInferrer.resolveWithApiId({ apiId });
    } else {
        return await apiInferrer.resolve();
    }
}

export function getSnippetsService(app: FdrApplication): SnippetsService {
    return new SnippetsService({
        get: async (req, res) => {
            if (req.headers.authorization === undefined) {
                throw new UnauthorizedError("You must be authorized to load snippets");
            }
            const apiInferrer = new APIResolver(app, req.headers.authorization);
            const apiInfo = await resolveApi({
                orgId: req.body.orgId,
                apiId: req.body.apiId,
                apiInferrer,
            });
            const response: DbSnippetsPage = await app.dao.snippets().loadSnippetsPage({
                loadSnippetsInfo: {
                    orgId: apiInfo.orgId,
                    apiId: apiInfo.apiId,
                    endpointIdentifier: req.body.endpoint,
                    sdks: req.body.sdks,
                    page: undefined,
                },
            });
            const snippetsForEndpointPath = response.snippets[req.body.endpoint.path];
            if (snippetsForEndpointPath === undefined) {
                return res.send([]);
            }
            const snippetsForEndpointMethod = snippetsForEndpointPath[req.body.endpoint.method];
            return res.send(snippetsForEndpointMethod ?? []);
        },
        load: async (req, res) => {
            if (req.headers.authorization === undefined) {
                throw new UnauthorizedError("You must be authorized to load snippets");
            }
            const apiInferrer = new APIResolver(app, req.headers.authorization);
            const apiInfo = await resolveApi({
                orgId: req.body.orgId,
                apiId: req.body.apiId,
                apiInferrer,
            });
            // TODO: The cast shouldn't be necessary but the query parameter is being
            // passed in as a string (even though it's typed as a number), so we
            // need to use the + operator to make it a number.
            const page: number | undefined = req.query.page !== undefined ? +req.query.page : undefined;
            if (page !== undefined && page <= 0) {
                throw new InvalidPageError("Query parameter 'page' must be >= 1");
            }
            const response: DbSnippetsPage = await app.dao.snippets().loadSnippetsPage({
                loadSnippetsInfo: {
                    orgId: apiInfo.orgId,
                    apiId: apiInfo.apiId,
                    endpointIdentifier: undefined,
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
