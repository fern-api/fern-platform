import { FdrAPI } from "../../api";
import { FdrApplication } from "../../app";
import { AuthUtility } from "./AuthUtils";

export interface ResolvedAPI {
    apiId: string;
    orgId: string;
}

export class APIResolver {
    private authUtil: AuthUtility;
    constructor(
        private readonly app: FdrApplication,
        authHeader: string,
    ) {
        this.authUtil = new AuthUtility(app, authHeader);
    }

    public async resolve(): Promise<ResolvedAPI> {
        const orgId = await this.authUtil.inferOrg();
        return this.resolveWithOrgId({ orgId });
    }

    public async resolveWithApiId({ apiId }: { apiId: string }): Promise<ResolvedAPI> {
        const orgId = await this.authUtil.inferOrg();
        return this.resolveWithOrgAndApiId({ orgId, apiId });
    }

    public async resolveWithOrgId({ orgId }: { orgId: string }): Promise<ResolvedAPI> {
        const apiInfos = await this.app.dao.snippetAPIs().loadSnippetAPIs({
            loadSnippetAPIsRequest: {
                orgIds: [orgId],
                apiName: undefined,
            },
        });
        if (apiInfos.length > 1) {
            throw new FdrAPI.ApiIdRequiredError("Multiple APIs were found; please provide an apiId");
        }
        const inferredApi = Array.from(apiInfos)[0];
        if (inferredApi == null) {
            throw new FdrAPI.ApiIdRequiredError(
                "No APIs were found; have you triggered SDK generation and publishing?",
            );
        }
        return this.resolveWithOrgAndApiId({ orgId, apiId: inferredApi.apiName });
    }

    public async resolveWithOrgAndApiId({ orgId, apiId }: { orgId: string; apiId: string }): Promise<ResolvedAPI> {
        await this.authUtil.assertUserHasAccessToOrg(orgId);
        const snippetAPI = await this.app.dao.snippetAPIs().loadSnippetAPI({
            loadSnippetAPIRequest: {
                orgId,
                apiName: apiId,
            },
        });
        if (snippetAPI === null) {
            throw new FdrAPI.OrgIdAndApiIdNotFound(`Organization ${orgId} does not have API ${apiId}`);
        }
        return {
            orgId: snippetAPI.orgId,
            apiId: snippetAPI.apiName,
        };
    }

    public async resolveApi({
        orgId,
        apiId,
    }: {
        orgId: string | undefined;
        apiId: string | undefined;
    }): Promise<ResolvedAPI> {
        if (orgId != null && apiId != null) {
            return await this.resolveWithOrgAndApiId({ orgId, apiId });
        } else if (orgId != null && apiId == null) {
            return await this.resolveWithOrgId({ orgId });
        } else if (orgId == null && apiId != null) {
            return await this.resolveWithApiId({ apiId });
        } else {
            return await this.resolve();
        }
    }
}
