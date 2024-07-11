import urlJoin from "url-join";
import { OAuthEdgeConfig, OAuthTokenResponse, OAuthTokenResponseSchema } from "./types";

export async function getOAuthToken(
    config: OAuthEdgeConfig,
    code: string,
    redirect_uri: string,
): Promise<OAuthTokenResponse> {
    const form = new FormData();
    form.append("code", code);
    form.append("client_secret", config.clientSecret);
    form.append("grant_type", "authorization_code");
    form.append("client_id", config.clientId);
    form.append("redirect_uri", redirect_uri);

    const response = await fetch(urlJoin(config.environment, "/token"), {
        method: "POST",
        body: form,
    });

    if (response.ok) {
        return OAuthTokenResponseSchema.parse(await response.json());
    }
    throw new Error(`Failed to get OAuth token: ${response.status} ${await response.text()}`);
}

export async function refreshOAuthToken(config: OAuthEdgeConfig, refreshToken: string);
