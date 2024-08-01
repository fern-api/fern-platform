import { FernScrollArea } from "@fern-ui/components";
import { useResizeObserver } from "@fern-ui/react-commons";
import clsx from "clsx";
import { debounce, uniqueId } from "lodash-es";
import { ReactElement, useRef, useState } from "react";
import { ChatbotMessage, Citation, Message } from "../types";
import { AskInput } from "./AskInput";
import { ChatConversation } from "./ChatConversation";
import { ResponseMessageWithCitations } from "./ResponseMessage";

interface ChatHistory {
    conversationId: string;
    messages: Message[];
}

interface ChatbotModalProps {
    chatStream: (message: string) => Promise<readonly [stream: ReadableStream<ChatbotMessage>, abort: AbortController]>;
    className?: string;
}

export function ChatbotModal({ chatStream, className }: ChatbotModalProps): ReactElement {
    const [chatHistory, setChatHistory] = useState<ChatHistory>(() => ({
        conversationId: uniqueId(),
        messages: [],
    }));
    const [isStreaming, setIsStreaming] = useState(false);
    const [responseMessage, setResponseMessage] = useState<string>("");
    const [citations, setCitations] = useState<Citation[]>([]);

    const abortRef = useRef<AbortController>();
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollContentRef = useRef<HTMLDivElement>(null);

    const shouldShowConversation = chatHistory.messages.length > 0 || isStreaming || responseMessage.length > 0;

    const scrollToBottom = useRef(
        debounce(
            (smooth: boolean = false) => {
                scrollRef.current?.scrollTo({
                    top: scrollRef.current.scrollHeight,
                    behavior: smooth ? "smooth" : "instant",
                });
            },
            150,
            { leading: true, trailing: false },
        ),
    );

    const sendMessage = (message: string) => {
        if (message.trim().length === 0) {
            return;
        }

        abortRef.current?.abort();
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
        void chatStream(message)
            .then(
                ([stream, abort]) =>
                    new Promise((resolve) => {
                        abortRef.current = abort;
                        const reader = stream.getReader();
                        function read() {
                            reader.read().then(({ done, value }) => {
                                if (done) {
                                    return resolve(true);
                                }
                                const { message, citations } = value;
                                setResponseMessage(message);
                                setCitations(citations);
                                read();
                            });
                        }
                        read();
                    }),
            )
            .finally(() => {
                setIsStreaming(false);
            });
    };

    const reset = () => {
        setChatHistory({
            conversationId: uniqueId(),
            messages: [],
        });
        setResponseMessage("");
        setCitations([]);
    };

    useResizeObserver(scrollContentRef, () => {
        scrollToBottom.current(true);
    });

    return (
        <section className={clsx("flex flex-col", className)}>
            <div className="px-4 py-2">
                {shouldShowConversation && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-grayscale-a11">Ask AI</span>
                        <button className="text-xs text-grayscale-a11 hover:text-grayscale-a12" onClick={reset}>
                            Clear Chat
                        </button>
                    </div>
                )}
            </div>
            {shouldShowConversation && (
                <FernScrollArea scrollbars="vertical" className="px-4 py-6 mask-grad-y-6" ref={scrollRef}>
                    <ChatConversation messages={chatHistory.messages} ref={scrollContentRef}>
                        <ResponseMessageWithCitations
                            isStreaming={isStreaming}
                            message={responseMessage}
                            citations={citations}
                        />
                    </ChatConversation>
                </FernScrollArea>
            )}
            <div className="p-4 pt-0">
                <AskInput onSend={sendMessage} />
                <div className="mt-1 px-5 text-grayscale-a10 text-center">
                    <span className="text-xs font-medium">Powered by Fern and Cohere (command-r-plus)</span>
                </div>
            </div>
        </section>
    );
}
