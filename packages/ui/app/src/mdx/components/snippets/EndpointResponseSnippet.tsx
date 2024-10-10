import { useMemo } from "react";
import { CodeSnippetExample } from "../../../api-reference/examples/CodeSnippetExample";
import { generateCodeExamples } from "../../../api-reference/examples/code-example";
import { RequestSnippet } from "./types";
import { useFindEndpoint } from "./useFindEndpoint";
import { extractEndpointPathAndMethod, useSelectedClient } from "./utils";

export const EndpointResponseSnippet: React.FC<React.PropsWithChildren<RequestSnippet.Props>> = ({
    endpoint: endpointLocator,
    example,
}) => {
    const [method, path] = extractEndpointPathAndMethod(endpointLocator);

    if (method == null || path == null) {
        return null;
    }

    return <EndpointResponseSnippetInternal method={method} path={path} example={example} />;
};

const EndpointResponseSnippetInternal: React.FC<React.PropsWithChildren<RequestSnippet.InternalProps>> = ({
    path,
    method,
    example,
}) => {
    const endpoint = useFindEndpoint(method, path);

    const clients = useMemo(() => generateCodeExamples(endpoint?.examples ?? []), [endpoint?.examples]);
    const [selectedClient] = useSelectedClient(clients, example);

    if (endpoint == null) {
        return null;
    }

    const responseJson = selectedClient?.exampleCall.responseBody?.value;

    if (responseJson == null) {
        return null;
    }

    const responseJsonString = JSON.stringify(responseJson, null, 2);

    return (
        <div className="mb-5 mt-3">
            <CodeSnippetExample
                title="Response"
                // actions={undefined}
                code={responseJsonString}
                language="json"
                json={responseJson}
                scrollAreaStyle={{ maxHeight: "500px" }}
            />
        </div>
    );
};
