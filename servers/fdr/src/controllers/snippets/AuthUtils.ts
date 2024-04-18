import { FdrAPI } from "../../api";
import { FdrApplication } from "../../app";

export class AuthUtility {
    constructor(
        private readonly app: FdrApplication,
        private readonly authHeader: string,
    ) {}
    public async inferOrg(): Promise<string> {
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

    public async assertUserHasAccessToOrg(orgId: string) {
        const orgIds = await this.getOrgIds();
        if (!orgIds.has(orgId)) {
            throw new FdrAPI.UnauthorizedError(`You are not a member of organization ${orgId}`);
        }
    }

    public async getOrgIds(): Promise<Set<string>> {
        const orgIdsResponse = await this.app.services.auth.getOrgIdsFromAuthHeader({
            authHeader: this.authHeader,
        });
        if (orgIdsResponse.type === "error") {
            throw orgIdsResponse.err;
        }
        return orgIdsResponse.orgIds;
    }
}
