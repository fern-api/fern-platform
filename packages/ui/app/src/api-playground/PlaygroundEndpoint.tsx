import { APIV1Read, joinUrlSlugs } from "@fern-api/fdr-sdk";
import { failed, Loadable, loaded, loading, notStartedLoading } from "@fern-ui/loadable";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { Dispatch, FC, ReactElement, SetStateAction, useCallback, useState } from "react";
import { capturePosthogEvent } from "../analytics/posthog";
import { FernTooltipProvider } from "../components/FernTooltip";
import { ResolvedEndpointDefinition, ResolvedTypeDefinition } from "../util/resolver";
import "./PlaygroundEndpoint.css";
import { PlaygroundEndpointContent } from "./PlaygroundEndpointContent";
import { PlaygroundEndpointPath } from "./PlaygroundEndpointPath";
import { PlaygroundEndpointRequestFormState, ResponsePayload } from "./types";
import { buildEndpointUrl, buildUnredactedHeaders } from "./utils";

interface PlaygroundEndpointProps {
    auth: APIV1Read.ApiAuth | null | undefined;
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundEndpointRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundEndpointRequestFormState>>;
    resetWithExample: () => void;
    resetWithoutExample: () => void;
    types: Record<string, ResolvedTypeDefinition>;
}

export const PlaygroundEndpoint: FC<PlaygroundEndpointProps> = ({
    auth,
    endpoint,
    formState,
    setFormState,
    resetWithExample,
    resetWithoutExample,
    types,
}): ReactElement => {
    const [response, setResponse] = useState<Loadable<ResponsePayload>>(notStartedLoading());

    const sendRequest = useCallback(async () => {
        if (endpoint == null) {
            return;
        }
        const startTime = performance.now();
        setResponse(loading());
        try {
            capturePosthogEvent("api_playground_request_sent", {
                endpointId: endpoint.id,
                endpointName: endpoint.name,
                method: endpoint.method,
                docsRoute: `/${joinUrlSlugs(...endpoint.slug)}`,
            });
            const response = await fetch("/api/proxy", {
                method: "POST",
                headers: buildUnredactedHeaders(auth, endpoint, formState),
                body: JSON.stringify({
                    url: buildEndpointUrl(endpoint, formState),
                    method: endpoint.method,
                    headers: buildUnredactedHeaders(auth, endpoint, formState),
                    body: formState.body,
                }),
            });
            const loadedResponse: ResponsePayload = await response.json();
            setResponse(loaded(loadedResponse));
            const proxyTime = performance.now() - startTime;
            capturePosthogEvent("api_playground_request_received", {
                endpointId: endpoint.id,
                endpointName: endpoint.name,
                method: endpoint.method,
                docsRoute: `/${joinUrlSlugs(...endpoint.slug)}`,
                response: {
                    status: loadedResponse.status,
                    time: loadedResponse.time,
                    size: loadedResponse.size,
                },
                proxy: {
                    ok: response.ok,
                    status: response.status,
                    time: response.headers.get("x-response-time") ?? proxyTime,
                },
            });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            setResponse(failed(e));
            capturePosthogEvent("api_playground_request_failed", {
                endpointId: endpoint.id,
                endpointName: endpoint.name,
                method: endpoint.method,
                docsRoute: `/${joinUrlSlugs(...endpoint.slug)}`,
            });
        }
    }, [auth, endpoint, formState]);

    return (
        <FernTooltipProvider>
            <div className="flex min-h-0 flex-1 shrink flex-col">
                <div className="flex-0">
                    <PlaygroundEndpointPath
                        method={endpoint.method}
                        formState={formState}
                        sendRequest={sendRequest}
                        environment={endpoint.defaultEnvironment ?? endpoint.environments[0]}
                        path={endpoint.path}
                        queryParameters={endpoint.queryParameters}
                        sendRequestIcon={
                            <PaperPlaneIcon className="size-6 transition-transform group-hover:translate-x-0.5" />
                        }
                    />
                </div>
                <div className="flex min-h-0 flex-1 shrink">
                    <PlaygroundEndpointContent
                        auth={auth}
                        endpoint={endpoint}
                        formState={formState}
                        setFormState={setFormState}
                        resetWithExample={resetWithExample}
                        resetWithoutExample={resetWithoutExample}
                        response={response}
                        sendRequest={sendRequest}
                        types={types}
                    />
                </div>
            </div>
        </FernTooltipProvider>
    );
};
