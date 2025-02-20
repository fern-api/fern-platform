import {
  EndpointDefinition,
  ObjectProperty,
  TypeDefinition,
} from "@fern-api/fdr-sdk/api-definition";
import { atom, useAtomValue } from "jotai";
import { useMemoOne } from "use-memo-one";
import { READ_APIS_ATOM } from "../../../atoms";
import { findEndpoint } from "../../../util/processRequestSnippetComponents";

export function useFindEndpoint(
  method: string,
  path: string,
  example: string | undefined
): EndpointDefinition | undefined {
  return useAtomValue(
    useMemoOne(
      () =>
        atom((get) => {
          let endpoint: EndpointDefinition | undefined;
          for (const apiDefinition of Object.values(get(READ_APIS_ATOM))) {
            endpoint = findEndpoint({
              apiDefinition,
              path,
              method,
              example,
            });
            if (endpoint) {
              break;
            }
          }
          return endpoint;
        }),
      [example, method, path]
    )
  );
}

export function useFindTypes(
  method: string,
  path: string
): Record<string, TypeDefinition> | undefined {
  return useAtomValue(
    useMemoOne(
      () =>
        atom((get) => {
          const apis = get(READ_APIS_ATOM);
          for (const apiDefinition of Object.values(apis)) {
            const endpoint = findEndpoint({
              apiDefinition,
              path,
              method,
              example: undefined,
            });
            if (endpoint) {
              return { ...apiDefinition.types };
            }
          }
          return {};
        }),
      [method, path]
    )
  );
}

export function useGlobalHeaders(
  method: string,
  path: string
): ObjectProperty[] | undefined {
  return useAtomValue(
    useMemoOne(
      () =>
        atom((get) => {
          const apis = get(READ_APIS_ATOM);
          for (const apiDefinition of Object.values(apis)) {
            const endpoint = findEndpoint({
              apiDefinition,
              path,
              method,
              example: undefined,
            });
            if (endpoint) {
              return apiDefinition.globalHeaders || [];
            }
          }
          return [];
        }),
      [method, path]
    )
  );
}
