import { JWTPayload, createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";
import { NextApiRequestCookies } from "next/dist/server/api-utils";
import type { NextRequest } from "next/server";
import urlJoin from "url-join";
import { AuthEdgeConfigOAuth2, OAuthTokenResponse, OAuthTokenResponseSchema } from "./types";

interface TokenInfo {
    access_token: string;
    exp?: number;
    refresh_token?: string;
}

export class OAuth2Client {
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly environment: string;
    private readonly scope: string | undefined;
    private readonly jwks: string | undefined;

    constructor(
        config: AuthEdgeConfigOAuth2,
        private readonly redirect_uri?: string,
    ) {
        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret;
        this.environment = config.environment;
        this.scope = config.scope;
        this.jwks = config.jwks;
    }

    public async getToken(code: string): Promise<OAuthTokenResponse> {
        const form = new FormData();
        form.append("code", code);
        form.append("client_secret", this.clientSecret);
        form.append("grant_type", "authorization_code");
        form.append("client_id", this.clientId);
        if (this.redirect_uri != null) {
            form.append("redirect_uri", this.redirect_uri);
        }

        const response = await fetch(urlJoin(this.environment, "/token"), {
            method: "POST",
            body: form,
        });

        if (response.ok) {
            return OAuthTokenResponseSchema.parse(await response.json());
        }
        throw new Error(`Failed to get OAuth token: ${response.status} ${await response.text()}`);
    }

    public async refreshToken(refresh_token: string): Promise<OAuthTokenResponse> {
        const form = new FormData();
        form.append("refresh_token", refresh_token);
        form.append("client_secret", this.clientSecret);
        form.append("grant_type", "refresh_token");
        form.append("client_id", this.clientId);
        if (this.redirect_uri != null) {
            form.append("redirect_uri", this.redirect_uri);
        }

        const response = await fetch(urlJoin(this.environment, "/token"), {
            method: "POST",
            body: form,
        });

        if (response.ok) {
            return OAuthTokenResponseSchema.parse(await response.json());
        }
        throw new Error(`Failed to refresh OAuth token: ${response.status} ${await response.text()}`);
    }

    public getRedirectUrl(state?: string): string {
        const url = new URL(urlJoin(this.environment, "/auth"));
        url.searchParams.set("response_type", "code");
        url.searchParams.set("client_id", this.clientId);
        if (this.redirect_uri != null) {
            url.searchParams.set("redirect_uri", this.redirect_uri);
        }
        if (state != null) {
            url.searchParams.set("state", state);
        }
        if (this.scope != null) {
            url.searchParams.set("scope", this.scope);
        }
        url.search = url.search.replace(/%2B/g, "+");
        return url.toString();
    }

    public async decode(access_token: string): Promise<JWTPayload> {
        if (this.jwks == null) {
            return decodeJwt(access_token);
        }
        const JWKS = createRemoteJWKSet(new URL(this.jwks));
        const { payload } = await jwtVerify(access_token, JWKS);
        return payload;
    }

    public async safeDecode(access_token: string): Promise<JWTPayload | null> {
        try {
            return await this.decode(access_token);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            return null;
        }
    }

    public async getOrRefreshAccessTokenEdge(cookies: NextRequest["cookies"]): Promise<TokenInfo | undefined> {
        const access_token = cookies.get("access_token")?.value;
        const refresh_token = cookies.get("refresh_token")?.value;
        return this.getOrRefreshAccessToken(access_token, refresh_token);
    }

    public async getOrRefreshAccessTokenNode(cookies: NextApiRequestCookies): Promise<TokenInfo | undefined> {
        const access_token = cookies.access_token;
        const refresh_token = cookies.refresh_token;
        return this.getOrRefreshAccessToken(access_token, refresh_token);
    }

    private async getOrRefreshAccessToken(
        access_token: string | undefined,
        refresh_token: string | undefined,
    ): Promise<TokenInfo | undefined> {
        let payload = await this.safeDecode(access_token ?? "");

        if (payload == null && refresh_token != null) {
            const refreshed = await this.refreshToken(refresh_token);
            access_token = refreshed.access_token;
            refresh_token = refreshed.refresh_token;
            payload = await this.safeDecode(access_token);
        }

        if (payload == null || access_token == null) {
            return undefined;
        }

        return { access_token, exp: payload.exp, refresh_token };
    }
}
