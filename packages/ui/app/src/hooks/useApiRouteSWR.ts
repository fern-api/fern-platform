import useSWR, { Fetcher, SWRConfiguration, SWRResponse } from "swr";
import useSWRImmutable from "swr/immutable";
import { withSkewProtection } from "../util/withSkewProtection";
import { FernDocsApiRoute, useApiRoute } from "./useApiRoute";

interface Options<T> extends SWRConfiguration<T, Error, Fetcher<T>> {
    disabled?: boolean;
    request?: RequestInit & { headers?: Record<string, string> };
}

function createFetcher<T>(init?: RequestInit & { headers?: Record<string, string> }): (url: string) => Promise<T> {
    return async (url: string): Promise<T> => {
        const request = { ...init, headers: withSkewProtection(init?.headers) };
        const r = await fetch(url, request);
        return await r.json();
    };
}

export function useApiRouteSWR<T>(route: FernDocsApiRoute, options?: Options<T>): SWRResponse<T> {
    const key = useApiRoute(route);
    return useSWR(options?.disabled ? null : key, createFetcher(options?.request), options);
}

export function useApiRouteSWRImmutable<T>(route: FernDocsApiRoute, options?: Options<T>): SWRResponse<T> {
    const key = useApiRoute(route);
    return useSWRImmutable(options?.disabled ? null : key, createFetcher(options?.request), options);
}
