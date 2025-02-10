import type { APIKeyInjectionConfig } from "@fern-docs/auth";

import { useApiRouteSWR } from "../hooks/useApiRouteSWR";

const DEFAULT = { enabled: false as const, returnToQueryParam: "state" };

export function useApiKeyInjectionConfig(): APIKeyInjectionConfig {
  const { data } = useApiRouteSWR<APIKeyInjectionConfig>(
    "/api/fern-docs/auth/api-key-injection",
    {
      refreshInterval: (latestData) =>
        latestData?.enabled ? 1000 * 60 * 5 : 0, // refresh every 5 minutes
    }
  );
  return data ?? DEFAULT;
}
