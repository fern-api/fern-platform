export function algoliaAppId() {
    return getEnvVariable("ALGOLIA_APP_ID");
}

export function algoliaAdminApiKey() {
    return getEnvVariable("ALGOLIA_ADMIN_API_KEY");
}

export function algoliaSearchApikey() {
    return getEnvVariable("ALGOLIA_SEARCH_API_KEY");
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
