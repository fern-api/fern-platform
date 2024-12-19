import { withDefaultProtocol } from "@fern-api/ui-core-utils";

export function safeUrl(url: string | null | undefined): URL | undefined {
    if (url == null) {
        return undefined;
    }

    url = withDefaultProtocol(url);

    try {
        return new URL(url);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return undefined;
    }
}
