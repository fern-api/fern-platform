import { FernScrollArea } from "@fern-ui/components";
import clsx from "clsx";
import { throttle } from "es-toolkit/function";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import type { Components } from "react-markdown";
import { v4 } from "uuid";
import { ChatbotMessage, Citation, Message } from "../types";
import { AskInput } from "./AskInput";
import { ChatConversation } from "./ChatConversation";
import { ResponseMessageWithCitations } from "./ResponseMessage";

interface ChatHistory {
    conversationId: string;
    messages: Message[];
}

interface ChatbotModalProps {
    chatStream: (
        message: string,
        conversationId: string,
    ) => Promise<readonly [stream: AsyncIterable<ChatbotMessage> | undefined, abort: AbortController]>;
    className?: string;
    components?: Components;
    belowInput?: React.ReactNode;
}

export type ChatbotModalRef = {
    reset: () => void;
    sendMessage: (message: string) => void;
};

export const ChatbotModal = forwardRef<ChatbotModalRef, ChatbotModalProps>(
    ({ chatStream, className, components, belowInput }, ref) => {
        const [chatHistory, setChatHistory] = useState<ChatHistory>(() => ({
            conversationId: v4(),
            messages: [],
        }));
        const [isStreaming, setIsStreaming] = useState(false);
        const [responseMessage, setResponseMessage] = useState<string>("");
        const [citations, setCitations] = useState<Citation[]>([]);

        const abortRef = useRef<AbortController>();
        const scrollRef = useRef<HTMLDivElement>(null);

        const shouldShowConversation = chatHistory.messages.length > 0 || isStreaming || responseMessage.length > 0;

        const scrollToBottom = useRef(
            throttle((smooth: boolean = false) => {
                scrollRef.current?.scrollTo({
                    top: scrollRef.current.scrollHeight,
                    behavior: smooth ? "smooth" : "instant",
                });
            }, 150),
        );

        const sendMessage = (message: string) => {
            if (message.trim().length === 0) {
                return;
            }

            if (abortRef.current?.signal.aborted === false) {
                abortRef.current.abort();
            }
            setChatHistory((prev) => {
                const messages = [...prev.messages];
                if (responseMessage.length > 0) {
                    messages.push({ role: "AI", message: responseMessage, citations });
                }
                messages.push({ role: "USER", message });
                return { ...prev, messages };
            });
            setIsStreaming(true);
            setResponseMessage("");
            setCitations([]);
            scrollToBottom.current();
            void chatStream(message, chatHistory.conversationId).then(async ([stream, abort]) => {
                abortRef.current = abort;
                for await (const { message, citations } of stream ?? []) {
                    if (abortRef.current.signal.aborted) {
                        return;
                    }
                    setResponseMessage(message);
                    setCitations(citations);
                    scrollToBottom.current(true);
                }
                if (abortRef.current.signal.aborted) {
                    return;
                }
                setIsStreaming(false);
            });
        };

        const reset = () => {
            if (abortRef.current?.signal.aborted === false) {
                abortRef.current.abort();
            }
            setChatHistory({
                conversationId: v4(),
                messages: [],
            });
            setIsStreaming(false);
            setResponseMessage("");
            setCitations([]);
        };

        useImperativeHandle(ref, () => ({ reset, sendMessage }));

        return (
            <section className={clsx("flex flex-col", className)}>
                <div className="px-4 py-2">
                    {shouldShowConversation && (
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-grayscale-a11">Ask Cohere</span>
                            <button className="text-xs text-grayscale-a11 hover:text-grayscale-a12" onClick={reset}>
                                Clear Chat
                            </button>
                        </div>
                    )}
                </div>
                {shouldShowConversation && (
                    <FernScrollArea scrollbars="vertical" className="px-4 py-6 mask-grad-y-6" ref={scrollRef}>
                        <ChatConversation messages={chatHistory.messages} components={components}>
                            <ResponseMessageWithCitations
                                isStreaming={isStreaming}
                                message={responseMessage}
                                citations={citations}
                                components={components}
                            />
                        </ChatConversation>
                    </FernScrollArea>
                )}
                <div className="p-4 pt-0">
                    <AskInput onSend={sendMessage} />
                    {belowInput}
                </div>
            </section>
        );
    },
);
