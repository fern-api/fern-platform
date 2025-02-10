import { JWTPayload, createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";
import urlJoin from "url-join";

import {
  type OAuth2Ory,
  type OAuthTokenResponse,
  OAuthTokenResponseSchema,
} from "@fern-docs/auth";

interface TokenInfo {
  access_token: string;
  exp?: number;
  refresh_token?: string;
}

export class OryOAuth2Client {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly environment: string;
  private readonly scope: string | undefined;
  private readonly jwks: string | undefined;
  private readonly redirectUri?: string;

  constructor(config: OAuth2Ory) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.environment = config.environment;
    this.scope = config.scope;
    this.jwks = config.jwks;
    this.redirectUri = config.redirectUri;
  }

  public async getToken(code: string): Promise<OAuthTokenResponse> {
    const formData = new URLSearchParams();
    formData.append("code", code);
    formData.append("client_secret", this.clientSecret);
    formData.append("grant_type", "authorization_code");
    formData.append("client_id", this.clientId);
    if (this.redirectUri != null) {
      formData.append("redirect_uri", this.redirectUri);
    }

    const response = await fetch(urlJoin(this.environment, "/token"), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (response.ok) {
      return OAuthTokenResponseSchema.parse(await response.json());
    }
    throw new Error(
      `Failed to get OAuth token: ${response.status} ${await response.text()}`
    );
  }

  public async refreshToken(
    refresh_token: string
  ): Promise<OAuthTokenResponse> {
    const formData = new URLSearchParams();
    formData.append("refresh_token", refresh_token);
    formData.append("client_secret", this.clientSecret);
    formData.append("grant_type", "refresh_token");
    formData.append("client_id", this.clientId);
    if (this.redirectUri != null) {
      formData.append("redirect_uri", this.redirectUri);
    }

    const response = await fetch(urlJoin(this.environment, "/token"), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (response.ok) {
      return OAuthTokenResponseSchema.parse(await response.json());
    }
    throw new Error(
      `Failed to refresh OAuth token: ${response.status} ${await response.text()}`
    );
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
      console.error(e);
      return null;
    }
  }

  public async getOrRefreshAccessToken(
    access_token: string | undefined,
    refresh_token: string | undefined
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

export function getOryAuthorizationUrl(
  authConfig: OAuth2Ory,
  {
    state,
    redirectUri,
  }: {
    state?: string;
    redirectUri?: string;
  }
): string {
  const url = new URL(urlJoin(authConfig.environment, "/auth"));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", authConfig.clientId);
  if (authConfig.redirectUri != null) {
    url.searchParams.set("redirect_uri", authConfig.redirectUri);
  } else if (redirectUri != null) {
    url.searchParams.set("redirect_uri", redirectUri);
  }
  if (state != null) {
    url.searchParams.set("state", state);
  }
  if (authConfig.scope != null) {
    url.searchParams.set("scope", authConfig.scope);
  }
  url.search = url.search.replace(/%2B/g, "+");
  return url.toString();
}
