import dynamic from "next/dynamic";
import { FC, ReactNode } from "react";
import { FeatureFlagsConfig } from "../atoms";

const LDFeatureFlagProvider = dynamic(
  () =>
    import("./LDFeatureFlagProvider").then((mod) => mod.LDFeatureFlagProvider),
  { ssr: false }
);

interface FeatureFlagProviderProps {
  featureFlagsConfig: FeatureFlagsConfig | undefined;
  children: ReactNode;
}

export const FeatureFlagProvider: FC<FeatureFlagProviderProps> = ({
  featureFlagsConfig,
  children,
}) => {
  const launchDarklyInfo = featureFlagsConfig?.launchDarkly;

  if (!launchDarklyInfo) {
    return children;
  }

  return (
    <LDFeatureFlagProvider
      clientSideId={launchDarklyInfo.clientSideId}
      contextEndpoint={launchDarklyInfo.contextEndpoint}
      defaultContext={launchDarklyInfo.context}
    >
      {children}
    </LDFeatureFlagProvider>
  );
};
