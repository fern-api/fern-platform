import { PropsWithChildren, ReactNode } from "react";
import { useLaunchDarklyFlag } from "../../../atoms/launchdarkly";
import { LinkPreloadApiRoute } from "../../../components/LinkPreload";

export interface LaunchDarklyProps {
    flag: string;
    equals?: boolean;
    not?: boolean;
}

export function LaunchDarkly({
    equals = true,
    not = false,
    flag,
    children,
}: PropsWithChildren<LaunchDarklyProps>): ReactNode {
    const show = useLaunchDarklyFlag(flag, equals, not);

    return (
        <>
            <LinkPreloadApiRoute href="/api/fern-docs/integrations/launchdarkly" />
            {show && children}
        </>
    );
}
