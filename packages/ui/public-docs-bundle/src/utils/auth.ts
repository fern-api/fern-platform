import WorkOS, { AuthorizationURLOptions } from "@workos-inc/node";

// Initialize the WorkOS client
const workos = new WorkOS(getWorkOSApiKey());

export function getWorkOS(): WorkOS {
    return workos;
}

export function getJwtTokenSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET_KEY;

    if (!secret) {
        throw new Error("JWT_SECRET_KEY is not set");
    }

    return new Uint8Array(Buffer.from(secret, "base64"));
}

export function getWorkOSApiKey(): string {
    const apiKey = process.env.WORKOS_API_KEY;

    if (!apiKey) {
        throw new Error("WORKOS_API_KEY is not set");
    }

    return apiKey;
}

export function getWorkOSClientId(): string {
    const clientId = process.env.WORKOS_CLIENT_ID;

    if (!clientId) {
        throw new Error("WORKOS_CLIENT_ID is not set");
    }

    return clientId;
}

export function getAuthorizationUrl(
    options: Omit<AuthorizationURLOptions, "provider" | "clientId" | "redirectUri"> = {},
): string {
    const redirectUri = process.env.WORKOS_REDIRECT_URI;

    if (!redirectUri) {
        throw new Error("WORKOS_REDIRECT_URI is not set");
    }

    const authorizationUrl = workos.sso.getAuthorizationUrl({
        ...options,
        provider: "authkit",
        clientId: getWorkOSClientId(),
        // The endpoint that WorkOS will redirect to after a user authenticates
        redirectUri,
    });

    return authorizationUrl;
}
