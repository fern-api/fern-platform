import { FernClient, FernEnvironment } from "@fern-api/sdk";
import { NextApp } from "@fern-ui/ui";
import { AppProps } from "next/app";
import { ReactElement } from "react";

const fern = new FernClient({
    environment: FernEnvironment.Prod,
    token: "...",
});
fern.templates
    .get({
        apiId: "api",
        orgId: "org",
        endpointId: {
            method: "POST",
            path: "v1/chat",
        },
        sdk: {
            type: "typescript",
            package: "cohere-ai",
        },
    })
    .then((template) => {
        template.resolve({ requestBody: { a: "baz" } });
    });

export default function App(props: AppProps): ReactElement {
    return <NextApp {...props} />;
}
