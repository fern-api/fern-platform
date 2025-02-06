import { removeTrailingSlash } from "@fern-docs/utils";
import urlJoin from "url-join";
import { AuthState, getWorkosRbacRoles } from "./getAuthState";
import { getOrigin } from "./origin";
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
  pathname,
  setFernToken,
  authorizationUrl,
}: WorkosAuthParams): Promise<AuthState> {
  const origin = getOrigin();
  const state = urlJoin(removeTrailingSlash(origin), pathname ?? "");
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
        user: toFernUser(await toSessionUserInfo(updatedSession), roles),
        partner: "workos",
      };
    }
  }

  const redirectUri = String(
    new URL("/api/fern-docs/auth/sso/callback", origin)
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
