import useSWR, { Fetcher, SWRConfiguration, SWRResponse } from "swr";
import useSWRImmutable from "swr/immutable";
import { withSkewProtection } from "../util/withSkewProtection";
import { FernDocsApiRoute, useApiRoute } from "./useApiRoute";

interface Options<T> extends SWRConfiguration<T, Error, Fetcher<T>> {
    disabled?: boolean;
    request?: RequestInit;
}

function createFetcher<T>(init?: RequestInit): (url: string) => Promise<T> {
    return (url: string): Promise<T> =>
        fetch(url, { ...init, headers: withSkewProtection(init?.headers) }).then((r) => r.json());
}

export function useApiRouteSWR<T>(route: FernDocsApiRoute, options?: Options<T>): SWRResponse<T> {
    const key = useApiRoute(route);
    return useSWR(options?.disabled ? null : key, createFetcher(options?.request), options);
}

export function useApiRouteSWRImmutable<T>(route: FernDocsApiRoute, options?: Options<T>): SWRResponse<T> {
    const key = useApiRoute(route);
    return useSWRImmutable(options?.disabled ? null : key, createFetcher(options?.request), options);
}
