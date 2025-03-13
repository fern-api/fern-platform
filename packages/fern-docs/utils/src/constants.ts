export const BUILDWITHFERN_COM = "buildwithfern.com";
export const TRACK_LOAD_DOCS_PERFORMANCE = "load_docs_performance";
export const COOKIE_FERN_DOCS_PREVIEW = "_fern_docs_preview";
export const COOKIE_FERN_TOKEN = "fern_token";
export const COOKIE_ACCESS_TOKEN = "access_token"; // for api key injection
export const COOKIE_REFRESH_TOKEN = "refresh_token"; // for api key injection
export const COOKIE_EMAIL = "email"; // for api key injection
export const HEADER_HOST = "host";
export const HEADER_X_FERN_HOST = "x-fern-host";
export const HEADER_X_FERN_BASEPATH = "x-fern-basepath";
export const HEADER_X_FORWARDED_HOST = "x-forwarded-host";
export const HEADER_X_MATCHED_PATH = "x-matched-path";
export const HEADER_X_VERCEL_PROTECTION_BYPASS = "x-vercel-protection-bypass";
export const HEADER_X_VERCEL_SIGNATURE = "x-vercel-signature";

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

/**
 * Layout constants
 *
 * Note: content page width = 40rem is agressive, but it's close to the ~65ch rule of thumb for web typography
 * Most pages will be 40rem. overview pages are 150% (60rem), and endpoint pages are 200% (80rem) to account for 2 columns.
 */
export const DEFAULT_LOGO_HEIGHT = 20; // 1.25rem
export const DEFAULT_SIDEBAR_WIDTH = 288; // 18rem
export const DEFAULT_GUTTER_WIDTH = 32; // 2rem
export const DEFAULT_HEADER_HEIGHT = 64; // 4rem
export const DEFAULT_PAGE_WIDTH = 1_408; // 88rem
export const DEFAULT_CONTENT_WIDTH = 640; // 40rem

export const FERN_COLOR_ACCENT = "oklch(62.42% 0.1929 143.94)";
export const FERN_COLOR_AIR = "oklch(99.56% 0.0078 139.44)";
export const FERN_COLOR_GROUND = "oklch(16.16% 0.021 144.53)";
