"use client";

import { FC, PropsWithChildren, ReactNode, useEffect } from "react";

import { useAtomValue } from "jotai";
import {
  LDContext,
  LDProvider,
  useLDClient,
} from "launchdarkly-react-client-sdk";
import useSWR from "swr";

import { useFernUser } from "@/state/fern-user";

import { CURRENT_VERSION_ID_ATOM } from "../atoms";

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
      context={defaultContext}
      flags={defaultFlags}
      options={options}
    >
      <LDClientWindow />
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

/**
 * This component is used to attach the LDClient to the window object,
 * which allows the LDClient to be accessed in custom/injected javascript script.
 *
 * Two custom events are implemented to exchange a "handshake" with the client-side code:
 * - `ld:attached` is dispatched when the LDClient is attached to the window object.
 * - `ld:attached:status` will be used to request another `ld:attached` event from the client-side code.
 *
 * The handshake helps guard against asynchronously loading code, where the custom script needs
 * to wait until the LDClient is attached to the window object before accessing it.
 */
const LDClientWindow = () => {
  const ldClient = useLDClient();
  useEffect(() => {
    window.ldClient = ldClient;
    if (ldClient) {
      window.dispatchEvent(new CustomEvent("ld:attached"));
    }

    const handleAttachStatus = () => {
      if (ldClient) {
        window.dispatchEvent(new CustomEvent("ld:attached"));
      }
    };

    window.addEventListener("ld:attached:status", handleAttachStatus);
    return () => {
      window.removeEventListener("ld:attached:status", handleAttachStatus);
    };
  }, [ldClient]);

  return null;
};
