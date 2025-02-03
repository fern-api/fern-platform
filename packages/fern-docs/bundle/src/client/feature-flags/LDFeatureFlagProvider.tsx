import { useAtomValue } from "jotai";
import {
  LDContext,
  LDProvider,
  useLDClient,
} from "launchdarkly-react-client-sdk";
import { FC, PropsWithChildren, ReactNode, useEffect } from "react";
import useSWR from "swr";
import { CURRENT_VERSION_ID_ATOM, useFernUser } from "../atoms";

interface Props extends PropsWithChildren {
  clientSideId: string;

  /**
   * The endpoint to fetch the user context from.
   */
  contextEndpoint: string | undefined;

  /**
   * Default anonymous user context.
   * @default { kind: "user", key: "anonymous", anonymous: true }
   */
  defaultContext?: LDContext;

  defaultFlags?: object;

  options?: {
    baseUrl?: string;
    streamUrl?: string;
    eventsUrl?: string;
    hash?: string;
  };
}

const ANONYMOUS_CONTEXT: LDContext = {
  kind: "user",
  key: "anonymous",
  anonymous: true,
};

export const LDFeatureFlagProvider: FC<Props> = ({
  clientSideId,
  contextEndpoint,
  defaultContext,
  defaultFlags,
  options,
  children,
}) => {
  return (
    <LDProvider
      clientSideID={clientSideId}
      context={defaultContext ?? ANONYMOUS_CONTEXT}
      flags={defaultFlags}
      options={options}
    >
      {contextEndpoint ? (
        <IdentifyWrapper
          contextEndpoint={contextEndpoint}
          defaultContext={defaultContext}
        >
          {children}
        </IdentifyWrapper>
      ) : (
        children
      )}
    </LDProvider>
  );
};

const IdentifyWrapper = ({
  children,
  contextEndpoint: contextEndpointProp,
  defaultContext = {
    kind: "user",
    key: "anonymous",
    anonymous: true,
  },
}: {
  children: ReactNode;
  contextEndpoint: string;
  defaultContext?: LDContext;
}) => {
  const ldClient = useLDClient();
  const anonymous = useFernUser() == null;
  const version = useAtomValue(CURRENT_VERSION_ID_ATOM);

  const endpoint = withParams(contextEndpointProp, {
    anonymous,
    version,
  });

  // using SWR to get refresh the LD context
  const { data = { context: defaultContext, hash: null } } = useSWR<{
    context: LDContext;
    hash: string | null;
  }>(
    endpoint,
    async () => {
      // Note: we need to include credentials here to pass the cookie to the server, since the cookie can be used to identify the user
      // this can be dangerous and should be only enabled for trusted customers
      const res = await fetch(endpoint, { credentials: "include" });
      return {
        context: (await res.json()) as LDContext,
        hash: res.headers.get("x-secure-mode-hash"),
      };
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateOnMount: true,
      errorRetryCount: 3,
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    void ldClient?.identify(data.context, data.hash ?? undefined);
  }, [ldClient, data]);

  return children;
};

function withParams(
  endpoint: string,
  opts: {
    anonymous: boolean;
    version: string | undefined;
  }
) {
  try {
    const url = new URL(endpoint);
    url.searchParams.set("anonymous", opts.anonymous.toString());
    if (opts.version) {
      url.searchParams.set("version", opts.version);
    }
    return String(url);
  } catch {
    return endpoint;
  }
}
