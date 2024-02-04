import { NonIdealState, Spinner } from "@blueprintjs/core";
import { APIV1Read, joinUrlSlugs } from "@fern-api/fdr-sdk";
import { ResolvedEndpointDefinition } from "@fern-ui/app-utils";
import { failed, Loadable, loaded, loading, notStartedLoading, visitLoadable } from "@fern-ui/loadable";
import classNames from "classnames";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { isEmpty, round } from "lodash-es";
import { Dispatch, FC, SetStateAction, useCallback, useState } from "react";
import { capturePosthogEvent } from "../analytics/posthog";
import { RemoteFontAwesomeIcon } from "../commons/FontAwesomeIcon";
import { FernButton } from "../components/FernButton";
import { PlaygroundEndpointForm } from "./PlaygroundEndpointForm";
import { PlaygroundRequestPreview } from "./PlaygroundRequestPreview";
import { PlaygroundResponsePreview } from "./PlaygroundResponsePreview";
import { SecretBearer } from "./PlaygroundSecretsModal";
import { PlaygroundRequestFormState } from "./types";
import { useHorizontalSplitPane, useWindowWidth } from "./useSplitPlane";
import { buildEndpointUrl, buildUnredactedHeaders } from "./utils";

interface ResponsePayload {
    status: number;
    time: number;
    size: string | null;
    body: unknown;
}

interface ApiPlayroundContentProps {
    auth: APIV1Read.ApiAuth | undefined;
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundRequestFormState>>;
    resetWithExample: () => void;
    resetWithoutExample: () => void;
    openSecretsModal: () => void;
    secrets: SecretBearer[];
}

const requestTypeAtom = atomWithStorage<"form" | "curl" | "javascript" | "python">("api-playground-atom-alpha", "curl");

