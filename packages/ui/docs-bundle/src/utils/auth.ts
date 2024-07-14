import WorkOS, { AuthorizationURLOptions } from "@workos-inc/node";

// Initialize the WorkOS client
const workos = new WorkOS(getWorkOSApiKey());

export function getWorkOS(): WorkOS {
    return workos;
}

export function getWorkOSApiKey(): string {
    const apiKey = process.env.WORKOS_API_KEY;

    if (apiKey != null) {
        return apiKey;
    }

    throw new Error("WORKOS_API_KEY is not set");
}

export function getWorkOSClientId(): string {
    const clientId = process.env.WORKOS_CLIENT_ID;

    if (clientId != null) {
        return clientId;
    }

    throw new Error("WORKOS_CLIENT_ID is not set");
}

export function getAuthorizationUrl(
    options: Omit<AuthorizationURLOptions, "provider" | "clientId" | "redirectUri"> = {},
    xFernHost: string,
): string {
    const redirectUri =
        process.env.NODE_ENV === "development"
            ? "http://localhost:3000/api/fern-docs/auth/callback"
            : `https://${xFernHost}/api/fern-docs/auth/callback`;

    const authorizationUrl = workos.sso.getAuthorizationUrl({
        ...options,
        provider: "authkit",
        clientId: getWorkOSClientId(),
        // The endpoint that WorkOS will redirect to after a user authenticates
        redirectUri,
    });

    return authorizationUrl;
}
