import { SnippetsService } from "../../api";
import { OrgIdAndApiIdNotFound, ApiIdNotFound, ApiIdRequiredError, InvalidPageError, OrgIdNotFound, OrgIdRequiredError } from "../../api/generated/api/errors";
import { InternalError, UnauthorizedError } from "../../api/generated/api/resources/commons/errors";
import { type FdrApplication } from "../../app";
import { LoadSnippetAPIsRequest } from "../../db/SnippetAPIsDao";
import { LoadSnippetsResponse } from "../../db/SnippetsDao";

export interface ApiInfo {
    orgId: string
    apiId: string
}

async function getApiInfo({
    app,
    authorization,
    orgId,
    apiId,
}: {
    app: FdrApplication,
    authorization: string,
    orgId?: string,
    apiId?: string,
}): Promise<ApiInfo> {
    const orgIdsResponse = await app.services.auth.getOrgIdsFromAuthHeader({
        authHeader: authorization,
    });
    if (orgIdsResponse.type === "error") {
        throw orgIdsResponse.err;
    }
    if (orgIdsResponse.orgIds.size === 0) {
        throw new OrgIdNotFound("No organizations were resolved for this user");
    }
    if (orgId != null ? !orgIdsResponse.orgIds.has(orgId) : false) {
        throw new UnauthorizedError(`You are not a member of organization ${orgId}`);
    }
    if (orgId != null && apiId != null) {
        const snippetAPI = await app.dao.snippetAPIs().loadSnippetAPI({
            loadSnippetAPIRequest: {
                orgId: orgId,
                apiName: apiId,
            }
        });
        if (snippetAPI === null) {
            throw new OrgIdAndApiIdNotFound(`Organization ${orgId} does not have API ${apiId}`);
        }
        return {
            orgId: snippetAPI.orgId,
            apiId: snippetAPI.apiName,
        };
    }
    const loadSnippetAPIsRequest: LoadSnippetAPIsRequest = {
        orgIds: orgId != null ? [orgId] : Array.from(orgIdsResponse.orgIds),
        apiName: apiId != null ? apiId : undefined,
    }
    const apiInfos = await app.dao.snippetAPIs().loadSnippetAPIs({
        loadSnippetAPIsRequest: loadSnippetAPIsRequest,
    })
    if (apiInfos.length === 0) {
        app.logger.error(`Loaded zero snippet APIs with request: ${JSON.stringify(loadSnippetAPIsRequest)}`);
        if (apiId !== undefined) {
            throw new ApiIdNotFound(`An API with id ${apiId} was not found`);
        }
        throw new ApiIdRequiredError("No APIs were found; please specify an apiId");
    }
    if (apiInfos.length > 1) {
        app.logger.error(`Loaded too many snippet APIs with request: ${JSON.stringify(loadSnippetAPIsRequest)}`);
        if (apiId !== undefined && orgId !== undefined) {
            throw new InternalError(`Internal error; multiple APIs associated with organization ${orgId} and API ${apiId}`);
        }
        if (apiId !== undefined) {
            throw new OrgIdRequiredError(`Multiple APIs named ${apiId} were found; please provide an orgId`);
        }
        throw new ApiIdRequiredError("Multiple APIs were found; please provide an apiId");
    }
    const apiInfo = apiInfos[0];
    if (apiInfo === undefined) {
        throw new InternalError("Internal error; resolved an undefined API");
    }
    return {
        orgId: apiInfo.orgId,
        apiId: apiInfo.apiName,
    }
}

export function getSnippetsService(app: FdrApplication): SnippetsService {
    return new SnippetsService({
        get: async (req, res) => {
            if (req.headers.authorization === undefined) {
                throw new UnauthorizedError("You must be authorized to load snippets");
            }
            const apiInfo = await getApiInfo({
                app: app,
                authorization: req.headers.authorization,
                orgId: req.body.orgId,
                apiId: req.body.apiId,
            })
            const response: LoadSnippetsResponse = await app.dao.snippets().loadSnippets({
                loadSnippetsInfo: {
                    orgId: apiInfo.orgId,
                    apiId: apiInfo.apiId,
                    endpointIdentifier: req.body.endpoint,
                    sdks: req.body.sdks,
                    page: undefined,
                }
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
            const apiInfo = await getApiInfo({
                app: app,
                authorization: req.headers.authorization,
                orgId: req.body.orgId,
                apiId: req.body.apiId,
            })
            // TODO: The cast shouldn't be necessary but the query parameter is being
            // passed in as a string (even though it's typed as a number), so we
            // need to use the + operator to make it a number.
            const page: number | undefined = req.query.page !== undefined ? +req.query.page : undefined;
            if (page !== undefined && page <= 0) {
                throw new InvalidPageError("Query parameter 'page' must be >= 1");
            }
            const response: LoadSnippetsResponse = await app.dao.snippets().loadSnippets({
                loadSnippetsInfo: {
                    orgId: apiInfo.orgId,
                    apiId: apiInfo.apiId,
                    endpointIdentifier: undefined,
                    sdks: req.body.sdks,
                    page: page,
                }
            });
            return res.send({
                next: response.nextPage,
                snippets: response.snippets,
            });
        },
    });
}
