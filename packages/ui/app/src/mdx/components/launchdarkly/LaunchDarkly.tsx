import { captureException } from "@sentry/nextjs";
import { atom, useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import * as LDClient from "launchdarkly-js-client-sdk";
import { PropsWithChildren, ReactNode } from "react";
import { selectApiRoute } from "../../../hooks/useApiRoute";

async function fetchClientSideId(route: string): Promise<string | undefined> {
    const json = await fetch(route).then((res) => res.json());
    return json?.["client-side-id"];
}

// this is a singleton atom that initializes the LaunchDarkly client-side SDK
const ldClientAtom = atom<Promise<LDClient.LDClient | undefined>>(async (get) => {
    const route = selectApiRoute(get, "/api/fern-docs/integrations/launchdarkly");
    const clientSideId = await fetchClientSideId(route);
    return clientSideId ? LDClient.initialize(clientSideId, { kind: "user" }) : undefined;
});

const ldFlagsAtom = atom(async (get) => {
    return get(ldClientAtom).then((client) => client?.allFlags() ?? {});
});

const useLaunchDarklyFlag = (flag: string | string[]): boolean => {
    const ldFlags = useAtomValue(loadable(ldFlagsAtom));

    if (ldFlags.state === "hasError") {
        captureException(ldFlags.error);
    }

    if (ldFlags.state !== "hasData") {
        return false;
    }

    if (typeof flag === "string") {
        return !!ldFlags.data[flag];
    } else if (Array.isArray(flag) && flag.length > 0 && flag.every((flag) => typeof flag === "string")) {
        return flag.every((flag) => !!ldFlags.data[flag]);
    } else {
        return false;
    }
};

export interface LaunchDarklyProps {
    flag: string | string[];
}

export function LaunchDarkly({ flag, children }: PropsWithChildren<LaunchDarklyProps>): ReactNode {
    const ldClient = useLaunchDarklyFlag(flag);

    if (!ldClient) {
        return null;
    }

    return children;
}
