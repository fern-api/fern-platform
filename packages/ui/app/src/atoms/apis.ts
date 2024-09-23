import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { atom, useAtomValue } from "jotai";
import { useMemoOne } from "use-memo-one";
import { FEATURE_FLAGS_ATOM } from "./flags";
import { RESOLVED_API_DEFINITION_ATOM, RESOLVED_PATH_ATOM } from "./navigation";

export const APIS_ATOM = atom<Record<string, ApiDefinition.ApiDefinition>>({});
APIS_ATOM.debugLabel = "APIS_ATOM";

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
