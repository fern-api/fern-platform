import { datadogRum, type RumInitConfiguration } from "@datadog/browser-rum";
import { ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "swr/_internal";

export default function DatadogRumScript(props: RumInitConfiguration): ReactNode {
    useIsomorphicLayoutEffect(() => {
        datadogRum.init(props);
    }, []);

    return false;
}