export const ApiPlayroundContent: FC<ApiPlayroundContentProps> = ({
    auth,
    endpoint,
    formState,
    setFormState,
    resetWithExample,
    resetWithoutExample,
    openSecretsModal,
    secrets,
}) => {
    const [requestType, setRequestType] = useAtom(requestTypeAtom);
    const [width, setWidthPercent] = useState<number>(0.5);
    const windowWidth = useWindowWidth();
    const setWidth = useCallback(
        (width: number) => {
            if (windowWidth != null) {
                setWidthPercent(width / windowWidth);
            }
        },
        [windowWidth],
    );
    const handleResize = useHorizontalSplitPane(setWidth);

    const [response, setResponse] = useState<Loadable<ResponsePayload>>(notStartedLoading());

    const sendRequest = useCallback(async () => {
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
        <div className="divide-border-default-light dark:divide-border-default-dark flex min-h-0 flex-1 shrink items-stretch divide-x">
            <div
                className={"relative flex min-w-0 shrink flex-col overflow-hidden"}
                style={{ width: `${width * 100}%` }}
            >
                <div className="border-border-default-light dark:border-border-default-dark flex h-10 w-full shrink-0 items-center justify-between border-b px-4 py-2">
                    <span className="t-muted text-xs uppercase">Request</span>

                    <div className="flex items-center text-xs">
                        <button
                            className={classNames(
                                "px-2 py-1 -my-1 rounded-lg hover:text-accent-primary hover:dark:text-accent-primary-dark",
                                {
                                    "bg-tag-primary dark:bg-tag-primary-dark text-accent-primary dark:text-accent-primary-dark":
                                        requestType === "form",
                                    "t-muted": requestType !== "form",
                                },
                            )}
                            onClick={() => setRequestType("form")}
                        >
                            Form
                        </button>
                        <button
                            className={classNames(
                                "px-2 py-1 -my-1 rounded-lg hover:text-accent-primary hover:dark:text-accent-primary-dark",
                                {
                                    "bg-tag-primary dark:bg-tag-primary-dark text-accent-primary dark:text-accent-primary-dark":
                                        requestType === "curl",
                                    "t-muted": requestType !== "curl",
                                },
                            )}
                            onClick={() => setRequestType("curl")}
                        >
                            CURL
                        </button>
                        <button
                            className={classNames(
                                "px-2 py-1 -my-1 rounded-lg hover:text-accent-primary hover:dark:text-accent-primary-dark",
                                {
                                    "bg-tag-primary dark:bg-tag-primary-dark text-accent-primary dark:text-accent-primary-dark":
                                        requestType === "javascript",
                                    "t-muted": requestType !== "javascript",
                                },
                            )}
                            onClick={() => setRequestType("javascript")}
                        >
                            JavaScript
                        </button>
                        <button
                            className={classNames(
                                "px-2 py-1 -my-1 rounded-lg hover:text-accent-primary hover:dark:text-accent-primary-dark",
                                {
                                    "bg-tag-primary dark:bg-tag-primary-dark text-accent-primary dark:text-accent-primary-dark":
                                        requestType === "python",
                                    "t-muted": requestType !== "python",
                                },
                            )}
                            onClick={() => setRequestType("python")}
                        >
                            Python
                        </button>

                        <div className="bg-border-default-light dark:bg-border-default-dark mx-2 h-[40px] w-[1px] shrink-0" />

                        <button
                            className={
                                "hover:text-accent-primary hover:dark:text-accent-primary-dark t-muted -my-1 whitespace-nowrap rounded-lg px-2 py-1"
                            }
                            onClick={resetWithExample}
                        >
                            Use example
                        </button>
                        <button
                            className={
                                "hover:text-accent-primary hover:dark:text-accent-primary-dark t-muted -my-1 whitespace-nowrap rounded-lg px-2 py-1"
                            }
                            onClick={resetWithoutExample}
                        >
                            Clear form
                        </button>
                    </div>
                </div>
                {requestType !== "form" ? (
                    <PlaygroundRequestPreview
                        auth={auth}
                        endpoint={endpoint}
                        formState={formState}
                        requestType={requestType}
                    />
                ) : (
                    <PlaygroundEndpointForm
                        endpoint={endpoint}
                        formState={formState}
                        setFormState={setFormState}
                        openSecretsModal={openSecretsModal}
                        secrets={secrets}
                        auth={auth}
                    />
                )}
            </div>
            <div className="relative flex min-h-0 min-w-0 flex-1 shrink flex-col">
                {response.type !== "notStartedLoading" && endpoint != null && (
                    <div className="absolute bottom-4 right-4 z-20">
                        <FernButton
                            onClick={sendRequest}
                            rightIcon={
                                <RemoteFontAwesomeIcon
                                    icon="paper-plane-top"
                                    className="transition-transform group-hover:translate-x-0.5"
                                />
                            }
                            intent="primary"
                        >
                            Send request
                        </FernButton>
                    </div>
                )}

                <div
                    className="bg-accent-primary dark:bg-accent-primary-dark absolute inset-y-0 -ml-0.5 w-1 cursor-col-resize opacity-0 transition-opacity hover:opacity-100 active:opacity-100"
                    onMouseDown={handleResize}
                />
                <div className="border-border-default-light dark:border-border-default-dark flex h-10 w-full shrink-0 items-center justify-between border-b px-4 py-2">
                    <span className="t-muted text-xs uppercase">Response</span>

                    {response.type === "loaded" && (
                        <div className="flex items-center gap-2 text-xs">
                            <span
                                className={classNames("font-mono flex items-center py-1 px-1.5 rounded-md h-5", {
                                    ["bg-method-get/10 text-method-get dark:bg-method-get-dark/10 dark:text-method-get-dark"]:
                                        response.value.status >= 200 && response.value.status < 300,
                                    ["bg-method-delete/10 text-method-delete dark:bg-method-delete-dark/10 dark:text-method-delete-dark"]:
                                        response.value.status > 300,
                                })}
                            >
                                status: {response.value.status}
                            </span>
                            <span
                                className={
                                    "bg-tag-default-light dark:bg-tag-default-dark flex h-5 items-center rounded-md px-1.5 py-1 font-mono"
                                }
                            >
                                time: {round(response.value.time, 2)}ms
                            </span>
                            {!isEmpty(response.value.size) && (
                                <span
                                    className={
                                        "bg-tag-default-light dark:bg-tag-default-dark flex h-5 items-center rounded-md px-1.5 py-1 font-mono"
                                    }
                                >
                                    size: {response.value.size}b
                                </span>
                            )}
                        </div>
                    )}
                </div>
                {visitLoadable(response, {
                    loading: () => (
                        <NonIdealState
                            className="flex-1"
                            icon={
                                response.type === "notStartedLoading" ? (
                                    <FernButton
                                        onClick={sendRequest}
                                        rightIcon={
                                            <RemoteFontAwesomeIcon
                                                icon="paper-plane-top"
                                                className="transition-transform group-hover:translate-x-0.5"
                                            />
                                        }
                                        intent="primary"
                                        size="large"
                                    >
                                        Send request
                                    </FernButton>
                                ) : (
                                    <Spinner />
                                )
                            }
                        />
                    ),
                    loaded: (response) => <PlaygroundResponsePreview responseBody={response.body} />,
                    failed: () => <span>Failed</span>,
                })}
            </div>
        </div>
    );
};
