import { preload } from "react-dom";

import useSWR, { Fetcher, SWRConfiguration, SWRResponse } from "swr";
import useSWRImmutable from "swr/immutable";
import { z } from "zod";

import { withSkewProtection } from "../util/withSkewProtection";
import { FernDocsApiRoute, useApiRoute } from "./useApiRoute";

interface Options<T> extends SWRConfiguration<T, Error, Fetcher<T>> {
  disabled?: boolean;
  request?: RequestInit & { headers?: Record<string, string> };
  validate?: z.ZodType<T>;
  preload?: boolean;
}

function createFetcher<T>(
  init?: RequestInit & { headers?: Record<string, string> },
  validate?: z.ZodType<T>
): (url: string) => Promise<T> {
  return async (url: string): Promise<T> => {
    const request = { ...init, headers: withSkewProtection(init?.headers) };
    const r = await fetch(url, request);
    const data = await r.json();
    if (validate) {
      return validate.parse(data);
    }
    return data;
  };
}

export function useApiRouteSWR<T>(
  route: FernDocsApiRoute,
  {
    disabled,
    request,
    validate,
    preload: shouldPreload,
    ...options
  }: Options<T> = {}
): SWRResponse<T> {
  const key = useApiRoute(route);
  if (
    !disabled &&
    shouldPreload &&
    (request?.method == null || request?.method === "GET")
  ) {
    preload(key, { as: "fetch", crossOrigin: "anonymous" });
  }
  return useSWR(
    disabled ? null : key,
    createFetcher(request, validate),
    options
  );
}

export function useApiRouteSWRImmutable<T>(
  route: FernDocsApiRoute,
  {
    disabled,
    request,
    validate,
    preload: shouldPreload,
    ...options
  }: Options<T> = {}
): SWRResponse<T> {
  const key = useApiRoute(route);
  if (
    !disabled &&
    shouldPreload &&
    (request?.method == null || request?.method === "GET")
  ) {
    preload(key, { as: "fetch", crossOrigin: "anonymous" });
  }
  return useSWRImmutable(
    disabled ? null : key,
    createFetcher(request, validate),
    options
  );
}
