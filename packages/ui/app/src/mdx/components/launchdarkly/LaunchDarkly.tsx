import { PropsWithChildren, ReactNode } from "react";
import { useLaunchDarklyFlag } from "../../../atoms/launchdarkly";
import { LinkPreloadApiRoute } from "../../../components/LinkPreload";

export interface LaunchDarklyProps {
    flag: string;
}

export function LaunchDarkly({ flag, children }: PropsWithChildren<LaunchDarklyProps>): ReactNode {
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
