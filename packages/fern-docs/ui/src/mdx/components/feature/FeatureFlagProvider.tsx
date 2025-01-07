import dynamic from "next/dynamic";
import { FC, ReactNode } from "react";
import { DocsProps } from "../../..";

const LDFeatureFlagProvider = dynamic(() =>
  import("./LDFeatureFlagProvider").then((mod) => mod.LDFeatureFlagProvider)
);

interface FeatureFlagProviderProps {
  pageProps: DocsProps | undefined;
  children: ReactNode;
}

export const FeatureFlagProvider: FC<FeatureFlagProviderProps> = ({
  pageProps,
  children,
}) => {
  const ldClientSideId = pageProps?.featureFlags?.launchDarkly?.clientSideId;

  if (!ldClientSideId) {
    return <>{children}</>;
  }

  return (
    <LDFeatureFlagProvider clientSideId={ldClientSideId}>
      {children}
    </LDFeatureFlagProvider>
  );
};
