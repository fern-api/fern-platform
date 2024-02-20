import { Spinner } from "@blueprintjs/core";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { Loadable, visitLoadable } from "@fern-ui/loadable";
import classNames from "classnames";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { isEmpty, round } from "lodash-es";
import { Dispatch, FC, SetStateAction, useCallback, useState } from "react";
import { ResolvedEndpointDefinition } from "../util/resolver";
import { PlaygroundEndpointForm } from "./PlaygroundEndpointForm";
import { PlaygroundRequestPreview } from "./PlaygroundRequestPreview";
import { PlaygroundResponsePreview } from "./PlaygroundResponsePreview";
import { SecretBearer } from "./PlaygroundSecretsModal";
import { PlaygroundRequestFormState, ResponsePayload } from "./types";
import { useHorizontalSplitPane, useWindowWidth } from "./useSplitPlane";

interface ApiPlayroundContentProps {
    auth: APIV1Read.ApiAuth | undefined;
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundRequestFormState>>;
    resetWithExample: () => void;
    resetWithoutExample: () => void;
    openSecretsModal: () => void;
    secrets: SecretBearer[];
    response: Loadable<ResponsePayload>;
}

const requestTypeAtom = atomWithStorage<"form" | "curl" | "javascript" | "python">("api-playground-atom-alpha", "form");

export const ApiPlayroundContent: FC<ApiPlayroundContentProps> = ({
    auth,
    endpoint,
    formState,
    setFormState,
    resetWithExample,
    resetWithoutExample,
    openSecretsModal,
    secrets,
    response,
}) => {
    const [requestType, setRequestType] = useAtom(requestTypeAtom);
    const [width, setWidthPercent] = useState<number>(0.7);
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

    return (
        <div className="divide-border-default flex min-h-0 flex-1 shrink items-stretch divide-x">
            <div
                className={"relative flex min-w-0 shrink flex-col overflow-hidden"}
                style={{ width: response.type !== "notStartedLoading" ? `${width * 100}%` : "100%" }}
            >
                <div className="border-default flex h-10 w-full shrink-0 items-center justify-between border-b px-4 py-2">
                    <span className="t-muted text-xs uppercase">Request</span>

                    <div className="flex items-center text-xs">
                        <button
                            className={classNames("px-2 py-1 -my-1 rounded-lg hover:t-accent", {
                                "bg-tag-primary t-accent": requestType === "form",
                                "t-muted": requestType !== "form",
                            })}
                            onClick={() => setRequestType("form")}
                        >
                            Form
                        </button>
                        <button
                            className={classNames("px-2 py-1 -my-1 rounded-lg hover:t-accent", {
                                "bg-tag-primary t-accent": requestType === "curl",
                                "t-muted": requestType !== "curl",
                            })}
                            onClick={() => setRequestType("curl")}
                        >
                            CURL
                        </button>
                        <button
                            className={classNames("px-2 py-1 -my-1 rounded-lg hover:t-accent", {
                                "bg-tag-primary t-accent": requestType === "javascript",
                                "t-muted": requestType !== "javascript",
                            })}
                            onClick={() => setRequestType("javascript")}
                        >
                            JavaScript
                        </button>
                        <button
                            className={classNames("px-2 py-1 -my-1 rounded-lg hover:t-accent", {
                                "bg-tag-primary t-accent": requestType === "python",
                                "t-muted": requestType !== "python",
                            })}
                            onClick={() => setRequestType("python")}
                        >
                            Python
                        </button>

                        <div className="bg-border-default mx-2 h-[40px] w-[1px] shrink-0" />

                        <button
                            className={"hover:t-accent t-muted -my-1 whitespace-nowrap rounded-lg px-2 py-1"}
                            onClick={resetWithExample}
                        >
                            Use example
                        </button>
                        <button
                            className={"hover:t-accent t-muted -my-1 whitespace-nowrap rounded-lg px-2 py-1"}
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
            {response.type !== "notStartedLoading" && (
                <div className="relative flex min-h-0 min-w-0 flex-1 shrink flex-col">
                    {/* {response.type !== "notStartedLoading" && endpoint != null && (
                    <div className="absolute bottom-4 right-4 z-20">
                        <FernButton
                            onClick={sendRequest}
                            rightIcon={<PaperPlaneIcon className="transition-transform group-hover:translate-x-0.5" />}
                            intent="primary"
                        >
                            Send request
                        </FernButton>
                    </div>
                )} */}

                    <div
                        className="bg-accent absolute inset-y-0 z-30 -ml-0.5 w-1 cursor-col-resize opacity-0 transition-opacity hover:opacity-100 active:opacity-100"
                        onMouseDown={handleResize}
                    />
                    <div className="border-default flex h-10 w-full shrink-0 items-center justify-between border-b px-4 py-2">
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
                                    className={"bg-tag-default flex h-5 items-center rounded-md px-1.5 py-1 font-mono"}
                                >
                                    time: {round(response.value.time, 2)}ms
                                </span>
                                {!isEmpty(response.value.size) && (
                                    <span
                                        className={
                                            "bg-tag-default flex h-5 items-center rounded-md px-1.5 py-1 font-mono"
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
                            <div className="flex size-full flex-1 items-center justify-center">
                                <Spinner />
                            </div>
                        ),
                        loaded: (response) => <PlaygroundResponsePreview responseBody={response.body} />,
                        failed: () => <span>Failed</span>,
                    })}
                </div>
            )}
        </div>
    );
};
