import useSWR from "swr";
import urljoin from "url-join";
import { useBasePath } from "../atoms";
import { APIKeyInjectionConfig } from "../auth";

export const API_KEY_INJECTION_ROUTE = "/api/fern-docs/auth/api-key-injection";

const DEFAULT = { enabled: false as const };

export function useApiKeyInjectionConfig(): APIKeyInjectionConfig {
    const basePath = useBasePath();
    const key = urljoin(basePath ?? "", API_KEY_INJECTION_ROUTE);

    const { data } = useSWR<APIKeyInjectionConfig>(
        key,
        async (url: string) => {
            const res = await fetch(url);
            return res.json();
        },
        {
            refreshInterval: (latestData) => (latestData?.enabled ? 1000 * 60 * 5 : 0), // refresh every 5 minutes
        },
    );
    return data ?? DEFAULT;
}
