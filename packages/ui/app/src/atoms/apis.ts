import { FernNavigation } from "@fern-api/fdr-sdk";
import { atom, useAtomValue } from "jotai";
import { mapValues } from "lodash-es";
import { useMemoOne } from "use-memo-one";
import { flattenRootPackage, type FlattenedRootPackage, type ResolvedRootPackage } from "../resolver/types";
import { FEATURE_FLAGS_ATOM } from "./flags";
import { RESOLVED_API_DEFINITION_ATOM, RESOLVED_PATH_ATOM } from "./navigation";

export const APIS_ATOM = atom<Record<string, ResolvedRootPackage>>({});
APIS_ATOM.debugLabel = "APIS_ATOM";

export const FLATTENED_APIS_ATOM = atom((get) => {
    return mapValues(get(APIS_ATOM), flattenRootPackage);
});
FLATTENED_APIS_ATOM.debugLabel = "FLATTENED_APIS_ATOM";

export function useFlattenedApis(): Record<string, FlattenedRootPackage> {
    return useAtomValue(FLATTENED_APIS_ATOM);
}

const IS_API_REFERENCE_PAGINATED = atom<boolean>((get) => {
    let isApiScrollingDisabled = get(FEATURE_FLAGS_ATOM).isApiScrollingDisabled;
    const resolvedPath = get(RESOLVED_PATH_ATOM);
    if (resolvedPath.type === "api-page" && resolvedPath.disableLongScrolling) {
        isApiScrollingDisabled = true;
    }
    return isApiScrollingDisabled;
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
