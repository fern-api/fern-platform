import {
  LDContext,
  LDProvider,
  useLDClient,
} from "launchdarkly-react-client-sdk";
import { FC, ReactNode, useEffect } from "react";
import useSWR from "swr";

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

  // using SWR to get refresh the LD context
  const { data } = useSWR<LDContext>(
    "user-ld-context",
    () => fetch(userContextEndpoint).then((res) => res.json()),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateOnMount: true,
      errorRetryCount: 3,
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    if (data) {
      void ldClient?.identify(data);
    }
  }, [userContextEndpoint, ldClient, data]);

  return children;
};
