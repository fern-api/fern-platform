import type { FernNavigation } from "@fern-api/fdr-sdk";
import type { PropsWithChildren } from "react";

export type FeatureProps = PropsWithChildren<FernNavigation.FeatureFlagOptions>;
export type WithFeatureFlagsProps =
  PropsWithChildren<FernNavigation.WithFeatureFlags>;
