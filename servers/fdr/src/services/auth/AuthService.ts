import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import winston from "winston";
import { FdrAPI } from "../../api";
import { FernRegistryError } from "../../api/generated";
import type { FdrApplication, FdrConfig } from "../../app";

export type OrgIdsResponse = SuccessOrgIdsResponse | ErrorOrgIdsResponse;

export interface SuccessOrgIdsResponse {
    type: "success";
    orgIds: Set<string>;
}

export interface ErrorOrgIdsResponse {
    type: "error";
    err: FernRegistryError;
}

export interface AuthService {
    checkUserBelongsToOrg({ authHeader, orgId }: { authHeader: string | undefined; orgId: string }): Promise<void>;

    getOrgIdsFromAuthHeader({ authHeader }: { authHeader: string | undefined }): Promise<OrgIdsResponse>;
}

export class AuthServiceImpl implements AuthService {
    private logger: winston.Logger;

    constructor(private readonly app: FdrApplication) {
        this.logger = app.logger;
    }

    async getOrgIdsFromAuthHeader({ authHeader }: { authHeader: string | undefined }): Promise<OrgIdsResponse> {
        if (authHeader == null) {
            return {
                type: "error",
                err: new FdrAPI.UnauthorizedError("Authorization header was not specified"),
            };
        }
        const token = getTokenFromAuthHeader(authHeader);
        const venus = getVenusClient({
            config: this.app.config,
            token,
        });
        const response = await venus.organization.getOrgIdsFromToken();
        if (!response.ok) {
            this.logger.error("Failed to make request to venus", response.error);
            return {
                type: "error",
                err: new FdrAPI.UnavailableError("Failed to resolve organizations"),
            };
        }
        this.logger.error(`User belongs to organizations: ${response.body}`);
        return {
            type: "success",
            orgIds: new Set<string>(response.body),
        };
    }

    async checkUserBelongsToOrg({
        authHeader,
        orgId,
    }: {
        authHeader: string | undefined;
        orgId: string;
    }): Promise<void> {
        if (authHeader == null) {
            throw new FdrAPI.UnauthorizedError("Authorization header was not specified");
        }
        const token = getTokenFromAuthHeader(authHeader);
        const venus = getVenusClient({
            config: this.app.config,
            token,
        });
        const response = await venus.organization.isMember(FernVenusApi.OrganizationId(orgId));
        if (!response.ok) {
            this.logger.error("Failed to make request to venus", response.error);
            throw new FdrAPI.UnavailableError("Failed to resolve user's organizations");
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
