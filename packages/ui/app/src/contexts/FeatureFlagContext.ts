import { createContext, useContext } from "react";

export interface FeatureFlags {
    isApiPlaygroundEnabled: boolean;
    isApiScrollingDisabled: boolean;
    isWhitelabeled: boolean;
    isSeoDisabled: boolean;
    isTocDefaultEnabled: boolean;
}

export const FEATURE_FLAG: FeatureFlags = {
    isApiPlaygroundEnabled: false,
    isApiScrollingDisabled: false,
    isWhitelabeled: false,
    isSeoDisabled: false,
    isTocDefaultEnabled: false,
};

export const FeatureFlagContext = createContext<FeatureFlags>(FEATURE_FLAG);

export function useFeatureFlags(): FeatureFlags {
    return useContext(FeatureFlagContext);
}
