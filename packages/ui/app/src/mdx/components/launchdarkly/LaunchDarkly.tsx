import { captureException } from "@sentry/nextjs";
import { atom, useAtomValue } from "jotai";
import { loadable, useHydrateAtoms } from "jotai/utils";
import * as LDClient from "launchdarkly-js-client-sdk";
import { PropsWithChildren, ReactNode, useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { LinkPreloadApiRoute } from "../../../components/LinkPreload";
import { useApiRoute } from "../../../hooks/useApiRoute";

interface LaunchDarklyInfo {
    clientSideId: string;
    kind: "multi";
    user:
        | { anonymous: true }
        | {
              key: string;
              email?: string;
              name?: string;
          };
    device: {
        key: string;
        [key: string]: unknown;
    };
}

const LAUNCH_DARKLY_INFO_ATOM = atom<LaunchDarklyInfo | undefined>(undefined);

// this is a singleton atom that initializes the LaunchDarkly client-side SDK
const LD_CLIENT_ATOM = atom<Promise<LDClient.LDClient | undefined>>(async (get) => {
    if (typeof window === "undefined") {
        return undefined;
    }

    const info = get(LAUNCH_DARKLY_INFO_ATOM);
    if (!info) {
        return undefined;
    }

    const { clientSideId, ...context } = info;

    const client = LDClient.initialize(clientSideId, context);

    await client.waitForInitialization();

    return client;
});

const useLaunchDarklyFlag = (flag: string): boolean => {
    const loadableClient = useAtomValue(loadable(LD_CLIENT_ATOM));
    const client = loadableClient.state === "hasData" ? loadableClient.data : undefined;

    if (loadableClient.state === "hasError") {
        captureException(loadableClient.error);
    }

    const getFlagEnabled = useCallback(() => {
        return client?.variation(flag, false) ?? false;
    }, [client, flag]);

    const [enabled, setEnabled] = useState(getFlagEnabled);

    useEffect(() => {
        setEnabled(getFlagEnabled());

        if (!client) {
            return;
        }

        const listener = () => {
            setEnabled(getFlagEnabled());
        };

        client.on("ready", listener);
        client.on("change", listener);

        return () => {
            client.off("ready", listener);
            client.off("change", listener);
        };
    }, [client, flag, getFlagEnabled]);

    return enabled;
};

export interface LaunchDarklyProps {
    flag: string;
}

export function LaunchDarkly({ flag, children }: PropsWithChildren<LaunchDarklyProps>): ReactNode {
    const route = useApiRoute("/api/fern-docs/integrations/launchdarkly");
    const { data } = useSWR(route, (key): Promise<LaunchDarklyInfo> => fetch(key).then((res) => res.json()));
    useHydrateAtoms([[LAUNCH_DARKLY_INFO_ATOM, data]], { dangerouslyForceHydrate: true });

    const ldClient = useLaunchDarklyFlag(flag);

    if (!ldClient) {
        return null;
    }

    return (
        <>
            <LinkPreloadApiRoute href="/api/fern-docs/integrations/launchdarkly" />
            {children}
        </>
    );
}
