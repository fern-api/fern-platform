import "server-only";

export function algoliaAppId(): string {
    return getEnvVariable("ALGOLIA_APP_ID");
}

export function algoliaWriteApiKey(): string {
    return getEnvVariable("ALGOLIA_WRITE_API_KEY");
}

export function algoliaSearchApikey(): string {
    return getEnvVariable("ALGOLIA_SEARCH_API_KEY");
}

export function fernToken(): string {
    return getEnvVariable("FERN_TOKEN");
}

export function fdrEnvironment(): string {
    return getEnvVariable("FDR_ENVIRONMENT");
}

function assertNonNullable<T>(value: T, key: string): asserts value is NonNullable<T> {
    if (value == null) {
        throw new Error(`${key} is not defined`);
    }
}

function getEnvVariable(key: string) {
    const env = process.env[key];
    assertNonNullable(env, key);
    return env;
}
