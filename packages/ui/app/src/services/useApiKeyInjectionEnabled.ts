/* eslint-disable react-hooks/rules-of-hooks */
import useSWR from "swr";
import urljoin from "url-join";
import { useBasePath } from "../atoms/navigation";

export function useApiKeyInjectionEnabled(): string | undefined {
    const basePath = useBasePath();
    const key = urljoin(basePath ?? "", "/api/fern-docs/api-key-injection-enabled");

    const { data } = useSWR<false | string>(key, async (url: string) => {
        const res = await fetch(url);
        return res.json();
    });
    if (data === false) {
        return undefined;
    }
    return data;
}

export function getAuthLocationWithState(location: string): string | undefined {
    try {
        const url = new URL(location);
        url.searchParams.set("state", encodeURIComponent(window.location.href));
        return url.toString();
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return undefined;
    }
}
