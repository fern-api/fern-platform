import { createContext, useContext } from "react";

export interface FeatureFlags {
    isApiPlaygroundEnabled: boolean;
    isApiScrollingDisabled: boolean;
    isWhitelabeled: boolean;
    isSeoDisabled: boolean;
    isTocDefaultEnabled: boolean;
    isSnippetTemplatesEnabled: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
    isApiPlaygroundEnabled: false,
    isApiScrollingDisabled: false,
    isWhitelabeled: false,
    isSeoDisabled: false,
    isTocDefaultEnabled: false,
    isSnippetTemplatesEnabled: false,
};

export const FeatureFlagContext = createContext<FeatureFlags>(DEFAULT_FEATURE_FLAGS);

export function useFeatureFlags(): FeatureFlags {
    return useContext(FeatureFlagContext);
}
