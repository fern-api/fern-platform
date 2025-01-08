import { LDProvider, useLDClient } from "launchdarkly-react-client-sdk";
import { FC, ReactNode, useEffect } from "react";

interface Props {
  clientSideId: string;
  userContextEndpoint: string;
  children: ReactNode;
}

export const LDFeatureFlagProvider: FC<Props> = ({
  clientSideId,
  userContextEndpoint,
  children,
}) => {
  return (
    <LDProvider clientSideID={clientSideId}>
      <IdentifyWrapper userContextEndpoint={userContextEndpoint}>
        {children}
      </IdentifyWrapper>
    </LDProvider>
  );
};

const IdentifyWrapper = ({
  children,
  userContextEndpoint,
}: {
  children: ReactNode;
  userContextEndpoint: string;
}) => {
  const ldClient = useLDClient();

  useEffect(() => {
    // TODO: have this context be set in page props maybe?
    const getAndSetLdContext = async () => {
      // TODO: switch from fetch to useApiRouteSWR
      const response = await fetch(userContextEndpoint);
      const data = await response.json();
      void ldClient?.identify(data);
    };

    void getAndSetLdContext();
  }, [userContextEndpoint, ldClient]);

  return <>{children}</>;
};
