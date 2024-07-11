/* eslint-disable react-hooks/rules-of-hooks */
import useSWR from "swr";
import urljoin from "url-join";
import { useBasePath } from "../atoms/navigation";

export function useApiKeyInjectionEnabled(): string | undefined {
    const basePath = useBasePath();
    const key = urljoin(basePath ?? "", "/api/fern-docs/auth/api-key-injection");

    const { data } = useSWR<false | string>(key, async (url: string) => {
        const res = await fetch(url);
        return res.json();
    });
    if (data === false) {
        return undefined;
    }
    return data;
}
