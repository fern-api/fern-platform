import {
  LDContext,
  LDProvider,
  useLDClient,
} from "launchdarkly-react-client-sdk";
import { FC, ReactNode, useEffect } from "react";
import useSWR from "swr";

interface Props extends PropsWithChildren {
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

  /**
   * Default anonymous user context.
   * @default { kind: "user", key: "anonymous", anonymous: true }
   */
  defaultAnonymousUserContext?: LDContext;

  /**
   * Whether to use anonymous user context.
   * @default true
   */
  anonymous?: boolean;
}

export const LDFeatureFlagProvider: FC<Props> = ({
  clientSideId,
  userContextEndpoint,
  anonymousUserContextEndpoint,
  defaultAnonymousUserContext,
  anonymous = true,
  children,
}) => {
  return (
    <LDProvider clientSideID={clientSideId}>
      <IdentifyWrapper
        userContextEndpoint={userContextEndpoint}
        anonymousUserContextEndpoint={anonymousUserContextEndpoint}
        defaultAnonymousUserContext={defaultAnonymousUserContext}
        anonymous={anonymous}
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
  defaultAnonymousUserContext = {
    kind: "user",
    key: "anonymous",
    anonymous: true,
  },
  anonymous = true,
}: {
  children: ReactNode;
  userContextEndpoint: string;
  anonymousUserContextEndpoint?: string;
  defaultAnonymousUserContext?: LDContext;
  anonymous: boolean;
}) => {
  const ldClient = useLDClient();

  const userContextEndpoint = anonymous
    ? anonymousUserContextEndpoint
    : userContextEndpointProp;

  // using SWR to get refresh the LD context
  const { data = defaultAnonymousUserContext } = useSWR<LDContext>(
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
    void ldClient?.identify(data);
  }, [userContextEndpoint, ldClient, data]);

  return children;
};
