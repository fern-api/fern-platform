import { atom, useAtomValue } from "jotai";
import { mapValues } from "lodash-es";
import { flattenRootPackage, type FlattenedRootPackage, type ResolvedRootPackage } from "../resolver/types";

export const APIS = atom<Record<string, ResolvedRootPackage>>({});

export const FLATTENED_APIS_ATOM = atom((get) => {
    return mapValues(get(APIS), flattenRootPackage);
});

export function useFlattenedApis(): Record<string, FlattenedRootPackage> {
    return useAtomValue(FLATTENED_APIS_ATOM);
}
