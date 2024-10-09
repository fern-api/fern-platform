import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { EMPTY_OBJECT } from "@fern-ui/core-utils";
import { atom, useAtomValue } from "jotai";
import { ReactElement, useMemo } from "react";
import { useMemoOne } from "use-memo-one";
import { CodeExampleClientDropdown } from "../../../api-reference/endpoints/CodeExampleClientDropdown";
import { EndpointUrlWithOverflow } from "../../../api-reference/endpoints/EndpointUrlWithOverflow";
import { CodeSnippetExample } from "../../../api-reference/examples/CodeSnippetExample";
import { generateCodeExamples } from "../../../api-reference/examples/code-example";
import { READ_APIS_ATOM } from "../../../atoms";
import { usePlaygroundBaseUrl } from "../../../playground/utils/select-environment";
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

    return <EndpointRequestSnippetRenderer method={method} path={path} example={example} />;
};

const EndpointRequestSnippetRenderer: React.FC<React.PropsWithChildren<RequestSnippet.InternalProps>> = ({
    method,
    path,
    example,
}) => {
    const endpoint = useAtomValue(
        useMemoOne(
            () =>
                atom((get) => {
                    let endpoint: ApiDefinition.EndpointDefinition | undefined;
                    for (const apiDefinition of Object.values(get(READ_APIS_ATOM))) {
                        endpoint = findEndpoint({
                            apiDefinition,
                            path,
                            method,
                        });
                        if (endpoint) {
                            break;
                        }
                    }
                    return endpoint;
                }),
            [method, path],
        ),
    );

    if (endpoint == null) {
        return null;
    }

    return <EndpointRequestSnippetInternal endpoint={endpoint} example={example} />;
};

export function EndpointRequestSnippetInternal({
    endpoint,
    example,
}: {
    endpoint: ApiDefinition.EndpointDefinition;
    example: string | undefined;
}): ReactElement | null {
    const clients = useMemo(() => generateCodeExamples(endpoint.examples), [endpoint.examples]);
    const [selectedClient, setSelectedClient] = useSelectedClient(clients, example);
    const [baseUrl, selectedEnvironmentId] = usePlaygroundBaseUrl(endpoint);

    if (selectedClient == null) {
        return null;
    }

    return (
        <div className="mb-5 mt-3">
            <CodeSnippetExample
                title={
                    <EndpointUrlWithOverflow
                        path={endpoint.path}
                        method={endpoint.method}
                        environmentId={selectedEnvironmentId}
                        baseUrl={baseUrl}
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
                        {/* TODO: Restore this button */}
                        {/* <ApiReferenceButton slug={endpoint.slug} /> */}
                    </>
                }
                code={selectedClient.code}
                language={selectedClient.language}
                json={EMPTY_OBJECT}
                scrollAreaStyle={{ maxHeight: "500px" }}
            />
        </div>
    );
}
