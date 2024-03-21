import { FdrApplication } from "../../app";
import { FdrAPI } from "../../api";

export interface ResolvedAPI {
    apiId: string;
    orgId: string;
}

export class APIResolver {
    constructor(
        private readonly app: FdrApplication,
        private readonly authHeader: string,
    ) {}

    public async resolve(): Promise<ResolvedAPI> {
        const orgId = await this.inferOrg();
        return this.resolveWithOrgId({ orgId });
    }

    public async resolveWithApiId({ apiId }: { apiId: string }): Promise<ResolvedAPI> {
        const orgId = await this.inferOrg();
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
        await this.assertUserHasAccessToOrg(orgId);
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

    // Helpers
    private async inferOrg(): Promise<string> {
        const orgIds = await this.getOrgIds();
        if (orgIds.size > 1) {
            throw new FdrAPI.OrgIdRequiredError(
                "Your user has access to multiple organizations. Please provide an orgId",
            );
        }
        const inferredOrgId = Array.from(orgIds)[0];
        if (inferredOrgId == null) {
            throw new FdrAPI.OrgIdNotFound("No organizations were resolved for this user");
        }
        return inferredOrgId;
    }

    private async assertUserHasAccessToOrg(orgId: string) {
        const orgIds = await this.getOrgIds();
        if (!orgIds.has(orgId)) {
            throw new FdrAPI.UnauthorizedError(`You are not a member of organization ${orgId}`);
        }
    }

    private async getOrgIds(): Promise<Set<string>> {
        const orgIdsResponse = await this.app.services.auth.getOrgIdsFromAuthHeader({
            authHeader: this.authHeader,
        });
        if (orgIdsResponse.type === "error") {
            throw orgIdsResponse.err;
        }
        return orgIdsResponse.orgIds;
    }
}
