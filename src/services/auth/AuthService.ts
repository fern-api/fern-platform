import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { FdrAPI } from "../../api";
import type { FdrApplication, FdrConfig } from "../../app";
import winston from "winston";

export interface AuthService {
    checkUserBelongsToOrg({ authHeader, orgId }: { authHeader: string | undefined; orgId: string }): Promise<void>;
}

export class AuthServiceImpl implements AuthService {
    private logger: winston.Logger;

    constructor(private readonly app: FdrApplication) {
        this.logger = app.logger;
    }

    async checkUserBelongsToOrg({
        authHeader,
        orgId,
    }: {
        authHeader: string | undefined;
        orgId: string;
    }): Promise<void> {
        if (authHeader == null) {
            throw new FdrAPI.UnauthorizedError();
        }
        const token = getTokenFromAuthHeader(authHeader);
        const venus = getVenusClient({
            config: this.app.config,
            token,
        });
        const response = await venus.organization.isMember(FernVenusApi.OrganizationId(orgId));
        if (!response.ok) {
            this.logger.error("Failed to make request to venus", response.error);
            throw new Error("Failed to make request to venus.");
        }
        const belongsToOrg = response.body;
        if (!belongsToOrg) {
            throw new FdrAPI.UserNotInOrgError();
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
