import { atom, useAtomValue } from "jotai";
import { mapValues } from "lodash-es";
import { flattenRootPackage, type FlattenedRootPackage, type ResolvedRootPackage } from "../resolver/types";

export const APIS = atom<Record<string, ResolvedRootPackage>>({});
APIS.debugLabel = "APIS";

export const FLATTENED_APIS_ATOM = atom((get) => {
    return mapValues(get(APIS), flattenRootPackage);
});
FLATTENED_APIS_ATOM.debugLabel = "FLATTENED_APIS_ATOM";

export function useFlattenedApis(): Record<string, FlattenedRootPackage> {
    return useAtomValue(FLATTENED_APIS_ATOM);
}
