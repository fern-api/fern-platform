import { createContext, useContext } from "react";

export interface FeatureFlags {
    isApiPlaygroundEnabled: boolean;
    isApiScrollingDisabled: boolean;
    isWhitelabeled: boolean;
    isSeoDisabled: boolean;
    isTocDefaultEnabled: boolean;
}

export const FeatureFlagContext = createContext<FeatureFlags>({
    isApiPlaygroundEnabled: false,
    isApiScrollingDisabled: false,
    isWhitelabeled: false,
    isSeoDisabled: false,
    isTocDefaultEnabled: false,
});

export function useFeatureFlags(): FeatureFlags {
    return useContext(FeatureFlagContext);
}
