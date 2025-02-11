import dynamic from "next/dynamic";

import { ErrorBoundary } from "@/components/error-boundary";

import type { FeatureProps } from "./types";

// note: this is a dynamic import because we don't want to load the LD Feature component on every page load
const LDFeature = dynamic(
  () => import("./LDFeature").then((mod) => mod.LDFeature),
  // however, we do need the default evaluation to be SSR'd
  { ssr: true }
);

// TODO: This becomes an indirection point where we can use different feature flag implementations
// with different providers depending on config
export const Feature = (props: FeatureProps): React.ReactNode => (
  <ErrorBoundary>
    <LDFeature {...props} />
  </ErrorBoundary>
);
