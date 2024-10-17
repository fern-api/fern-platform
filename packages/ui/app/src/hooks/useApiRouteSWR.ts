import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
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
    return useSWRImmutable([options?.disabled ? null : key], createFetcher(options?.request), options);
}

// TODO: this fetcher is a little bit precarious, since it's not type-safe and was created hastily to resolve a specific issue. should be refactored.
// context: sometimes forward proxies will decode %2F to /, which will cause the api endpoint to not match the correct route.
// in that case, we needed to change the "GET" request to a "POST" request to get the correct endpoint.
export function useApiDefinitionSWR(
    api: string | undefined,
    endpointId: string | undefined,
    type: "endpoint" | "websocket" | "webhook",
    options?: Options<ApiDefinition.ApiDefinition>,
): SWRResponse<ApiDefinition.ApiDefinition> {
    const route = useApiRoute("/api/fern-docs/api-definition");
    const searchParams = new URLSearchParams();
    searchParams.set("api", api ?? "");
    searchParams.set(type, endpointId ?? "");
    const url = `${route}?${searchParams.toString()}`;
    return useSWRImmutable(
        options?.disabled || api == null || endpointId == null ? null : url,
        createFetcher<ApiDefinition.ApiDefinition>(options?.request),
        options,
    );
}
