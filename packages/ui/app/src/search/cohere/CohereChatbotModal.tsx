import { ChatbotMessage, ChatbotModal, ChatbotModalRef, Citation } from "@fern-ui/chatbot";
import { Cohere } from "cohere-ai";
import { useAtomValue } from "jotai";
import { ReactElement, isValidElement, useRef } from "react";
import { useCallbackOne } from "use-memo-one";
import { Stream } from "../../api-playground/Stream";
import { COHERE_INITIAL_MESSAGE, useAtomEffect } from "../../atoms";
import { CURRENT_VERSION_ID_ATOM } from "../../atoms/navigation";
import { FernLink } from "../../components/FernLink";
import { useApiRoute } from "../../hooks/useApiRoute";
import { CodeBlock } from "../../mdx/components/code";
import { BuiltWithFern } from "../../sidebar/BuiltWithFern";

export function CohereChatbotModal({ className }: { className?: string }): ReactElement {
    const versionId = useAtomValue(CURRENT_VERSION_ID_ATOM);

    const ref = useRef<ChatbotModalRef>(null);

    useAtomEffect(
        useCallbackOne((get, set) => {
            const initialMessage = get.peek(COHERE_INITIAL_MESSAGE);
            if (initialMessage.trim().length === 0) {
                return;
            }
            ref.current?.sendMessage(initialMessage);
            set(COHERE_INITIAL_MESSAGE, "");
        }, []),
    );

    const cohereApiRoute = useApiRoute("/api/fern-docs/search/cohere");

    const chatStream = async (message: string, conversationId: string) => {
        const abortController = new AbortController();
        const body = await fetch(cohereApiRoute, {
            method: "POST",
            signal: abortController.signal,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ conversationId, message, versionId }),
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
    return (
        <ChatbotModal
            ref={ref}
            chatStream={chatStream}
            className={className}
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
    );
}
