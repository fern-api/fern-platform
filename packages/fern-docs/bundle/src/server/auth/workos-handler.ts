import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { removeTrailingSlash } from "next/dist/shared/lib/router/utils/remove-trailing-slash";
import urlJoin from "url-join";
import { AuthState, getWorkosRbacRoles } from "./getAuthState";
import { getWorkosSSOAuthorizationUrl } from "./workos";
import {
    encryptSession,
    getSessionFromToken,
    refreshSession,
    toSessionUserInfo,
} from "./workos-session";
import { toFernUser } from "./workos-user-to-fern-user";

interface WorkosAuthParams {
    fernToken: string | undefined;
    organization: string;
    host: string;
    pathname?: string;
    setFernToken?: (token: string) => void;
    authorizationUrl?: {
        connection?: string;
        provider?: string;
        domainHint?: string;
        loginHint?: string;
    };
}

export async function handleWorkosAuth({
    fernToken,
    organization,
    host,
    pathname,
    setFernToken,
    authorizationUrl,
}: WorkosAuthParams): Promise<AuthState> {
    const state = urlJoin(
        removeTrailingSlash(withDefaultProtocol(host)),
        pathname ?? ""
    );
    const session =
        fernToken != null ? await getSessionFromToken(fernToken) : undefined;
    const workosUserInfo = await toSessionUserInfo(session);

    if (workosUserInfo.user) {
        const roles = await getWorkosRbacRoles(
            organization,
            workosUserInfo.user.email
        );
        return {
            authed: true,
            ok: true,
            user: toFernUser(workosUserInfo, roles),
            partner: "workos",
        };
    }

    if (session?.refreshToken) {
        const updatedSession = await refreshSession(session);
        if (updatedSession) {
            if (setFernToken) {
                setFernToken(await encryptSession(updatedSession));
            }
            const roles = await getWorkosRbacRoles(
                organization,
                updatedSession.user.email
            );
            return {
                authed: true,
                ok: true,
                user: toFernUser(
                    await toSessionUserInfo(updatedSession),
                    roles
                ),
                partner: "workos",
            };
        }
    }

    const redirectUri = String(
        new URL(
            "/api/fern-docs/auth/sso/callback",
            withDefaultProtocol(process.env.NEXT_PUBLIC_CDN_URI ?? host)
        )
    );
    const authorizationUrlParams = getWorkosSSOAuthorizationUrl({
        redirectUri,
        organization,
        state,
        ...authorizationUrl,
    });

    return {
        authed: false,
        ok: false,
        authorizationUrl: authorizationUrlParams,
        partner: "workos",
    };
}
