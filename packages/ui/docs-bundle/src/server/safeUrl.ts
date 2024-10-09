import { withDefaultProtocol } from "@fern-api/ui-core-utils";

export function safeUrl(url: string | null | undefined): string | undefined {
    if (url == null) {
        return undefined;
    }

    url = withDefaultProtocol(url);

    try {
        new URL(url);
        return url;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return undefined;
    }
}
