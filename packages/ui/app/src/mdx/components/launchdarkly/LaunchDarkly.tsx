import { atom, useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import * as LDClient from "launchdarkly-js-client-sdk";
import { PropsWithChildren, ReactNode, useCallback, useEffect, useState } from "react";
import { selectApiRoute } from "../../../hooks/useApiRoute";

async function fetchClientSideId(route: string): Promise<string | undefined> {
    const json = await fetch(route).then((res) => res.json());
    return json?.["client-side-id"];
}

// this is a singleton atom that initializes the LaunchDarkly client-side SDK
const ldClientAtom = atom<Promise<LDClient.LDClient | undefined>>(async (get) => {
    if (typeof window === "undefined") {
        return undefined;
    }
    const route = selectApiRoute(get, "/api/fern-docs/integrations/launchdarkly");
    const clientSideId = await fetchClientSideId(route);
    if (!clientSideId) {
        return undefined;
    }

    const client = LDClient.initialize(clientSideId, {
        kind: "user",
        anonymous: true,
    });

    await client.waitForInitialization();

    return client;
});

const useLaunchDarklyFlag = (flag: string): boolean => {
    const loadableClient = useAtomValue(loadable(ldClientAtom));
    const client = loadableClient.state === "hasData" ? loadableClient.data : undefined;
    if (loadableClient.state === "hasError") {
        // TODO: sentry
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
    const ldClient = useLaunchDarklyFlag(flag);

    if (!ldClient) {
        return null;
    }

    return children;
}
