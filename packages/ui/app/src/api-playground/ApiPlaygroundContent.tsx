import { APIV1Read } from "@fern-api/fdr-sdk";
import { Loadable, visitLoadable } from "@fern-ui/loadable";
import classNames from "classnames";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { isEmpty, round } from "lodash-es";
import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from "react";
import { CopyToClipboardButton } from "../commons/CopyToClipboardButton";
import { FernButton, FernButtonGroup } from "../components/FernButton";
import { FernCard } from "../components/FernCard";
import { ResolvedEndpointDefinition } from "../util/resolver";
import { PlaygroundAuthorizationFormCard } from "./PlaygroundAuthorizationForm";
import { PlaygroundEndpointForm } from "./PlaygroundEndpointForm";
import { PlaygroundEndpointFormAside } from "./PlaygroundEndpointFormAside";
import { PlaygroundRequestPreview } from "./PlaygroundRequestPreview";
import { PlaygroundResponsePreview } from "./PlaygroundResponsePreview";
import { SecretBearer } from "./PlaygroundSecretsModal";
import { PlaygroundRequestFormState, ResponsePayload } from "./types";
import { stringifyCurl, stringifyFetch, stringifyPythonRequests } from "./utils";
import { HorizontalSplitPane, VerticalSplitPane } from "./VerticalSplitPane";

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

const requestTypeAtom = atomWithStorage<"curl" | "javascript" | "python">("api-playground-atom-alpha", "curl");

export const ApiPlayroundContent: FC<ApiPlayroundContentProps> = ({
    auth,
    endpoint,
    formState,
    setFormState,
    // resetWithExample,
    // resetWithoutExample,
    openSecretsModal,
    secrets,
    response,
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
        <div className="flex min-h-0 flex-1 shrink items-stretch divide-x">
            {/* <div
                className={"relative flex min-w-0 shrink flex-col overflow-hidden"}
                style={{ width: `${width * 100}%` }}
            > */}
            {/* <div className="border-default flex h-10 w-full shrink-0 items-center justify-between border-b px-6 py-2">
                    <span className="t-muted text-xs uppercase">Request</span>

                    <FernButtonGroup>
                        <FernButton onClick={resetWithExample} size="small" variant="minimal">
                            Use example
                        </FernButton>
                        <FernButton onClick={resetWithoutExample} size="small" variant="minimal">
                            Clear form
                        </FernButton>
                    </FernButtonGroup>
                </div> */}
            {/* <PlaygroundEndpointForm
                    endpoint={endpoint}
                    formState={formState}
                    setFormState={setFormState}
                    openSecretsModal={openSecretsModal}
                    secrets={secrets}
                    auth={auth}
                /> */}
            {/* </div> */}
            <div
                ref={scrollAreaRef}
                className="mask-grad-top w-full overflow-x-hidden overflow-y-scroll overscroll-contain"
            >
                <HorizontalSplitPane
                    rizeBarHeight={scrollAreaHeight}
                    leftClassName="pl-6 pr-1 mt"
                    rightClassName="pl-1"
                >
                    <div className="mx-auto w-full max-w-4xl space-y-6 pt-6">
                        <PlaygroundAuthorizationFormCard
                            endpoint={endpoint}
                            auth={auth}
                            formState={undefined}
                            setFormState={setFormState}
                            openSecretsModal={openSecretsModal}
                            secrets={secrets}
                        />

                        <div className="grid grid-cols-3 gap-6">
                            <PlaygroundEndpointFormAside
                                className="col-span-1"
                                endpoint={endpoint}
                                formState={formState}
                                scrollAreaHeight={scrollAreaHeight}
                            />
                            <PlaygroundEndpointForm
                                endpoint={endpoint}
                                formState={formState}
                                setFormState={setFormState}
                            />
                        </div>
                    </div>

                    <VerticalSplitPane
                        className="sticky inset-0 pr-6"
                        style={{ height: scrollAreaHeight }}
                        aboveClassName={
                            response.type === "notStartedLoading"
                                ? "py-6 flex items-stretch justify-stretch"
                                : "pt-6 pb-1 flex items-stretch justify-stretch"
                        }
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
                                            ? stringifyCurl(auth, endpoint, formState, false)
                                            : requestType === "javascript"
                                              ? stringifyFetch(auth, endpoint, formState, false)
                                              : requestType === "python"
                                                ? stringifyPythonRequests(auth, endpoint, formState, false)
                                                : ""
                                    }
                                    className="-mr-2"
                                />
                            </div>
                            <PlaygroundRequestPreview
                                auth={auth}
                                endpoint={endpoint}
                                formState={formState}
                                requestType={requestType}
                            />
                        </FernCard>
                        {response.type !== "notStartedLoading" ? (
                            <FernCard className="min-w-0 flex-1 shrink overflow-hidden rounded-xl shadow-sm">
                                <div className="border-default flex h-10 w-full shrink-0 items-center justify-between border-b px-3 py-2">
                                    <span className="t-muted text-xs uppercase">Response</span>

                                    {response.type === "loaded" && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <span
                                                className={classNames(
                                                    "font-mono flex items-center py-1 px-1.5 rounded-md h-5",
                                                    {
                                                        ["bg-method-get/10 text-method-get dark:bg-method-get-dark/10 dark:text-method-get-dark"]:
                                                            response.value.status >= 200 && response.value.status < 300,
                                                        ["bg-method-delete/10 text-method-delete dark:bg-method-delete-dark/10 dark:text-method-delete-dark"]:
                                                            response.value.status > 300,
                                                    },
                                                )}
                                            >
                                                status: {response.value.status}
                                            </span>
                                            <span
                                                className={
                                                    "bg-tag-default flex h-5 items-center rounded-md px-1.5 py-1 font-mono"
                                                }
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
                                            Loading...
                                        </div>
                                    ),
                                    loaded: (response) => <PlaygroundResponsePreview responseBody={response.body} />,
                                    failed: () => <span>Failed</span>,
                                })}
                            </FernCard>
                        ) : null}
                    </VerticalSplitPane>
                </HorizontalSplitPane>
            </div>
        </div>
    );
};
