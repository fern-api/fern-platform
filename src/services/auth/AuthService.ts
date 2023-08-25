import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import type { FdrApplication, FdrConfig } from "../../app";
import { LOGGER } from "../../app/FdrApplication";
import { UnauthorizedError, UserNotInOrgError } from "../../generated/api";

export interface AuthService {
    checkUserBelongsToOrg({ authHeader, orgId }: { authHeader: string | undefined; orgId: string }): Promise<void>;
}

export class AuthServiceImpl implements AuthService {
    constructor(private readonly app: FdrApplication) {}

    async checkUserBelongsToOrg({
        authHeader,
        orgId,
    }: {
        authHeader: string | undefined;
        orgId: string;
    }): Promise<void> {
        if (authHeader == null) {
            throw new UnauthorizedError();
        }
        const token = getTokenFromAuthHeader(authHeader);
        const venus = getVenusClient({
            config: this.app.config,
            token,
        });
        const response = await venus.organization.isMember(FernVenusApi.OrganizationId(orgId));
        if (!response.ok) {
            LOGGER.error("Failed to make request to venus", response.error);
            throw new Error("Failed to make request to venus.");
        }
        const belongsToOrg = response.body;
        if (!belongsToOrg) {
            throw new UserNotInOrgError();
        }
    }
}

function getVenusClient({ config, token }: { config: FdrConfig; token?: string }): FernVenusApiClient {
    return new FernVenusApiClient({
        environment: config.venusUrl,
        token,
    });
}

const BEARER_REGEX = /^bearer\s+/i;
function getTokenFromAuthHeader(authHeader: string) {
    return authHeader.replace(BEARER_REGEX, "");
}
