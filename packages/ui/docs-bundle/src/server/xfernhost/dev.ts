import { withDefaultProtocol } from "@fern-api/ui-core-utils";

/**
 * Note: NEXT_PUBLIC_DOCS_DOMAIN is used for local development only.
 */
export function getNextPublicDocsDomain(): string | undefined {
    try {
        const domain = process.env.NEXT_PUBLIC_DOCS_DOMAIN;

        if (domain == null) {
            return undefined;
        }

        return new URL(withDefaultProtocol(domain)).host;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return undefined;
    }
}
