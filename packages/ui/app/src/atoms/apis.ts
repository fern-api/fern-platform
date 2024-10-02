import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { join } from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { atom, useAtomValue } from "jotai";
import { atomFamily } from "jotai/utils";
import { mapValues } from "lodash-es";
import { useMemoOne } from "use-memo-one";
import { flattenRootPackage, type FlattenedRootPackage, type ResolvedRootPackage } from "../resolver/types";
import { FEATURE_FLAGS_ATOM } from "./flags";
import { RESOLVED_API_DEFINITION_ATOM, RESOLVED_PATH_ATOM } from "./navigation";

const SETTABLE_APIS_ATOM = atom<Record<ApiDefinition.ApiDefinitionId, ApiDefinition.ApiDefinition>>({});
SETTABLE_APIS_ATOM.debugLabel = "SETTABLE_APIS_ATOM";

export const WRITE_API_DEFINITION_ATOM = atom(null, (_get, set, apiDefinition: ApiDefinition.ApiDefinition) => {
    const merge = (prev: ApiDefinition.ApiDefinition | undefined) => {
        if (prev == null) {
            return apiDefinition;
        } else {
            return join(prev, apiDefinition);
        }
    };
    set(SETTABLE_APIS_ATOM, (prev) => ({ ...prev, [apiDefinition.id]: merge(prev[apiDefinition.id]) }));
});

export const getApiDefinitionAtom = atomFamily((apiDefinitionId: ApiDefinition.ApiDefinitionId | undefined) =>
    atom((get) => (apiDefinitionId != null ? get(SETTABLE_APIS_ATOM)[apiDefinitionId] : undefined)),
);

/**
 * @deprecated
 */
export const DEPRECATED_APIS_ATOM = atom<Record<string, ResolvedRootPackage>>({});
DEPRECATED_APIS_ATOM.debugLabel = "DEPRECATED_APIS_ATOM";

/**
 * @deprecated
 */
export const DEPRECATED_FLATTENED_APIS_ATOM = atom((get) => {
    return mapValues(get(DEPRECATED_APIS_ATOM), flattenRootPackage);
});
DEPRECATED_FLATTENED_APIS_ATOM.debugLabel = "DEPRECATED_FLATTENED_APIS_ATOM";

/**
 * @deprecated
 */
export function useDeprecatedFlattenedApis(): Record<string, FlattenedRootPackage> {
    return useAtomValue(DEPRECATED_FLATTENED_APIS_ATOM);
}

/**
 * @deprecated
 */
export function useDeprecatedFlattenedApi(apiId: string): FlattenedRootPackage | undefined {
    return useAtomValue(useMemoOne(() => atom((get) => get(DEPRECATED_FLATTENED_APIS_ATOM)[apiId]), [apiId]));
}

const IS_API_REFERENCE_PAGINATED = atom<boolean>((get) => {
    const content = get(RESOLVED_PATH_ATOM);
    if (content.type === "api-endpoint-page") {
        return true;
    }
    return get(FEATURE_FLAGS_ATOM).isApiScrollingDisabled;
});

export function useIsApiReferencePaginated(): boolean {
    return useAtomValue(IS_API_REFERENCE_PAGINATED);
}

export function useIsApiReferenceShallowLink(node: FernNavigation.WithApiDefinitionId): boolean {
    return useAtomValue(
        useMemoOne(
            () =>
                atom((get) => {
                    const isPaginated = get(IS_API_REFERENCE_PAGINATED);
                    const resolvedApi = get(RESOLVED_API_DEFINITION_ATOM);
                    return !isPaginated && resolvedApi === node.apiDefinitionId;
                }),
            [node.apiDefinitionId],
        ),
    );
}
