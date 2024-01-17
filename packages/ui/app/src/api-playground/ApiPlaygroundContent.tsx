import { NonIdealState, Spinner } from "@blueprintjs/core";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { failed, Loadable, loaded, loading, notStartedLoading, visitLoadable } from "@fern-ui/loadable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { isEmpty, round } from "lodash-es";
import { Dispatch, FC, SetStateAction, useCallback, useState } from "react";
import { useApiPlaygroundContext } from "./ApiPlaygroundContext";
import { ApiPlaygroundEndpointSelector } from "./ApiPlaygroundEndpointSelector";
import { PlaygroundEndpointForm } from "./PlaygroundEndpointForm";
import { PlaygroundRequestPreview } from "./PlaygroundRequestPreview";
import { PlaygroundResponsePreview } from "./PlaygroundResponsePreview";
import { SecretBearer } from "./PlaygroundSecretsModal";
import { PlaygroundRequestFormState } from "./types";
import { buildUnredactedHeaders, buildUrl } from "./utils";

interface ResponsePayload {
    status: number;
    time: number;
    size: string | null;
    body: unknown;
}

interface ApiPlayroundContentProps {
    endpoint: APIV1Read.EndpointDefinition;
    slug: string | undefined;
    apiId: string | undefined;
    package: APIV1Read.ApiDefinitionPackage | undefined;
    formState: PlaygroundRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundRequestFormState>>;
    resetWithExample: () => void;
    resetWithoutExample: () => void;
    openSecretsModal: () => void;
    secrets: SecretBearer[];
    resolveTypeById: (typeId: APIV1Read.TypeId) => APIV1Read.TypeDefinition | undefined;
}

const requestTypeAtom = atomWithStorage<"curl" | "javascript" | "python">("api-playground-atom-alpha", "curl");

export const ApiPlayroundContent: FC<ApiPlayroundContentProps> = ({
    endpoint,
    package: package_,
    formState,
    setFormState,
    resetWithExample,
    resetWithoutExample,
    openSecretsModal,
    secrets,
    slug,
    apiId,
    resolveTypeById,
}) => {
    const { apiDefinition } = useApiPlaygroundContext();

    const [requestType, setRequestType] = useAtom(requestTypeAtom);

    const [response, setResponse] = useState<Loadable<ResponsePayload>>(notStartedLoading());

    const sendRequest = useCallback(async () => {
        setResponse(loading());
        try {
            const response = await fetch("/api/proxy", {
                method: "POST",
                headers: buildUnredactedHeaders(apiDefinition?.auth, endpoint, formState),
                body: JSON.stringify({
                    url: buildUrl(endpoint, formState),
                    method: endpoint?.method,
                    headers: buildUnredactedHeaders(apiDefinition?.auth, endpoint, formState),
                    body: formState?.body,
                }),
            });
            setResponse(loaded(await response.json()));
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            setResponse(failed(e));
        }
    }, [apiDefinition?.auth, endpoint, formState]);

    return (
        <div className="divide-border-default-light dark:divide-border-default-dark flex min-h-0 flex-1 shrink items-stretch divide-x">
            <div className="relative flex min-w-0 flex-1 shrink flex-col overflow-hidden">
                <div className="border-border-default-light dark:border-border-default-dark flex h-10 w-full shrink-0 items-center justify-between border-b px-4 py-2">
                    <ApiPlaygroundEndpointSelector
                        endpoint={endpoint}
                        package={package_}
                        popoverPlacement="bottom-start"
                    />

                    <div className="flex items-center text-xs">
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
                <PlaygroundEndpointForm
                    endpoint={endpoint}
                    formState={formState}
                    setFormState={setFormState}
                    openSecretsModal={openSecretsModal}
                    secrets={secrets}
                    slug={slug}
                    apiId={apiId}
                    resolveTypeById={resolveTypeById}
                />
            </div>
            <div className="divide-border-default-light dark:divide-border-default-dark xl:flex-2 flex min-w-0 flex-1 shrink flex-col divide-y xl:flex-row xl:divide-x xl:divide-y-0">
                <div className="flex min-h-0 min-w-0 flex-1 shrink flex-col">
                    <div className="border-border-default-light dark:border-border-default-dark flex h-10 w-full shrink-0 items-center justify-between border-b px-4 py-2">
                        <span className="t-muted text-xs uppercase">Request</span>
                        <div className="flex items-center text-xs">
                            <button
                                className={classNames(
                                    "px-2 py-1 -my-1 rounded-lg hover:text-accent-primary hover:dark:text-accent-primary-dark",
                                    {
                                        "bg-tag-primary dark:bg-tag-primary-dark text-accent-primary dark:text-accent-primary-dark":
                                            requestType === "curl",
                                        "t-muted": requestType !== "curl",
                                    }
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
                                    }
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
                                    }
                                )}
                                onClick={() => setRequestType("python")}
                            >
                                Python
                            </button>
                        </div>
                    </div>
                    <PlaygroundRequestPreview
                        auth={apiDefinition?.auth}
                        endpoint={endpoint}
                        formState={formState}
                        requestType={requestType}
                    />
                </div>
                <div className="relative flex min-h-0 min-w-0 flex-1 shrink flex-col">
                    {response.type !== "notStartedLoading" && endpoint != null && (
                        <div className="absolute bottom-4 right-4 z-20">
                            <button
                                className="dark:text-dark bg-accent-primary dark:bg-accent-primary-dark hover:bg-accent-primary/70 dark:hover:bg-accent-primary-dark/70 text-accent-primary-contrast dark:text-accent-primary-dark-contrast group flex items-center justify-center space-x-3 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                                onClick={sendRequest}
                            >
                                <span className="whitespace-nowrap">Send request</span>
                                <div className="flex h-4 w-4 items-center">
                                    <FontAwesomeIcon
                                        icon="paper-plane-top"
                                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                                    />
                                </div>
                            </button>
                        </div>
                    )}
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
                                        <button
                                            className="dark:text-dark bg-accent-primary dark:bg-accent-primary-dark hover:bg-accent-primary/70 dark:hover:bg-accent-primary-dark/70 text-accent-primary-contrast dark:text-accent-primary-dark-contrast group flex items-center justify-center space-x-3 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                                            onClick={sendRequest}
                                        >
                                            <span className="whitespace-nowrap">Send request</span>
                                            <div className="flex h-4 w-4 items-center">
                                                <FontAwesomeIcon
                                                    icon="paper-plane-top"
                                                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                                                />
                                            </div>
                                        </button>
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
        </div>
    );
};
