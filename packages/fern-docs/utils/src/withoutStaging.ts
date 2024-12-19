import {
    FERN_DOCS_BUILDWITHFERN_COM,
    FERN_DOCS_STAGING_BUILDWITHFERN_COM,
} from "./constants";
import { isStagingDomain } from "./isDevelopment";

export function withoutStaging(url: string): string {
    if (isStagingDomain(url)) {
        url = url.replace(
            `.${FERN_DOCS_STAGING_BUILDWITHFERN_COM}`,
            `.${FERN_DOCS_BUILDWITHFERN_COM}`
        );
    }
    return url;
}
