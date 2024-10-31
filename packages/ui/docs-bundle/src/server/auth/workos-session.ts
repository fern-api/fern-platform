import { once } from "es-toolkit/function";
import { sealData, unsealData } from "iron-session";
import { createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";
import type { AccessToken, NoWorkOSUserInfo, WorkOSSession, WorkOSUserInfo } from "./interfaces";
import { getJwtSecretKey, getWorkOSClientId, workos } from "./workos";

// This is adapted from https://github.com/workos/authkit-nextjs/blob/main/src/session.ts

async function encryptSession(session: WorkOSSession): Promise<string> {
    return sealData(session, { password: getJwtSecretKey() });
}

async function refreshSession(session: WorkOSSession): Promise<WorkOSSession | undefined> {
    try {
        const { org_id: organizationId } = decodeJwt<AccessToken>(session.accessToken);
        const { accessToken, refreshToken, user, impersonator } =
            await workos().userManagement.authenticateWithRefreshToken({
                clientId: getWorkOSClientId(),
                refreshToken: session.refreshToken,
                organizationId,
            });
        return { accessToken, refreshToken, user, impersonator };
    } catch (e) {
        return undefined;
    }
}

async function revokeSessionForToken(fern_token: string | undefined): Promise<void> {
    if (fern_token == null) {
        return undefined;
    }

    const session = await getSessionFromToken(fern_token);
    if (session == null) {
        return undefined;
    }

    const { sid: sessionId } = decodeJwt<AccessToken>(session.accessToken);
    return workos().userManagement.revokeSession({ sessionId });
}

const withJWKS = once(() => createRemoteJWKSet(new URL(workos().userManagement.getJwksUrl(getWorkOSClientId()))));

async function verifyAccessToken(accessToken: string) {
    try {
        await jwtVerify(accessToken, withJWKS());
        return true;
    } catch {
        return false;
    }
}

async function getSessionFromToken(token: string): Promise<WorkOSSession | undefined> {
    return unsealData<WorkOSSession>(token, { password: getJwtSecretKey() });
}

/**
 * Retrieves the session from the cookie. Meant for use in the middleware, for client side use `withAuth` instead.
 *
 * @returns UserInfo | NoUserInfo
 */
async function toSessionUserInfo(session?: WorkOSSession): Promise<WorkOSUserInfo | NoWorkOSUserInfo> {
    if (!session) {
        return { user: null };
    }

    if (await verifyAccessToken(session.accessToken)) {
        const {
            sid: sessionId,
            org_id: organizationId,
            role,
            permissions,
        } = decodeJwt<AccessToken>(session.accessToken);

        return {
            sessionId,
            user: session.user,
            organizationId,
            role,
            permissions,
            impersonator: session.impersonator,
            accessToken: session.accessToken,
        };
    }

    return { user: null };
}

export { encryptSession, getSessionFromToken, refreshSession, revokeSessionForToken, toSessionUserInfo };
