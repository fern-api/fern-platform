import { useEffect } from "react";

import { atom, useSetAtom } from "jotai";
import { atomFamily } from "jotai/utils";

import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { joiner } from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { useIsLocalPreview } from "../contexts/local-preview";

const SETTABLE_APIS_ATOM = atom<
  Record<ApiDefinition.ApiDefinitionId, ApiDefinition.ApiDefinition>
>({});
SETTABLE_APIS_ATOM.debugLabel = "SETTABLE_APIS_ATOM";

export const WRITE_API_DEFINITION_ATOM = atom(
  null,
  (_get, set, apiDefinition: ApiDefinition.ApiDefinition, force?: boolean) => {
    set(SETTABLE_APIS_ATOM, (prev) => {
      const prevDefinition = prev[apiDefinition.id];
      if (prevDefinition == null) {
        return { ...prev, [apiDefinition.id]: apiDefinition };
      }
      const merged = joiner(force)(prevDefinition, apiDefinition);
      if (merged === prevDefinition) {
        return prev;
      }
      return { ...prev, [apiDefinition.id]: merged };
    });
  }
);

export function useWriteApiDefinitionAtom(
  api: ApiDefinition.ApiDefinition | undefined
): void {
  const isLocalPreview = useIsLocalPreview();
  const set = useSetAtom(WRITE_API_DEFINITION_ATOM);
  useEffect(() => {
    if (api != null) {
      set(api, isLocalPreview);
    }
  }, [api, set, isLocalPreview]);
}

export function useWriteApiDefinitionsAtom(
  apis: Record<ApiDefinition.ApiDefinitionId, ApiDefinition.ApiDefinition>
): void {
  const isLocalPreview = useIsLocalPreview();
  const set = useSetAtom(WRITE_API_DEFINITION_ATOM);
  useEffect(() => {
    Object.values(apis).forEach((api) => {
      set(api, isLocalPreview);
    });
  }, [apis, isLocalPreview, set]);
}

export const READ_APIS_ATOM = atom((get) => get(SETTABLE_APIS_ATOM));

export const getApiDefinitionAtom = atomFamily(
  (apiDefinitionId: ApiDefinition.ApiDefinitionId | undefined) =>
    atom((get) =>
      apiDefinitionId != null
        ? get(SETTABLE_APIS_ATOM)[apiDefinitionId]
        : undefined
    )
);

export function useIsApiReferencePaginated(): boolean {
  // return useAtomValue(IS_API_REFERENCE_PAGINATED);
  return true;
}

export function useIsApiReferenceShallowLink(
  _node: FernNavigation.WithApiDefinitionId
): boolean {
  return false;
}

export const ENDPOINT_ID_TO_SLUG_ATOM = atom<
  Record<FernNavigation.EndpointId, FernNavigation.Slug>
>((_get) => {
  // const { content } = get(DOCS_ATOM);
  // if (content.type === "markdown-page") {
  //   return content.endpointIdsToSlugs;
  // }
  return {};
});
