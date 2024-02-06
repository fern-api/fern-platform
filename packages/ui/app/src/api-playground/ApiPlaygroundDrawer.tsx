import { Button } from "@blueprintjs/core";
import { Cross } from "@blueprintjs/icons";
import { APIV1Read, joinUrlSlugs } from "@fern-api/fdr-sdk";
import {
    ResolvedApiDefinitionPackage,
    ResolvedEndpointDefinition,
    ResolvedNavigationItemApiSection,
} from "@fern-ui/app-utils";
import { failed, Loadable, loaded, loading, notStartedLoading } from "@fern-ui/loadable";
import { Dispatch, FC, ReactElement, SetStateAction, useCallback, useState } from "react";
import { capturePosthogEvent } from "../analytics/posthog";
import { ApiPlayroundContent } from "./ApiPlaygroundContent";
import { useApiPlaygroundContext } from "./ApiPlaygroundContext";
import { ApiPlaygroundEndpointSelector } from "./ApiPlaygroundEndpointSelector";
import { PlaygroundEndpointRender } from "./PlaygroundEndpointRender";
import { SecretBearer } from "./PlaygroundSecretsModal";
import { PlaygroundSendRequestButton } from "./PlaygroundSendRequestButton";
import { PlaygroundRequestFormState, ResponsePayload } from "./types";
import { buildEndpointUrl, buildUnredactedHeaders } from "./utils";

interface ApiPlaygroundDrawerProps {
    navigationItems: ResolvedNavigationItemApiSection[];
    auth: APIV1Read.ApiAuth | undefined;
    apiDefinition: ResolvedApiDefinitionPackage | undefined;
    endpoint: ResolvedEndpointDefinition | undefined;
    formState: PlaygroundRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundRequestFormState>>;
    resetWithExample: () => void;
    resetWithoutExample: () => void;
    openSecretsModal: () => void;
    secrets: SecretBearer[];
}

export const ApiPlaygroundDrawer: FC<ApiPlaygroundDrawerProps> = ({
    navigationItems,
    auth,
    apiDefinition,
    endpoint,
    formState,
    setFormState,
    resetWithExample,
    resetWithoutExample,
    openSecretsModal,
    secrets,
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

    return (
        <div className="divide-border-default-light dark:divide-border-default-dark scroll-contain flex h-full flex-col divide-y overscroll-none rounded-lg">
            <div className="flex h-10 items-stretch justify-between gap-2 px-4">
                {endpoint != null && (
                    <>
                        <div className="flex items-center">
                            <ApiPlaygroundEndpointSelector
                                apiDefinition={apiDefinition}
                                endpoint={endpoint}
                                navigationItems={navigationItems}
                                popoverPlacement="bottom-start"
                            />
                        </div>
                        <div className="bg-border-default-light dark:bg-border-default-dark h-10 w-[1px] shrink-0" />
                    </>
                )}
                {endpoint != null ? (
                    <PlaygroundEndpointRender endpoint={endpoint} formState={formState} />
                ) : (
                    <div className="flex items-center">
                        <span className="inline-flex items-baseline gap-2">
                            <span className="text-accent-primary text-sm font-semibold">API Playground</span>
                            <span className="bg-tag-primary text-accent-primary flex h-5 items-center rounded-md px-1.5 py-1 font-mono text-xs uppercase">
                                BETA
                            </span>
                        </span>
                    </div>
                )}

                <div className="bg-background dark:bg-background-dark -mx-4 flex items-center gap-2 px-4">
                    {/* <Tooltip content="Coming soon" popoverClassName="text-xs">
                        <a className="text-text-primary-light hover:text-accent-primary decoration-accent-primary dark:text-text-primary-dark dark:hover:text-accent-primary-dark dark:decoration-accent-primary-dark whitespace-nowrap text-sm font-semibold underline decoration-1 underline-offset-4 hover:decoration-2">
                            Sign in to use your API keys
                        </a>
                    </Tooltip> */}
                    <PlaygroundSendRequestButton sendRequest={sendRequest} />
                    <Button minimal={true} icon={<Cross />} onClick={collapseApiPlayground} className="-mr-2" />
                </div>
            </div>

            {endpoint != null ? (
                <ApiPlayroundContent
                    auth={auth}
                    endpoint={endpoint}
                    formState={formState}
                    setFormState={setFormState}
                    resetWithExample={resetWithExample}
                    resetWithoutExample={resetWithoutExample}
                    openSecretsModal={openSecretsModal}
                    secrets={secrets}
                    response={response}
                />
            ) : (
                <div className="flex flex-1 items-center justify-center">
                    <ApiPlaygroundEndpointSelector
                        navigationItems={navigationItems}
                        apiDefinition={apiDefinition}
                        endpoint={endpoint}
                        placeholderText="Select an endpoint to get started"
                        buttonClassName="text-base"
                        popoverPlacement="top"
                    />
                </div>
            )}
        </div>
    );
};
