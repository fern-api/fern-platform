import { DocsV1Read } from "@fern-api/fdr-sdk";
import { ReactElement } from "react";
import { useInitializePosthog } from "./posthog";

export function Posthog(props: { customerConfig?: DocsV1Read.PostHogConfig }): ReactElement {
    useInitializePosthog(props.customerConfig);
    return <></>;
}
