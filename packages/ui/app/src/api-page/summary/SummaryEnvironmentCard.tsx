import { APIV1Read } from "@fern-api/fdr-sdk";
import { ReactElement } from "react";
import { FernSyntaxHighlighter } from "../../syntax-highlighting/FernSyntaxHighlighter";
import { TitledExample } from "../examples/TitledExample";

export function SummaryEnvironmentCard({
    environments,
    defaultEnvironment,
}: {
    environments: APIV1Read.Environment[];
    defaultEnvironment: APIV1Read.Environment | undefined;
}): ReactElement | null {
    defaultEnvironment = defaultEnvironment ?? environments[0];
    if (defaultEnvironment == null) {
        return null;
    }
    return (
        <TitledExample title={"Base URL"} type="primary" copyToClipboardText={() => defaultEnvironment.baseUrl}>
            <FernSyntaxHighlighter
                code={defaultEnvironment.baseUrl}
                language={"http"}
                disableLineNumbers={true}
                fontSize="base"
            />
        </TitledExample>
    );
}
