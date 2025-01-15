import {
  LDContext,
  LDProvider,
  useLDClient,
} from "launchdarkly-react-client-sdk";
import { FC, ReactNode, useEffect } from "react";
import useSWR from "swr";

interface Props {
  clientSideId: string;
  /**
   * The endpoint to fetch the user context from.
   */
  userContextEndpoint: string;
  /**
   * The endpoint to fetch the anonymous user context from.
   * @default {userContextEndpoint}
   */
  anonymousUserContextEndpoint?: string;
  children: ReactNode;
}

export const LDFeatureFlagProvider: FC<Props> = ({
  clientSideId,
  userContextEndpoint,
  anonymousUserContextEndpoint,
  children,
}) => {
  return (
    <LDProvider clientSideID={clientSideId}>
      <IdentifyWrapper
        userContextEndpoint={userContextEndpoint}
        anonymousUserContextEndpoint={anonymousUserContextEndpoint}
      >
        {children}
      </IdentifyWrapper>
    </LDProvider>
  );
};

const IdentifyWrapper = ({
  children,
  userContextEndpoint: userContextEndpointProp,
  anonymousUserContextEndpoint = userContextEndpointProp,
  anonymous = true,
}: {
  children: ReactNode;
  userContextEndpoint: string;
  anonymousUserContextEndpoint?: string;
  anonymous?: boolean;
}) => {
  const ldClient = useLDClient();

  const userContextEndpoint = anonymous
    ? anonymousUserContextEndpoint
    : userContextEndpointProp;

  // using SWR to get refresh the LD context
  const { data } = useSWR<LDContext>(
    userContextEndpoint,
    () =>
      fetch(userContextEndpoint, {
        credentials: anonymous ? undefined : "include",
      }).then((res) => res.json()),
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
