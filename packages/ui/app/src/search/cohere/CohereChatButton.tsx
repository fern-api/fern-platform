import { ChatbotMessage, ChatbotModal, Citation, CohereIcon } from "@fern-ui/chatbot";
import * as Dialog from "@radix-ui/react-dialog";
import type { Cohere } from "cohere-ai";
import { useAtom } from "jotai";
import { ReactElement, isValidElement } from "react";
import { createPortal } from "react-dom";
import urlJoin from "url-join";
import { useCallbackOne } from "use-memo-one";
import { Stream } from "../../api-playground/Stream";
import { COHERE_ASK_AI, useBasePath } from "../../atoms";
import { FernLink } from "../../components/FernLink";
import { useRouteChanged } from "../../hooks/useRouteChanged";
import { CodeBlock } from "../../mdx/components/code";
import { useSearchConfig } from "../../services/useSearchService";
import { BuiltWithFern } from "../../sidebar/BuiltWithFern";

export function CohereChatButton(): ReactElement | null {
    const [config] = useSearchConfig();
    const [enabled, setEnabled] = useAtom(COHERE_ASK_AI);
    const basePath = useBasePath();

    // Close the dialog when the route changes
    useRouteChanged(
        useCallbackOne(() => {
            setEnabled(false);
        }, [setEnabled]),
    );

    const chatStream = async (message: string, conversationId: string) => {
        const abortController = new AbortController();
        const body = await fetch(urlJoin(basePath || "/", "/api/fern-docs/search/cohere"), {
            method: "POST",
            signal: abortController.signal,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ conversationId, message }),
        }).then((res) => res.body);

        if (body == null) {
            return [undefined, abortController] as const;
        }

        let text = "";
        const citations: Citation[] = [];

        const stream = new Stream<ChatbotMessage>({
            stream: body,
            parse: async (val) => {
                const event = val as Cohere.StreamedChatResponse;
                if (event.eventType === "text-generation") {
                    text += event.text;
                }

                if (event.eventType === "citation-generation") {
                    event.citations.forEach((citation) => {
                        citations.push({
                            text: citation.text,
                            start: citation.start,
                            end: citation.end,
                            slugs: citation.documentIds,
                        });
                    });
                }

                return { message: text, role: "AI", citations };
            },
            terminator: "\n",
        });

        return [stream, abortController] as const;
    };

    if (!config.isAvailable || config.inkeep != null || typeof window === "undefined") {
        return null;
    }

    return (
        <Dialog.Root open={enabled} onOpenChange={setEnabled}>
            {createPortal(
                <Dialog.Trigger asChild>
                    <button className="fixed bottom-6 right-6 bg-background px-5 py-3 rounded-full border border-default inline-flex gap-2 items-center">
                        <CohereIcon />
                        <span>Ask AI</span>
                    </button>
                </Dialog.Trigger>,
                document.body,
            )}
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-0 bg-background/50 backdrop-blur-sm" />
                <Dialog.Content className="fixed md:max-w-content-width my-[10vh] top-0 inset-x-0 mx-6 max-h-[80vh] md:mx-auto flex flex-col">
                    <ChatbotModal
                        chatStream={chatStream}
                        className="bg-search-dialog border-default flex h-auto min-h-0 shrink flex-col overflow-hidden rounded-xl border text-left align-middle shadow-2xl backdrop-blur-lg"
                        components={{
                            pre(props) {
                                if (isValidElement(props.children) && props.children.type === "code") {
                                    const { children, className } = props.children.props;
                                    if (typeof children === "string") {
                                        const match = /language-(\w+)/.exec(className || "")?.[1] ?? "plaintext";
                                        return <CodeBlock code={children} language={match} />;
                                    }
                                }
                                return <pre {...props} />;
                            },
                            a({ href, ...props }) {
                                if (href == null) {
                                    return <a {...props} />;
                                }
                                return <FernLink href={href} {...props} />;
                            },
                        }}
                        belowInput={
                            <div className="mt-4 px-5 text-grayscale-a10 flex justify-between items-center gap-2">
                                <FernLink href="https://cohere.com/" className="text-xs font-medium">
                                    Powered by Cohere (command-r-plus)
                                </FernLink>
                                <BuiltWithFern />
                            </div>
                        }
                    />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
