import dynamic from "next/dynamic";
import React from "react";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { WithFeatureFlagsProps } from "./types";

// note: this is a dynamic import because we don't want to load the LD Feature component on every page load
const LDFeatures = dynamic(
  () => import("./LDFeature").then((mod) => mod.LDFeatures),
  // however, we do need the default evaluation to be SSR'd
  { ssr: true }
);

export const WithFeatureFlags: React.FC<WithFeatureFlagsProps> = ({
  featureFlags,
  children,
}) => {
  // do not import LDFeatures if there are no feature flags
  if (!featureFlags?.length) {
    return children;
  }

  return (
    <FernErrorBoundary>
      <LDFeatures featureFlags={featureFlags}>{children}</LDFeatures>
    </FernErrorBoundary>
  );
};
