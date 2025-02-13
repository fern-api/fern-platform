"use client";

import dynamic from "next/dynamic";

import { FeatureFlagsConfig } from "@/state/feature-flags";

const LDFeatureFlagProvider = dynamic(
  () =>
    import("./LDFeatureFlagProvider").then((mod) => mod.LDFeatureFlagProvider),
  { ssr: true } // ssr must be true otherwise the entire tree will not be rendered server-side
);

interface FeatureFlagProviderProps {
  featureFlagsConfig: FeatureFlagsConfig | undefined;
  children: React.ReactNode;
}

export function FeatureFlagProvider({
  featureFlagsConfig,
  children,
}: FeatureFlagProviderProps) {
  const launchDarklyInfo = featureFlagsConfig?.launchDarkly;

  if (!launchDarklyInfo) {
    return children;
  }

  return (
    <LDFeatureFlagProvider
      clientSideId={launchDarklyInfo.clientSideId}
      contextEndpoint={launchDarklyInfo.contextEndpoint}
      defaultContext={launchDarklyInfo.context}
      defaultFlags={launchDarklyInfo.defaultFlags}
      options={launchDarklyInfo.options}
    >
      {children}
    </LDFeatureFlagProvider>
  );
}
