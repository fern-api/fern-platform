import { signFernJWT } from "../FernJWT";
import { getAuthStateInternal } from "../getAuthState";
import * as session from "../workos-session";

describe("getAuthState", () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const TEST_JWT_SECRET = process.env.JWT_SECRET_KEY!;
    const ISSUER = "https://f";

    it("should handle missing auth config", async () => {
        const authState = await getAuthStateInternal({
            host: "localhost:3000",
            fernToken: "bad_token",
        });
        expect(authState.authed).toBe(false);
        expect(authState.ok).toBe(true); // even fern_token is bad, this is still OK because authConfig is missing.
    });

    it("should handle basic token verification", async () => {
        const BASIC_TOKEN_AUTH = {
            type: "basic_token_verification" as const,
            secret: TEST_JWT_SECRET,
            issuer: ISSUER,
            redirect: "https://f/login",
        };

        const authStateBadToken = await getAuthStateInternal({
            host: "docs.test.com",
            fernToken: "bad_token",
            authConfig: BASIC_TOKEN_AUTH,
        });
        expect(authStateBadToken.partner).toBe("custom");
        expect(authStateBadToken.authed).toBe(false);
        expect(authStateBadToken.ok).toBe(true);
        if (!authStateBadToken.authed) {
            const authorizationUrl = new URL(authStateBadToken.authorizationUrl ?? "http://f");

            expect(authorizationUrl.origin).toBe("https://f");
            expect(authorizationUrl.pathname).toBe("/login");
            expect(authorizationUrl.searchParams.get("redirect_uri")).toBe(
                "https://docs.test.com/api/fern-docs/auth/jwt/callback",
            );
            expect(authorizationUrl.searchParams.get("state")).toBe("https://docs.test.com");
        }

        const authStateBadTokenWithPathname = await getAuthStateInternal({
            host: "docs.test.com",
            fernToken: "bad_token",
            authConfig: BASIC_TOKEN_AUTH,
            pathname: "/docs/test",
        });

        expect(authStateBadTokenWithPathname.authed).toBe(false);
        expect(authStateBadTokenWithPathname.ok).toBe(true);
        if (!authStateBadTokenWithPathname.authed) {
            const authorizationUrl = new URL(authStateBadTokenWithPathname.authorizationUrl ?? "http://f");

            expect(authorizationUrl.origin).toBe("https://f");
            expect(authorizationUrl.pathname).toBe("/login");
            expect(authorizationUrl.searchParams.get("redirect_uri")).toBe(
                "https://docs.test.com/api/fern-docs/auth/jwt/callback",
            );
            expect(authorizationUrl.searchParams.get("state")).toBe("https://docs.test.com/docs/test");
        }

        const authStateGoodToken = await getAuthStateInternal({
            host: "localhost:3000",
            fernToken: await signFernJWT({}, { secret: TEST_JWT_SECRET, issuer: ISSUER }),
            authConfig: BASIC_TOKEN_AUTH,
        });

        expect(authStateGoodToken.authed).toBe(true);
        expect(authStateGoodToken.ok).toBe(true);
    });

    it("should handle oauth with ory", async () => {
        const ORY_AUTH_CONFIG = {
            type: "oauth2" as const,
            partner: "ory" as const,
            clientId: "test",
            clientSecret: "test",
            environment: "https://ory.test.com",
        };

        const authStateBadToken = await getAuthStateInternal({
            host: "docs.test.com",
            fernToken: "bad_token",
            authConfig: ORY_AUTH_CONFIG,
        });
        expect(authStateBadToken.authed).toBe(false);
        expect(authStateBadToken.ok).toBe(true);
        if (!authStateBadToken.authed) {
            const authorizationUrl = new URL(authStateBadToken.authorizationUrl ?? "http://f");

            expect(authorizationUrl.origin).toBe(ORY_AUTH_CONFIG.environment);
            expect(authorizationUrl.pathname).toBe("/auth");
            expect(authorizationUrl.searchParams.get("response_type")).toBe("code");
            expect(authorizationUrl.searchParams.get("client_id")).toBe(ORY_AUTH_CONFIG.clientId);
            expect(authorizationUrl.searchParams.get("redirect_uri")).toBe(
                "https://docs.test.com/api/fern-docs/oauth/ory/callback",
            );
            expect(authorizationUrl.searchParams.get("state")).toBe("https://docs.test.com");
        }

        const authStateBadTokenWithPathname = await getAuthStateInternal({
            host: "docs.test.com",
            fernToken: "bad_token",
            authConfig: ORY_AUTH_CONFIG,
            pathname: "/docs/test",
        });

        expect(authStateBadTokenWithPathname.authed).toBe(false);
        expect(authStateBadTokenWithPathname.ok).toBe(true);
        if (!authStateBadTokenWithPathname.authed) {
            const authorizationUrl = new URL(authStateBadTokenWithPathname.authorizationUrl ?? "http://f");

            expect(authorizationUrl.origin).toBe(ORY_AUTH_CONFIG.environment);
            expect(authorizationUrl.pathname).toBe("/auth");
            expect(authorizationUrl.searchParams.get("response_type")).toBe("code");
            expect(authorizationUrl.searchParams.get("client_id")).toBe(ORY_AUTH_CONFIG.clientId);
            expect(authorizationUrl.searchParams.get("redirect_uri")).toBe(
                "https://docs.test.com/api/fern-docs/oauth/ory/callback",
            );
            expect(authorizationUrl.searchParams.get("state")).toBe("https://docs.test.com/docs/test");
        }

        const authStateGoodToken = await getAuthStateInternal({
            host: "localhost:3000",
            // Note: this is a valid Fern JWT, but it's not a valid ORY JWT
            fernToken: await signFernJWT({}, { secret: TEST_JWT_SECRET, issuer: ISSUER }),
            authConfig: ORY_AUTH_CONFIG,
        });

        // even if the JWT is a valid Fern JWT, at the moment we don't support Fern Tokens generated from ORY OAuth
        expect(authStateGoodToken.authed).toBe(false);
        expect(authStateGoodToken.ok).toBe(true);
    });

    it("should handle oauth with webflow", async () => {
        const WORKOS_AUTH_CONFIG = {
            type: "oauth2" as const,
            partner: "webflow" as const,
            clientId: "test",
            clientSecret: "test",
        };

        const authStateBadToken = await getAuthStateInternal({
            host: "docs.test.com",
            fernToken: "bad_token",
            authConfig: WORKOS_AUTH_CONFIG,
        });
        expect(authStateBadToken.authed).toBe(false);
        expect(authStateBadToken.ok).toBe(true);
        if (!authStateBadToken.authed) {
            const authorizationUrl = new URL(authStateBadToken.authorizationUrl ?? "http://f");

            expect(authorizationUrl.origin).toBe("https://webflow.com");
            expect(authorizationUrl.pathname).toBe("/oauth/authorize");
            expect(authorizationUrl.searchParams.get("response_type")).toBe("code");
            expect(authorizationUrl.searchParams.get("client_id")).toBe(WORKOS_AUTH_CONFIG.clientId);
            expect(authorizationUrl.searchParams.get("redirect_uri")).toBe(
                "https://docs.test.com/api/fern-docs/oauth/webflow/callback",
            );
            expect(authorizationUrl.searchParams.get("state")).toBe("https://docs.test.com");
        }

        const authStateBadTokenWithPathname = await getAuthStateInternal({
            host: "docs.test.com",
            fernToken: "bad_token",
            authConfig: WORKOS_AUTH_CONFIG,
            pathname: "/docs/test",
        });

        expect(authStateBadTokenWithPathname.authed).toBe(false);
        expect(authStateBadTokenWithPathname.ok).toBe(true);
        if (!authStateBadTokenWithPathname.authed) {
            const authorizationUrl = new URL(authStateBadTokenWithPathname.authorizationUrl ?? "http://f");

            expect(authorizationUrl.origin).toBe("https://webflow.com");
            expect(authorizationUrl.pathname).toBe("/oauth/authorize");
            expect(authorizationUrl.searchParams.get("response_type")).toBe("code");
            expect(authorizationUrl.searchParams.get("client_id")).toBe(WORKOS_AUTH_CONFIG.clientId);
            expect(authorizationUrl.searchParams.get("redirect_uri")).toBe(
                "https://docs.test.com/api/fern-docs/oauth/webflow/callback",
            );
            expect(authorizationUrl.searchParams.get("state")).toBe("https://docs.test.com/docs/test");
        }

        const authStateGoodToken = await getAuthStateInternal({
            host: "localhost:3000",
            // Note: this is a valid Fern JWT, but it's not a valid Webflow JWT
            fernToken: await signFernJWT({}, { secret: TEST_JWT_SECRET, issuer: ISSUER }),
            authConfig: WORKOS_AUTH_CONFIG,
        });

        // even if the JWT is a valid Fern JWT, at the moment we don't support Fern tokens generated from Webflow OAuth
        expect(authStateGoodToken.authed).toBe(false);
        expect(authStateGoodToken.ok).toBe(true);
    });

    it("should handle sso with workos", async () => {
        const WORKOS_AUTH_CONFIG = {
            type: "sso" as const,
            partner: "workos" as const,
            organization: "test",
        };

        const WORKOS_USER = {
            object: "user" as const,
            id: "test",
            email: "test@test.com",
            emailVerified: true,
            profilePictureUrl: null,
            firstName: null,
            lastName: null,
            createdAt: "test",
            updatedAt: "test",
        };

        const authStateBadToken = await getAuthStateInternal({
            host: "docs.test.com",
            fernToken: "bad_token",
            authConfig: WORKOS_AUTH_CONFIG,
        });

        // the user is not logged in, so we'll redirect them to the login page immediately
        expect(authStateBadToken.authed).toBe(false);
        expect(authStateBadToken.ok).toBe(false);

        if (!authStateBadToken.authed) {
            const authorizationUrl = new URL(authStateBadToken.authorizationUrl ?? "http://f");

            expect(authorizationUrl.origin).toBe("https://api.workos.com");
            expect(authorizationUrl.pathname).toBe("/sso/authorize");
            expect(authorizationUrl.searchParams.get("client_id")).toBe(process.env.WORKOS_CLIENT_ID);
            expect(authorizationUrl.searchParams.get("organization")).toBe(WORKOS_AUTH_CONFIG.organization);
            expect(authorizationUrl.searchParams.get("redirect_uri")).toBe(
                "https://docs.test.com/api/fern-docs/auth/sso/callback",
            );
        }

        const getSessionFromTokenMock = vi.spyOn(session, "getSessionFromToken");
        const toSessionUserInfoMock = vi.spyOn(session, "toSessionUserInfo").mockImplementation(() =>
            Promise.resolve({
                user: WORKOS_USER,
                sessionId: "test",
                accessToken: "test",
            }),
        );

        const authStateGoodToken = await getAuthStateInternal({
            host: "localhost:3000",
            fernToken: await session.encryptSession({
                accessToken: "test",
                refreshToken: "test",
                user: WORKOS_USER,
            }),
            authConfig: WORKOS_AUTH_CONFIG,
        });

        expect(getSessionFromTokenMock).toBeCalled();
        expect(toSessionUserInfoMock).toBeCalled();

        expect(authStateGoodToken.authed).toBe(true);
        expect(authStateGoodToken.ok).toBe(true);
        getSessionFromTokenMock.mockRestore();
        toSessionUserInfoMock.mockRestore();
    });
});
