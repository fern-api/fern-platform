import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import winston from "winston";
import { FernRegistryError } from "../../api/generated";
import { UnauthorizedError, UnavailableError, UserNotInOrgError } from "../../api/generated/api";
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
    checkOrgHasSnippetsApiAccess({
        authHeader,
        orgId,
        failHard,
    }: {
        authHeader: string | undefined;
        orgId: string;
        failHard?: boolean;
    }): Promise<boolean>;
    checkOrgHasSnippetTemplateAccess({
        authHeader,
        orgId,
        failHard,
    }: {
        authHeader: string | undefined;
        orgId: string;
        failHard?: boolean;
    }): Promise<boolean>;
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
                err: new UnauthorizedError("Authorization header was not specified"),
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
                err: new UnavailableError("Failed to resolve organizations"),
            };
        }
        this.logger.error(`User belongs to organizations: ${response.body}`);
        return {
            type: "success",
            orgIds: new Set<string>(response.body),
        };
    }

    // TODO: cache this so we don't make a round-trip to venus for every request
    async checkUserBelongsToOrg({
        authHeader,
        orgId,
    }: {
        authHeader: string | undefined;
        orgId: string;
    }): Promise<void> {
        if (authHeader == null) {
            throw new UnauthorizedError("Authorization header was not specified");
        }
        const token = getTokenFromAuthHeader(authHeader);
        const venus = getVenusClient({
            config: this.app.config,
            token,
        });
        const response = await venus.organization.isMember(FernVenusApi.OrganizationId(orgId));
        if (!response.ok) {
            this.logger.error("Failed to make request to venus", response.error);
            throw new UnavailableError("Failed to resolve user's organizations");
        }
        const belongsToOrg = response.body;
        if (!belongsToOrg) {
            throw new UserNotInOrgError("User does not belong to organization");
        }
    }

    async checkOrgHasSnippetsApiAccess({
        authHeader,
        orgId,
        failHard,
    }: {
        authHeader: string | undefined;
        orgId: string;
        failHard?: boolean;
    }): Promise<boolean> {
        if (authHeader == null) {
            throw new UnauthorizedError("Authorization header was not specified");
        }
        this.checkUserBelongsToOrg({ authHeader, orgId });
        const token = getTokenFromAuthHeader(authHeader);
        const venus = getVenusClient({
            config: this.app.config,
            token,
        });

        const orgResponse = await venus.organization.get(FernVenusApi.OrganizationId(orgId));
        if (!orgResponse.ok) {
            this.logger.error("Failed to make request to venus", orgResponse.error);
            throw new UnavailableError("Failed to resolve user's organizations");
        }
        const org = orgResponse.body;
        if (failHard && !org.snippetsApiAccessEnabled) {
            throw new UnauthorizedError("Organization does not have snippets API access");
        }
        return org.snippetsApiAccessEnabled;
    }

    async checkOrgHasSnippetTemplateAccess({
        authHeader,
        orgId,
        failHard,
    }: {
        authHeader: string | undefined;
        orgId: string;
        failHard?: boolean;
    }): Promise<boolean> {
        if (authHeader == null) {
            throw new UnauthorizedError("Authorization header was not specified");
        }
        this.checkUserBelongsToOrg({ authHeader, orgId });
        const token = getTokenFromAuthHeader(authHeader);
        const venus = getVenusClient({
            config: this.app.config,
            token,
        });

        const orgResponse = await venus.organization.get(FernVenusApi.OrganizationId(orgId));
        if (!orgResponse.ok) {
            this.logger.error("Failed to make request to venus", orgResponse.error);
            throw new UnavailableError("Failed to resolve user's organizations");
        }
        const org = orgResponse.body;
        if (failHard && !org.snippetTemplatesAccessEnabled) {
            throw new UnauthorizedError("Organization does not have snippets API access");
        }
        return org.snippetTemplatesAccessEnabled;
    }
}

function getVenusClient({ config, token }: { config: FdrConfig; token?: string }): FernVenusApiClient {
    return new FernVenusApiClient({
        environment: config.venusUrl,
        token,
    });
}

const BEARER_REGEX = /^bearer\s+/i;
export function getTokenFromAuthHeader(authHeader: string) {
    return authHeader.replace(BEARER_REGEX, "");
}
