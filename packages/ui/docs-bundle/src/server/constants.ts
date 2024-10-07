export const TRACK_LOAD_DOCS_PERFORMANCE = "load_docs_performance" as const;
export const COOKIE_FERN_DOCS_PREVIEW = "_fern_docs_preview" as const;
export const COOKIE_FERN_TOKEN = "fern_token" as const;
export const COOKIE_ACCESS_TOKEN = "access_token" as const; // for api key injection
export const COOKIE_REFRESH_TOKEN = "refresh_token" as const; // for api key injection
export const HEADER_X_FERN_HOST = "x-fern-host" as const;

/**
 * Revalidate all cached docs within 6 days because S3 signatures expire after 7 days.
 */
export const REVALIDATE_SECONDS = 60 * 60 * 24 * 6;
