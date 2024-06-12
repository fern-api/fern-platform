import { Auth0ContextInterface, User } from "@auth0/auth0-react";

export function getEnvVar(name: string, fallback?: string) {
    return import.meta.env[name] ?? process?.env?.[name] ?? fallback ?? name;
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitUntil(predicate: () => boolean, timeout: number = 1000) {
    const start = Date.now();
    while (!predicate() && Date.now() - start < timeout) {
        await sleep(100);
    }
    return predicate();
}

export async function checkAuthAndThrow(auth: Auth0ContextInterface<User> | undefined) {
    if (!auth) {
        throw new Error("Auth0 context not found, this is not expected.");
    }
    const isLoaded = waitUntil(() => !auth?.isLoading);
    if (!isLoaded) {
        throw new Error("Auth0 is still loading, this is not expected.");
    }
    if (auth.error) {
        throw auth.error;
    }
    return auth.isAuthenticated;
}

export async function checkAuthSilent(auth: Auth0ContextInterface<User> | undefined): Promise<boolean> {
    if (!auth) {
        return false;
    }
    const isLoaded = waitUntil(() => !auth?.isLoading);
    if (!isLoaded) {
        return false;
    }
    if (auth.error) {
        return false;
    }
    return auth.isAuthenticated;
}
