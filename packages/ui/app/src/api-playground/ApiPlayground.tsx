import { APIV1Read, joinUrlSlugs } from "@fern-api/fdr-sdk";
import { failed, Loadable, loaded, loading, notStartedLoading } from "@fern-ui/loadable";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Dispatch, FC, ReactElement, SetStateAction, useCallback, useState } from "react";
import { capturePosthogEvent } from "../analytics/posthog";
import { FernButton, FernButtonGroup } from "../components/FernButton";
import { FernTooltip, FernTooltipProvider } from "../components/FernTooltip";
import { SidebarNode } from "../sidebar/types";
import { ResolvedEndpointDefinition } from "../util/resolver";
import "./ApiPlayground.css";
import { ApiPlayroundContent } from "./ApiPlaygroundContent";
import { useApiPlaygroundContext } from "./ApiPlaygroundContext";
import { ApiPlaygroundEndpointSelector } from "./ApiPlaygroundEndpointSelector";
import { PlaygroundEndpointPath } from "./PlaygroundEndpointPath";
import { PlaygroundRequestFormState, ResponsePayload } from "./types";
import { buildEndpointUrl, buildUnredactedHeaders } from "./utils";

interface ApiPlaygroundProps {
    navigation: SidebarNode[];
    auth: APIV1Read.ApiAuth | undefined;
    endpoint: ResolvedEndpointDefinition | undefined;
    formState: PlaygroundRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundRequestFormState>>;
    resetWithExample: () => void;
    resetWithoutExample: () => void;
}

export const ApiPlayground: FC<ApiPlaygroundProps> = ({
    navigation,
    auth,
    endpoint,
    formState,
    setFormState,
    resetWithExample,
    resetWithoutExample,
}): ReactElement => {
    const { collapseApiPlayground } = useApiPlaygroundContext();

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

    const drawer = (
        <div className="flex h-full flex-col rounded-lg">
            <div>
                <div className="grid h-10 grid-cols-3 gap-2 px-4">
                    <div className="flex items-center">
                        <span className="inline-flex items-baseline gap-2">
                            <span className="t-accent text-sm font-semibold">API Playground</span>
                            <span className="bg-tag-primary t-accent flex h-5 items-center rounded-md px-1.5 py-1 font-mono text-xs uppercase">
                                BETA
                            </span>
                        </span>
                    </div>

                    <div className="flex items-center justify-center">
                        {endpoint != null && <ApiPlaygroundEndpointSelector navigation={navigation} />}
                    </div>

                    <div className="flex items-center justify-end">
                        <FernTooltipProvider>
                            <FernButtonGroup>
                                <FernTooltip
                                    content={
                                        <span className="space-x-4">
                                            <span>Close API Playground</span>
                                            <span className="text-faded font-mono">CTRL + `</span>
                                        </span>
                                    }
                                >
                                    <FernButton
                                        variant="minimal"
                                        className="-mr-2"
                                        icon={<Cross1Icon />}
                                        onClick={collapseApiPlayground}
                                        rounded
                                    />
                                </FernTooltip>
                            </FernButtonGroup>
                        </FernTooltipProvider>
                    </div>
                </div>

                {endpoint != null && (
                    <PlaygroundEndpointPath endpoint={endpoint} formState={formState} sendRequest={sendRequest} />
                )}
            </div>

            {endpoint != null ? (
                <ApiPlayroundContent
                    auth={auth}
                    endpoint={endpoint}
                    formState={formState}
                    setFormState={setFormState}
                    resetWithExample={resetWithExample}
                    resetWithoutExample={resetWithoutExample}
                    response={response}
                    sendRequest={sendRequest}
                />
            ) : (
                <div className="flex flex-1 items-center justify-center">
                    <ApiPlaygroundEndpointSelector
                        navigation={navigation}
                        placeholderText="Select an endpoint to get started"
                        buttonClassName="text-base"
                    />
                </div>
            )}
        </div>
    );

    return <FernTooltipProvider>{drawer}</FernTooltipProvider>;
};
