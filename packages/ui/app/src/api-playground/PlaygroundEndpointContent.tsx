import { Loadable, visitLoadable } from "@fern-ui/loadable";
import cn from "clsx";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { isEmpty, round } from "lodash-es";
import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from "react";
import { FernAudioPlayer } from "../components/FernAudioPlayer";
import { FernButton, FernButtonGroup } from "../components/FernButton";
import { FernCard } from "../components/FernCard";
import { FernErrorTag, stringifyError } from "../components/FernErrorBoundary";
import { CopyToClipboardButton } from "../syntax-highlighting/CopyToClipboardButton";
import { ResolvedEndpointDefinition, ResolvedTypeDefinition } from "../util/resolver";
import { PlaygroundAuthorizationFormCard } from "./PlaygroundAuthorizationForm";
import { PlaygroundEndpointForm } from "./PlaygroundEndpointForm";
import { PlaygroundEndpointFormAside } from "./PlaygroundEndpointFormAside";
import { PlaygroundRequestPreview } from "./PlaygroundRequestPreview";
import { PlaygroundResponsePreview } from "./PlaygroundResponsePreview";
import { PlaygroundSendRequestButton } from "./PlaygroundSendRequestButton";
import { PlaygroundEndpointRequestFormState } from "./types";
import { PlaygroundResponse } from "./types/playgroundResponse";
import { stringifyCurl, stringifyFetch, stringifyPythonRequests } from "./utils";
import { HorizontalSplitPane, VerticalSplitPane } from "./VerticalSplitPane";

interface PlaygroundEndpointContentProps {
    endpoint: ResolvedEndpointDefinition;
    formState: PlaygroundEndpointRequestFormState;
    setFormState: Dispatch<SetStateAction<PlaygroundEndpointRequestFormState>>;
    resetWithExample: () => void;
    resetWithoutExample: () => void;
    response: Loadable<PlaygroundResponse>;
    sendRequest: () => void;
    types: Record<string, ResolvedTypeDefinition>;
}

const requestTypeAtom = atomWithStorage<"curl" | "javascript" | "python">("api-playground-atom-alpha", "curl");

