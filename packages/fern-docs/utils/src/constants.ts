export const BUILDWITHFERN_COM = "buildwithfern.com";
export const TRACK_LOAD_DOCS_PERFORMANCE = "load_docs_performance" as const;
export const COOKIE_FERN_DOCS_PREVIEW = "_fern_docs_preview" as const;
export const COOKIE_FERN_TOKEN = "fern_token" as const;
export const COOKIE_ACCESS_TOKEN = "access_token" as const; // for api key injection
export const COOKIE_REFRESH_TOKEN = "refresh_token" as const; // for api key injection
export const COOKIE_EMAIL = "email" as const; // for api key injection
export const HEADER_X_FERN_HOST = "x-fern-host" as const;
export const HEADER_X_MATCHED_PATH = "x-matched-path" as const;
export const HEADER_X_VERCEL_PROTECTION_BYPASS =
  "x-vercel-protection-bypass" as const;
/**
 * The role that is used to represent everyone (including unauthenticated users)
 */
export const EVERYONE_ROLE = "everyone" as const;

/**
 * Revalidate all cached docs within 6 days because S3 signatures expire after 7 days.
 */
export const REVALIDATE_SECONDS = 60 * 60 * 24 * 6;

/**
 * The following are domains that are used for previewing customer docs sites.
 * If the domain is `*.docs.buildwithfern.com`, it's a preview domain and SEO should be disabled.
 */
export const FERN_DOCS_PREVIEW_DOMAINS = [
  BUILDWITHFERN_COM,
  "ferndocs.com",
  "ferndocs.dev",
  "buildwithfern.dev",
  "vercel.app", // special case for Vercel preview deployments
];
export const FERN_DOCS_STAGING_BUILDWITHFERN_COM =
  "docs.staging.buildwithfern.com";
export const FERN_DOCS_DEV_BUILDWITHFERN_COM = "docs.dev.buildwithfern.com";
export const FERN_DOCS_BUILDWITHFERN_COM = "docs.buildwithfern.com";
