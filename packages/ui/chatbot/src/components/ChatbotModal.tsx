import { FernScrollArea } from "@fern-ui/components";
import { useResizeObserver } from "@fern-ui/react-commons";
import { useAtom } from "jotai";
import { debounce, uniqueId } from "lodash-es";
import { ReactElement, useRef, useState } from "react";
import { atomWithSessionStorage } from "../atoms/atomWithSessionStorage";
import { ChatbotMessage, Citation, Message } from "../types";
import { AskInput } from "./AskInput";
import { ChatConversation } from "./ChatConversation";
import { ResponseMessageWithCitations } from "./ResponseMessage";

interface ChatHistory {
    conversationId: string;
    messages: Message[];
}

const CHAT_HISTORY = atomWithSessionStorage<ChatHistory>("chat-history", {
    conversationId: uniqueId(),
    messages: [
        { role: "AI", message: "Hello! How can I help you?", citations: [] },
        { role: "USER", message: "What is the meaning of life?" },
        { role: "AI", message: "The meaning of life is 42.", citations: [] },
        { role: "USER", message: "Thank you." },
    ],
});

interface ChatbotModalProps {
    chatStream: (message: string) => Promise<readonly [stream: ReadableStream<ChatbotMessage>, abort: AbortController]>;
}

export function ChatbotModal({ chatStream }: ChatbotModalProps): ReactElement {
    const [chatHistory, setChatHistory] = useAtom(CHAT_HISTORY);
    const [isStreaming, setIsStreaming] = useState(false);
    const [message, setMessage] = useState<string>("");
    const [citations, setCitations] = useState<Citation[]>([]);

    const abortRef = useRef<AbortController>();
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollContentRef = useRef<HTMLDivElement>(null);

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
            if (message.length > 0) {
                messages.push({ role: "AI", message, citations });
            }
            messages.push({ role: "USER", message });
            return { ...prev, messages };
        });
        setIsStreaming(true);
        setMessage("");
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
                                setMessage(message);
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

    useResizeObserver(scrollContentRef, () => {
        scrollToBottom.current(true);
    });

    return (
        <section className="bg-gray-2 rounded-lg w-full text-black dark:text-white flex flex-col">
            <div className="px-4 py-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-a11">Ask AI</span>
                    <button
                        className="text-xs text-gray-a11 hover:text-gray-a12"
                        onClick={() => {
                            setChatHistory({
                                conversationId: uniqueId(),
                                messages: [],
                            });
                            setMessage("");
                            setCitations([]);
                        }}
                    >
                        Clear Chat
                    </button>
                </div>
            </div>
            <FernScrollArea scrollbars="vertical" className="px-4 py-6 mask-grad-y-6" ref={scrollRef}>
                <ChatConversation messages={chatHistory.messages} ref={scrollContentRef}>
                    <ResponseMessageWithCitations isStreaming={isStreaming} message={message} citations={citations} />
                </ChatConversation>
            </FernScrollArea>
            <div className="p-4 pt-0">
                <AskInput onSend={sendMessage} />
                <div className="mt-1 px-5 text-gray-10 text-center">
                    <span className="text-xs font-medium">Powered by Fern and Cohere (command-r-plus)</span>
                </div>
            </div>
        </section>
    );
}
