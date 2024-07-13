import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { isEqual } from "lodash-es";
import { DOCS_ATOM } from "./docs";
import { FeatureFlags } from "./types";

export const FEATURE_FLAGS_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.featureFlags, isEqual);

export function useFeatureFlags(): FeatureFlags {
    return useAtomValue(FEATURE_FLAGS_ATOM);
}
