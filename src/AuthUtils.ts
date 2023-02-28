import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { FdrConfig } from "./config";
import { UnauthorizedError, UserNotInOrgError } from "./generated/api";

export interface AuthUtils {
    checkUserBelongsToOrg({ authHeader, orgId }: { authHeader: string | undefined; orgId: string }): Promise<void>;
}

export class AuthUtilsImpl implements AuthUtils {
    private config: FdrConfig;

    constructor(config: FdrConfig) {
        this.config = config;
    }

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
        console.log(`Auth Header is ${authHeader}`);
        const token = getTokenFromAuthHeader(authHeader);
        console.log(`Token is ${authHeader}`);
        const venus = getVenusClient({
            config: this.config,
            token,
        });
        const response = await venus.organization.isMember(FernVenusApi.OrganizationId(orgId));
        if (!response.ok) {
            console.error("Failed to make request to venus", response.error);
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
