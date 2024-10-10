import type { APIKeyInjectionConfig } from "@fern-ui/fern-docs-auth";
import useSWR from "swr";
import { useApiRoute } from "../hooks/useApiRoute";

const DEFAULT = { enabled: false as const };

export function useApiKeyInjectionConfig(): APIKeyInjectionConfig {
    const key = useApiRoute("/api/fern-docs/auth/api-key-injection");
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
