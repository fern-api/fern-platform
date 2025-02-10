import type { PropsWithChildren } from "react";

import type { FernNavigation } from "@fern-api/fdr-sdk";

export type FeatureProps = PropsWithChildren<FernNavigation.FeatureFlagOptions>;
export type WithFeatureFlagsProps =
  PropsWithChildren<FernNavigation.WithFeatureFlags>;
