import { EMPTY_OBJECT } from "@fern-ui/core-utils";
import { useMemo } from "react";
import { CodeExampleClientDropdown } from "../../../api-page/endpoints/CodeExampleClientDropdown";
import { EndpointUrlWithOverflow } from "../../../api-page/endpoints/EndpointUrlWithOverflow";
import { CodeSnippetExample } from "../../../api-page/examples/CodeSnippetExample";
import { generateCodeExamples } from "../../../api-page/examples/code-example";
import { useResolvedPath } from "../../../atoms";
import { useSelectedEnvironmentId } from "../../../atoms/environment";
import { ApiReferenceButton } from "../../../components/ApiReferenceButton";
import { ResolvedEndpointDefinition, resolveEnvironment } from "../../../resolver/types";
import { findEndpoint } from "../../../util/processRequestSnippetComponents";
import { RequestSnippet } from "./types";
import { extractEndpointPathAndMethod, useSelectedClient } from "./utils";

export const EndpointRequestSnippet: React.FC<React.PropsWithChildren<RequestSnippet.Props>> = ({
    endpoint: endpointLocator,
    example,
}) => {
    const [method, path] = extractEndpointPathAndMethod(endpointLocator);

    if (method == null || path == null) {
        return null;
    }

    return <EndpointRequestSnippetInternal method={method} path={path} example={example} />;
};

const EndpointRequestSnippetInternal: React.FC<React.PropsWithChildren<RequestSnippet.InternalProps>> = ({
    method,
    path,
    example,
}) => {
    const resolvedPath = useResolvedPath();
    const selectedEnvironmentId = useSelectedEnvironmentId();

    const endpoint = useMemo(() => {
        if (resolvedPath.type !== "custom-markdown-page") {
            return;
        }
        let endpoint: ResolvedEndpointDefinition | undefined;
        for (const api of Object.values(resolvedPath.apis)) {
            endpoint = findEndpoint({
                api,
                path,
                method,
            });
            if (endpoint) {
                break;
            }
        }
        return endpoint;
    }, [method, path, resolvedPath]);

    const clients = useMemo(() => generateCodeExamples(endpoint?.examples ?? []), [endpoint?.examples]);
    const [selectedClient, setSelectedClient] = useSelectedClient(clients, example);

    if (endpoint == null || selectedClient == null) {
        return null;
    }

    return (
        <div className="mb-5 mt-3">
            <CodeSnippetExample
                title={
                    <EndpointUrlWithOverflow
                        path={endpoint.path}
                        method={method}
                        selectedEnvironment={resolveEnvironment(endpoint, selectedEnvironmentId)}
                    />
                }
                actions={
                    <>
                        {clients.length > 1 && (
                            <CodeExampleClientDropdown
                                clients={clients}
                                onClickClient={setSelectedClient}
                                selectedClient={selectedClient}
                            />
                        )}
                        <ApiReferenceButton slug={endpoint.slug} />
                    </>
                }
                code={selectedClient.code}
                language={selectedClient.language}
                json={EMPTY_OBJECT}
                scrollAreaStyle={{ maxHeight: "500px" }}
            />
        </div>
    );
};
