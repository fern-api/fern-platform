type EnvironmentConfig = {
    algoliaAppId: string;
    /**
     * This is used by the legacy search system.
     */
    algoliaApiKey: string;

    algoliaSearchIndex: string;
};

export function getEnvConfig(): EnvironmentConfig {
    if (process.env.NEXT_PUBLIC_ALGOLIA_APP_ID == null) {
        throw new Error('Missing environment variable "NEXT_PUBLIC_ALGOLIA_APP_ID"');
    }

    if (process.env.NEXT_PUBLIC_ALGOLIA_API_KEY == null) {
        throw new Error('Missing environment variable "NEXT_PUBLIC_ALGOLIA_API_KEY"');
    }

    if (process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_INDEX == null) {
        throw new Error('Missing environment variable "NEXT_PUBLIC_ALGOLIA_SEARCH_INDEX"');
    }

    return {
        algoliaAppId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
        algoliaApiKey: process.env.NEXT_PUBLIC_ALGOLIA_API_KEY,
        algoliaSearchIndex: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_INDEX,
    };
}
