import type { FeatureFlags } from "@fern-ui/fern-docs-utils";
import { isEqual } from "es-toolkit/predicate";
import { atom, useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { useMemoOne } from "use-memo-one";
import { DOCS_ATOM } from "./docs";

export const FEATURE_FLAGS_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.featureFlags, isEqual);
FEATURE_FLAGS_ATOM.debugLabel = "FEATURE_FLAGS_ATOM";

export function useFeatureFlags(): FeatureFlags {
    return useAtomValue(FEATURE_FLAGS_ATOM);
}

export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
    return useAtomValue(useMemoOne(() => atom((get) => !!get(FEATURE_FLAGS_ATOM)[flag]), [flag]));
}