export const PlaygroundEndpointContent: FC<PlaygroundEndpointContentProps> = ({
    endpoint,
    formState,
    setFormState,
    resetWithExample,
    resetWithoutExample,
    response,
    sendRequest,
    types,
}) => {
    const [requestType, setRequestType] = useAtom(requestTypeAtom);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [scrollAreaHeight, setScrollAreaHeight] = useState(0);

    useEffect(() => {
        if (typeof window === "undefined" || scrollAreaRef.current == null) {
            return;
        }
        const resizeObserver = new window.ResizeObserver(([size]) => {
            if (size != null) {
                setScrollAreaHeight(size.contentRect.height);
            }
        });
        resizeObserver.observe(scrollAreaRef.current);
        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div className="flex min-h-0 w-full flex-1 shrink items-stretch divide-x">
            <div
                ref={scrollAreaRef}
                className="mask-grad-top w-full overflow-x-hidden overflow-y-scroll overscroll-contain"
            >
                <HorizontalSplitPane
                    rizeBarHeight={scrollAreaHeight}
                    leftClassName="pl-6 pr-1 mt"
                    rightClassName="pl-1"
                >
                    <div className="mx-auto w-full max-w-5xl space-y-6 pt-6">
                        {endpoint.auth != null && (
                            <PlaygroundAuthorizationFormCard
                                auth={endpoint.auth}
                                authState={formState?.auth}
                                setAuthorization={(newState) =>
                                    setFormState((oldState) => ({
                                        ...oldState,
                                        auth: typeof newState === "function" ? newState(oldState.auth) : newState,
                                    }))
                                }
                                disabled={false}
                            />
                        )}

                        <div className="grid grid-cols-3 gap-4">
                            <PlaygroundEndpointFormAside
                                className="col-span-1 -mt-6"
                                endpoint={endpoint}
                                formState={formState}
                                scrollAreaHeight={scrollAreaHeight}
                                resetWithExample={resetWithExample}
                                resetWithoutExample={resetWithoutExample}
                                types={types}
                            />
                            <PlaygroundEndpointForm
                                endpoint={endpoint}
                                formState={formState}
                                setFormState={setFormState}
                                types={types}
                            />
                        </div>
                    </div>

                    <VerticalSplitPane
                        className="sticky inset-0 pr-6"
                        style={{ height: scrollAreaHeight }}
                        aboveClassName={"pt-6 pb-1 flex items-stretch justify-stretch"}
                        belowClassName="pb-6 pt-1 flex items-stretch justify-stretch"
                    >
                        <FernCard className="flex min-w-0 flex-1 shrink flex-col overflow-hidden rounded-xl shadow-sm">
                            <div className="border-default flex h-10 w-full shrink-0 items-center justify-between border-b px-3 py-2">
                                <span className="t-muted text-xs uppercase">Request</span>

                                <FernButtonGroup>
                                    <FernButton
                                        onClick={() => setRequestType("curl")}
                                        size="small"
                                        variant="minimal"
                                        intent={requestType === "curl" ? "primary" : "none"}
                                        active={requestType === "curl"}
                                    >
                                        cURL
                                    </FernButton>
                                    <FernButton
                                        onClick={() => setRequestType("javascript")}
                                        size="small"
                                        variant="minimal"
                                        intent={requestType === "javascript" ? "primary" : "none"}
                                        active={requestType === "javascript"}
                                    >
                                        JavaScript
                                    </FernButton>
                                    <FernButton
                                        onClick={() => setRequestType("python")}
                                        size="small"
                                        variant="minimal"
                                        intent={requestType === "python" ? "primary" : "none"}
                                        active={requestType === "python"}
                                    >
                                        Python
                                    </FernButton>
                                </FernButtonGroup>

                                <CopyToClipboardButton
                                    content={() =>
                                        requestType === "curl"
                                            ? stringifyCurl(endpoint, formState, false)
                                            : requestType === "javascript"
                                              ? stringifyFetch(endpoint, formState, false)
                                              : requestType === "python"
                                                ? stringifyPythonRequests(endpoint, formState, false)
                                                : ""
                                    }
                                    className="-mr-2"
                                />
                            </div>
                            <PlaygroundRequestPreview
                                endpoint={endpoint}
                                formState={formState}
                                requestType={requestType}
                            />
                        </FernCard>
                        <FernCard className="flex min-w-0 flex-1 shrink flex-col overflow-hidden rounded-xl shadow-sm">
                            <div className="border-default flex h-10 w-full shrink-0 items-center justify-between border-b px-3 py-2">
                                <span className="t-muted text-xs uppercase">Response</span>

                                {response.type === "loaded" && (
                                    <div className="flex items-center gap-2 text-xs">
                                        <span
                                            className={cn("font-mono flex items-center py-1 px-1.5 rounded-md h-5", {
                                                ["bg-method-get/10 text-method-get dark:bg-method-get-dark/10 dark:text-method-get-dark"]:
                                                    response.value.response.status >= 200 &&
                                                    response.value.response.status < 300,
                                                ["bg-method-delete/10 text-method-delete dark:bg-method-delete-dark/10 dark:text-method-delete-dark"]:
                                                    response.value.response.status > 300,
                                            })}
                                        >
                                            status: {response.value.response.status}
                                        </span>
                                        <span
                                            className={
                                                "bg-tag-default flex h-5 items-center rounded-md px-1.5 py-1 font-mono"
                                            }
                                        >
                                            time: {round(response.value.time, 2)}ms
                                        </span>
                                        {response.value.type === "json" && !isEmpty(response.value.size) && (
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

                                {visitLoadable(response, {
                                    loading: () => <div />,
                                    loaded: (response) =>
                                        response.type === "file" ? (
                                            <div />
                                        ) : (
                                            <CopyToClipboardButton
                                                content={() =>
                                                    response.type === "json"
                                                        ? JSON.stringify(response.response.body, null, 2)
                                                        : response.type === "stream"
                                                          ? response.response.body
                                                          : ""
                                                }
                                                className="-mr-2"
                                            />
                                        ),
                                    failed: () => <div />,
                                })}
                            </div>
                            {visitLoadable(response, {
                                loading: () =>
                                    response.type === "notStartedLoading" ? (
                                        <div className="flex flex-1 items-center justify-center">
                                            <PlaygroundSendRequestButton sendRequest={sendRequest} />
                                        </div>
                                    ) : (
                                        <div className="flex flex-1 items-center justify-center">Loading...</div>
                                    ),
                                loaded: (response) =>
                                    response.type !== "file" ? (
                                        <PlaygroundResponsePreview response={response} />
                                    ) : response.response.contentType.startsWith("audio/") ? (
                                        <FernAudioPlayer
                                            src={response.response.src}
                                            title={"Untitled"}
                                            className="flex h-full items-center justify-center p-4"
                                        />
                                    ) : (
                                        <FernErrorTag
                                            error={`File preview not supported for ${response.response.contentType}`}
                                            className="flex h-full items-center justify-center"
                                        />
                                    ),
                                failed: (e) => (
                                    <FernErrorTag
                                        error={stringifyError(e)}
                                        className="flex h-full items-center justify-center"
                                    />
                                ),
                            })}
                        </FernCard>
                    </VerticalSplitPane>
                </HorizontalSplitPane>
            </div>
        </div>
    );
};
