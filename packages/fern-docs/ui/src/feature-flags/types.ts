import type { FernNavigation } from "@fern-api/fdr-sdk";
import type { PropsWithChildren, ReactNode } from "react";

export type FeatureProps =
  PropsWithChildren<FernNavigation.FeatureFlagOptions> & {
    fallback?: ReactNode;
  };
export type WithFeatureFlagsProps =
  PropsWithChildren<FernNavigation.WithFeatureFlags> & {
    fallback?: ReactNode;
  };
