import { atom, useAtomValue, useSetAtom } from "jotai";
import * as LDClient from "launchdarkly-js-client-sdk";
import { useCallback, useEffect, useState } from "react";
import { useApiRouteSWR } from "./navigation";

// NOTE do not export this file in any index.ts file so that it can be properly tree-shaken
// otherwise we risk importing launchdarkly-js-client-sdk in all of our bundles

// TODO: consolidate the types with the edge-config package
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

// this is a singleton atom that initializes the LaunchDarkly client-side SDK
const LD_CLIENT_ATOM = atom<LDClient.LDClient | undefined>(undefined);

const SET_LAUNCH_DARKLY_INFO_ATOM = atom(undefined, async (get, set, info: LaunchDarklyInfo) => {
    const client = get(LD_CLIENT_ATOM);
    const { clientSideId, ...context } = info;

    if (client) {
        await client.identify(context);
        return;
    } else {
        const client = LDClient.initialize(clientSideId, context);
        await client.waitForInitialization();
        set(LD_CLIENT_ATOM, client);
    }
});

// TODO: support non-boolean flags
export const useLaunchDarklyFlag = (flag: string, equals = true, not = false): boolean => {
    useInitLaunchDarklyClient();

    const client = useAtomValue(LD_CLIENT_ATOM);

    // TODO: bootstrap the flag value from the server, and/or local storage
    const getFlagEnabled = useCallback(() => {
        if (!client) {
            return not;
        }
        // force the flag to be a boolean:
        const isTrue = client.variation(flag, false) === equals;
        return not ? !isTrue : isTrue;
    }, [client, equals, flag, not]);

    const [enabled, setEnabled] = useState(getFlagEnabled);

    // listen for changes to the flag
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

// since useSWR is cached globally, we can use this hook in multiple components without worrying about multiple requests
function useInitLaunchDarklyClient() {
    const setInfo = useSetAtom(SET_LAUNCH_DARKLY_INFO_ATOM);
    useApiRouteSWR<LaunchDarklyInfo>("/api/fern-docs/integrations/launchdarkly", {
        onSuccess(data) {
            void setInfo(data);
        },
    });
}
