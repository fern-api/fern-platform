import { FERN_DOCS_DEV_BUILDWITHFERN_COM, FERN_DOCS_STAGING_BUILDWITHFERN_COM } from "./constants";

export function isDevelopment(host: string): boolean {
    if (process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV !== "production") {
        return true;
    }

    if (isStagingDomain(host) || isDevDomain(host)) {
        return true;
    }

    return false;
}

export function isStagingDomain(host: string): boolean {
    return host.endsWith(`.${FERN_DOCS_STAGING_BUILDWITHFERN_COM}`);
}

export function isDevDomain(host: string): boolean {
    return host.endsWith(`.${FERN_DOCS_DEV_BUILDWITHFERN_COM}`);
}
