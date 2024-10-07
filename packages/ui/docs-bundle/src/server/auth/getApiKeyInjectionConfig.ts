import type { APIKeyInjectionConfig } from "@fern-ui/fern-docs-auth";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge";
import type { NextApiRequestCookies } from "next/dist/server/api-utils";
import type { NextRequest } from "next/server";
import { OAuth2Client } from "./OAuth2Client";

// TODO: since this is for ORY (rightbrain) only, lets refactor
export async function getAPIKeyInjectionConfig(
    domain: string,
    cookies?: NextRequest["cookies"],
    state?: string,
): Promise<APIKeyInjectionConfig> {
    const config = await getAuthEdgeConfig(domain);
    if (config?.type === "oauth2" && config.partner === "ory" && config["api-key-injection-enabled"]) {
        const client = new OAuth2Client(config);
        const tokens = cookies != null ? await client.getOrRefreshAccessTokenEdge(cookies) : undefined;

        if (tokens != null) {
            return {
                enabled: true,
                authenticated: true,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                exp: tokens.exp,
                partner: config?.partner,
            };
        }

        const url = client.getRedirectUrl(state);
        if (url != null) {
            return {
                enabled: true,
                authenticated: false,
                url,
                partner: config?.partner,
            };
        }
    }
    return {
        enabled: false,
    };
}

// TODO: since this is for ORY (rightbrain) only, lets refactor
export async function getAPIKeyInjectionConfigNode(
    domain: string,
    cookies?: NextApiRequestCookies,
    state?: string,
): Promise<APIKeyInjectionConfig> {
    const config = await getAuthEdgeConfig(domain);
    if (config?.type === "oauth2" && config.partner === "ory" && config["api-key-injection-enabled"]) {
        const client = new OAuth2Client(config);
        const tokens = cookies != null ? await client.getOrRefreshAccessTokenNode(cookies) : undefined;

        if (tokens != null) {
            return {
                enabled: true,
                authenticated: true,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                exp: tokens.exp,
            };
        }

        const url = client.getRedirectUrl(state);
        if (url != null) {
            return {
                enabled: true,
                authenticated: false,
                url,
            };
        }
    }
    return {
        enabled: false,
    };
}
