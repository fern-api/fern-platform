import { PropsWithChildren, ReactNode } from "react";
import { useLaunchDarklyFlag } from "../../../atoms/launchdarkly";
import { LinkPreloadApiRoute } from "../../../components/LinkPreload";

export interface LaunchDarklyProps {
    flag: string;
    not?: boolean;
}

export function LaunchDarkly({ not = false, flag, children }: PropsWithChildren<LaunchDarklyProps>): ReactNode {
    const show = useLaunchDarklyFlag(flag, not);

    return (
        <>
            <LinkPreloadApiRoute href="/api/fern-docs/integrations/launchdarkly" />
            {show && children}
        </>
    );
}
