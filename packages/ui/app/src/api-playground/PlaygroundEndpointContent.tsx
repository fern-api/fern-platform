import {
    CopyToClipboardButton,
    FernAudioPlayer,
    FernButton,
    FernButtonGroup,
    FernCard,
    FernTabs,
    FernTooltip,
    FernTooltipProvider,
} from "@fern-ui/components";
import { Loadable, visitLoadable } from "@fern-ui/loadable";
import cn from "clsx";
import { Download, SendSolid } from "iconoir-react";
import { useAtom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { isEmpty, round } from "lodash-es";
import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from "react";
import { IS_MOBILE_SCREEN_ATOM, PLAYGROUND_AUTH_STATE_ATOM, store, useFeatureFlags } from "../atoms";
import { FernErrorTag } from "../components/FernErrorBoundary";
import { ResolvedEndpointDefinition, ResolvedTypeDefinition } from "../resolver/types";
import { PlaygroundAuthorizationFormCard } from "./PlaygroundAuthorizationForm";
import { PlaygroundEndpointForm } from "./PlaygroundEndpointForm";
import { PlaygroundEndpointFormButtons } from "./PlaygroundEndpointFormButtons";
import { PlaygroundRequestPreview } from "./PlaygroundRequestPreview";
import { PlaygroundResponsePreview } from "./PlaygroundResponsePreview";
import { PlaygroundSendRequestButton } from "./PlaygroundSendRequestButton";
import { HorizontalSplitPane, VerticalSplitPane } from "./VerticalSplitPane";
import { PlaygroundCodeSnippetResolverBuilder } from "./code-snippets/resolver";
import { PlaygroundEndpointRequestFormState, ProxyResponse } from "./types";
import { PlaygroundResponse } from "./types/playgroundResponse";

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

const requestTypeAtom = atomWithStorage<"curl" | "typescript" | "python">("api-playground-atom-alpha", "curl");

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
    const { isBinaryOctetStreamAudioPlayer, isSnippetTemplatesEnabled, isFileForgeHackEnabled } = useFeatureFlags();
    const [requestType, setRequestType] = useAtom(requestTypeAtom);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [scrollAreaHeight, setScrollAreaHeight] = useState(0);

    const isMobileScreen = useAtomValue(IS_MOBILE_SCREEN_ATOM);

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

    const form = (
        <div className="mx-auto w-full max-w-5xl space-y-6 pt-6 max-sm:pt-0 sm:pb-20">
            {endpoint.auth != null && <PlaygroundAuthorizationFormCard auth={endpoint.auth} disabled={false} />}

            <PlaygroundEndpointForm
                endpoint={endpoint}
                formState={formState}
                setFormState={setFormState}
                types={types}
            />

            <PlaygroundEndpointFormButtons
                endpoint={endpoint}
                resetWithExample={resetWithExample}
                resetWithoutExample={resetWithoutExample}
            />
        </div>
    );

    const requestCard = (
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
                        onClick={() => setRequestType("typescript")}
                        size="small"
                        variant="minimal"
                        intent={requestType === "typescript" ? "primary" : "none"}
                        active={requestType === "typescript"}
                    >
                        TypeScript
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
                    content={() => {
                        const authState = store.get(PLAYGROUND_AUTH_STATE_ATOM);
                        const resolver = new PlaygroundCodeSnippetResolverBuilder(
                            endpoint,
                            isSnippetTemplatesEnabled,
                            isFileForgeHackEnabled,
                        ).create(authState, formState);
                        return resolver.resolve(requestType);
                    }}
                    className="-mr-2"
                />
            </div>
            <PlaygroundRequestPreview endpoint={endpoint} formState={formState} requestType={requestType} />
        </FernCard>
    );

    const responseCard = (
        <FernCard className="flex min-w-0 flex-1 shrink flex-col overflow-hidden rounded-xl shadow-sm">
            <div className="border-default flex h-10 w-full shrink-0 items-center justify-between border-b px-3 py-2">
                <span className="t-muted text-xs uppercase">Response</span>

                {response.type === "loaded" && (
                    <div className="flex items-center gap-2 text-xs">
                        <span
                            className={cn("font-mono flex items-center py-1 px-1.5 rounded-md h-5", {
                                ["bg-method-get/10 text-method-get dark:bg-method-get-dark/10 dark:text-method-get-dark"]:
                                    response.value.response.status >= 200 && response.value.response.status < 300,
                                ["bg-method-delete/10 text-method-delete dark:bg-method-delete-dark/10 dark:text-method-delete-dark"]:
                                    response.value.response.status > 300,
                            })}
                        >
                            status: {response.value.response.status}
                        </span>
                        <span className={"flex h-5 items-center rounded-md bg-tag-default px-1.5 py-1 font-mono"}>
                            time: {round(response.value.time, 2)}ms
                        </span>
                        {response.value.type === "json" && !isEmpty(response.value.size) && (
                            <span className={"flex h-5 items-center rounded-md bg-tag-default px-1.5 py-1 font-mono"}>
                                size: {response.value.size}b
                            </span>
                        )}
                    </div>
                )}

                {visitLoadable(response, {
                    loading: () => <div />,
                    loaded: (response) =>
                        response.type === "file" ? (
                            <FernTooltipProvider>
                                <FernTooltip content="Download file">
                                    <FernButton
                                        icon={<Download />}
                                        size="small"
                                        variant="minimal"
                                        onClick={() => {
                                            const a = document.createElement("a");
                                            a.href = response.response.body;
                                            a.download = createFilename(response.response, response.contentType);
                                            a.click();
                                        }}
                                    />
                                </FernTooltip>
                            </FernTooltipProvider>
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
                    failed: () => (
                        <span className="flex items-center rounded-[4px] bg-tag-danger p-1 font-mono text-xs uppercase leading-none text-intent-danger">
                            Failed
                        </span>
                    ),
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
                    ) : response.contentType.startsWith("audio/") ||
                      (isBinaryOctetStreamAudioPlayer && response.contentType === "binary/octet-stream") ? (
                        <FernAudioPlayer
                            src={response.response.body}
                            className="flex h-full items-center justify-center p-4"
                        />
                    ) : response.contentType.includes("application/pdf") ? (
                        <iframe
                            src={response.response.body}
                            className="size-full"
                            title="PDF preview"
                            allowFullScreen
                        />
                    ) : (
                        <FernErrorTag
                            component="PlaygroundEndpointContent"
                            error={`File preview not supported for ${response.contentType}`}
                            className="flex h-full items-center justify-center"
                            showError
                        />
                    ),
                failed: (e) => (
                    <FernErrorTag
                        component="PlaygroundEndpointContent"
                        error={e}
                        className="flex h-full items-center justify-center"
                        showError={true}
                    />
                ),
            })}
        </FernCard>
    );

    const [tabValue, setTabValue] = useState<string>("0");
    return (
        <div className="flex min-h-0 w-full flex-1 shrink items-stretch divide-x">
            <div
                ref={scrollAreaRef}
                className="mask-grad-top-6 w-full overflow-x-hidden overflow-y-scroll overscroll-contain"
            >
                {!isMobileScreen ? (
                    <HorizontalSplitPane
                        rizeBarHeight={scrollAreaHeight}
                        leftClassName="pl-6 pr-1 mt"
                        rightClassName="pl-1"
                    >
                        {form}

                        <VerticalSplitPane
                            className="sticky inset-0 pr-6"
                            style={{ height: scrollAreaHeight }}
                            aboveClassName={"pt-6 pb-1 flex items-stretch justify-stretch"}
                            belowClassName="pb-6 pt-1 flex items-stretch justify-stretch"
                        >
                            {requestCard}
                            {responseCard}
                        </VerticalSplitPane>
                    </HorizontalSplitPane>
                ) : (
                    <FernTabs
                        className="px-4"
                        defaultValue="0"
                        value={tabValue}
                        onValueChange={setTabValue}
                        tabs={[
                            {
                                title: "Request",
                                content: (
                                    <div className="space-y-4 pb-6">
                                        {form}
                                        <div className="border-default flex justify-end border-b pb-4">
                                            <PlaygroundSendRequestButton
                                                sendRequest={() => {
                                                    sendRequest();
                                                    setTabValue("1");
                                                }}
                                                sendRequestIcon={
                                                    <SendSolid className="transition-transform group-hover:translate-x-0.5" />
                                                }
                                            />
                                        </div>
                                        {requestCard}
                                    </div>
                                ),
                            },
                            { title: "Response", content: responseCard },
                        ]}
                    />
                )}
            </div>
        </div>
    );
};

function createFilename(body: ProxyResponse.SerializableFileBody, contentType: string): string {
    const headers = new Headers(body.headers);
    const contentDisposition = headers.get("Content-Disposition");

    if (contentDisposition != null) {
        const filename = contentDisposition.split("filename=")[1];
        if (filename != null) {
            return filename;
        }
    }

    // TODO: use a more deterministic way to generate filenames
    const extension = contentType.split("/")[1];
    return `${crypto.randomUUID()}.${extension}`;
}
