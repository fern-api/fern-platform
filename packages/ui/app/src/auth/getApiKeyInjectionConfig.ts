import type { NextRequest } from "next/server";
import { getOAuthEdgeConfig } from "./getOAuthEdgeConfig";
import { getOAuthRedirect } from "./getOAuthRedirect";
import { decodeAccessToken } from "./verifyAccessToken";
import { getOAuthToken } from "./getOAuthToken";

interface APIKeyInjectionConfigDisabled {
    enabled: false;
}
interface APIKeyInjectionConfigEnabledUnauthorized {
    enabled: true;
    authenticated: false;
    url: string;
}
interface APIKeyInjectionConfigEnabledAuthorized {
    enabled: true;
    authenticated: true;
    apiKey: string;
    refreshToken?: string;
}

export type APIKeyInjectionConfig =
    | APIKeyInjectionConfigDisabled
    | APIKeyInjectionConfigEnabledUnauthorized
    | APIKeyInjectionConfigEnabledAuthorized;

async function getOrRefreshAccessToken(cookies: NextRequest["cookies"]) {
    const accessToken = cookies.get("access_token")?.value;
    const refreshToken = cookies.get("refresh_token")?.value;

    if (accessToken != null) {
        try {
            await decodeAccessToken(accessToken);
            return {
                apiKey: accessToken,
                refreshToken,
            };
        } catch (e) {
            if (refreshToken != null) {
                getOAuthToken();
            }
        }
    }

    if (refreshToken != null) {
        // try {
        //     const token = await decodeAccessToken(accessToken, config.jwks);
        //     return {
        //         enabled: true,
        //         authenticated: true,
        //         apiKey: accessToken,
        //     };
        // } catch (e) {
        //     const
        // }
    }
}

export async function getAPIKeyInjectionConfig(
    domain: string,
    cookies?: NextRequest["cookies"],
): Promise<APIKeyInjectionConfig> {
    const config = await getOAuthEdgeConfig(domain);
    if (config?.["api-key-injection-enabled"]) {
        if (cookies != null) {
            const accessToken = cookies.get("access_token")?.value;
            const refreshToken = cookies.get("refresh_token")?.value;

            // try {
            //     if (accessToken != null) {
            //         const token = await decodeAccessToken(accessToken, config.jwks);
            //         return {
            //             enabled: true,
            //             authenticated: true,
            //             apiKey: accessToken,
            //         };
            //     }
            // } catch (e) {
            //     const
            // }
        }

        const url = getOAuthRedirect(config);
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
