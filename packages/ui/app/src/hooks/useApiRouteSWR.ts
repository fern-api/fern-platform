import useSWR, { Fetcher, SWRConfiguration, SWRResponse } from "swr";
import useSWRImmutable from "swr/immutable";
import { withSkewProtection } from "../util/withSkewProtection";
import { FernDocsApiRoute, useApiRoute } from "./useApiRoute";

export function useApiRouteSWR<T>(
    route: FernDocsApiRoute,
    options?: SWRConfiguration<T, Error, Fetcher<T>> & { disabled?: boolean },
): SWRResponse<T> {
    const key = useApiRoute(route);
    return useSWR(
        options?.disabled ? null : key,
        (url): Promise<T> => fetch(url, { headers: withSkewProtection() }).then((r) => r.json()),
        options,
    );
}

export function useApiRouteSWRImmutable<T>(
    route: FernDocsApiRoute,
    options?: SWRConfiguration<T, Error, Fetcher<T>> & { disabled?: boolean },
): SWRResponse<T> {
    const key = useApiRoute(route);
    return useSWRImmutable(
        options?.disabled ? null : key,
        (url): Promise<T> => fetch(url, { headers: withSkewProtection() }).then((r) => r.json()),
        options,
    );
}
