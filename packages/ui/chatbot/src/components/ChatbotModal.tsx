import { useAtom } from "jotai";
import { uniqueId } from "lodash-es";
import { ReactElement, useRef, useState } from "react";
import { atomWithSessionStorage } from "../atoms/atomWithSessionStorage";
import { ChatbotMessage, Message } from "../types";
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
    const [currentResponse, setCurrentResponse] = useState<ChatbotMessage>({ role: "AI", message: "", citations: [] });

    const abortRef = useRef<AbortController>();

    const sendMessage = (message: string) => {
        abortRef.current?.abort();
        setChatHistory((prev) => {
            const messages = [...prev.messages];
            if (currentResponse.message.length > 0) {
                messages.push(currentResponse);
            }
            messages.push({ role: "USER", message });
            return { ...prev, messages };
        });
        void chatStream(message).then(([stream, abort]) => {
            abortRef.current = abort;
            const reader = stream.getReader();
            function read() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        return;
                    }
                    setCurrentResponse(value);
                    read();
                });
            }
            read();
        });
    };

    return (
        <section className="bg-white dark:bg-gray-950 rounded-lg w-full">
            <div className="px-4 py-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Ask AI</span>
                    <button
                        className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-400"
                        onClick={() => {
                            setChatHistory({
                                conversationId: uniqueId(),
                                messages: [],
                            });
                            setCurrentResponse({ role: "AI", message: "", citations: [] });
                        }}
                    >
                        Clear Chat
                    </button>
                </div>
            </div>
            <div className="min-h-10 overflow-y-auto overflow-x-hidden p-4">
                <ChatConversation messages={chatHistory.messages}>
                    <ResponseMessageWithCitations
                        message={currentResponse.message}
                        citations={currentResponse.citations}
                    />
                </ChatConversation>
            </div>
            <div className="p-4">
                <AskInput onSend={sendMessage} />
            </div>
        </section>
    );
}
