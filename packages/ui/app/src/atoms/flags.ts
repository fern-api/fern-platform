import type { FeatureFlags } from "@fern-ui/fern-docs-utils";
import { isEqual } from "es-toolkit/predicate";
import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { DOCS_ATOM } from "./docs";

export const FEATURE_FLAGS_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.featureFlags, isEqual);
FEATURE_FLAGS_ATOM.debugLabel = "FEATURE_FLAGS_ATOM";

export function useFeatureFlags(): FeatureFlags {
    return useAtomValue(FEATURE_FLAGS_ATOM);
}
