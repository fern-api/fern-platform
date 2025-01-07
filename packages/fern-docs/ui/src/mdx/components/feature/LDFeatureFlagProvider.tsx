import { LDProvider, useLDClient } from "launchdarkly-react-client-sdk";
import { FC, ReactNode, useEffect } from "react";

interface Props {
  clientSideId: string;
  children: ReactNode;
}

export const LDFeatureFlagProvider: FC<Props> = ({
  clientSideId,
  children,
}) => {
  return (
    <LDProvider clientSideID={clientSideId}>
      <IdentifyWrapper>{children}</IdentifyWrapper>
    </LDProvider>
  );
};

const IdentifyWrapper = ({ children }: { children: ReactNode }) => {
  const ldClient = useLDClient();

  useEffect(() => {
    // TODO: have this context be set in page props maybe?
    const getAndSetLdContext = async () => {
      // TODO: switch from fetch to useApiRouteSWR
      const response = await fetch("/api/fern-docs/integrations/launchdarkly");
      const data = await response.json();
      void ldClient?.identify(data);
    };

    void getAndSetLdContext();
  }, [ldClient]);

  return <>{children}</>;
};
