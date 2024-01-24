import WorkOS, { AuthorizationURLOptions } from "@workos-inc/node";
import { AuthOptions } from "next-auth";
import WorkOSProvider from "next-auth/providers/workos";

// Initialize the WorkOS client
export const workos = new WorkOS(getWorkOSApiKey());

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
    options: Omit<AuthorizationURLOptions, "provider" | "clientId" | "redirectUri"> = {}
): string {
    const redirectUri = process.env.WORKOS_REDIRECT_URI;

    if (!redirectUri) {
        throw new Error("WORKOS_REDIRECT_URI is not set");
    }

    const authorizationUrl = workos.userManagement.getAuthorizationUrl({
        ...options,
        provider: "authkit",
        clientId: getWorkOSClientId(),
        // The endpoint that WorkOS will redirect to after a user authenticates
        redirectUri,
    });

    return authorizationUrl;
}

export const authOptions: AuthOptions = {
    providers: [
        WorkOSProvider({
            clientId: getWorkOSClientId(),
            clientSecret: getWorkOSApiKey(),
            client: {
                token_endpoint_auth_method: "client_secret_post",
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    debug: true,
};

// export async function getUser(): Promise<{
//     isAuthenticated: boolean;
//     user?: User | null;
// }> {
//     const token = cookies().get("token")?.value;
//     const verifiedToken = token && (await verifyJwtToken(token));

//     if (verifiedToken) {
//         return {
//             isAuthenticated: true,
//             user: verifiedToken.user as User | null,
//         };
//     }

//     return { isAuthenticated: false };
// }

// export async function clearCookie(): Promise<void> {
//     cookies().delete("token");
//     redirect("/");
// }
