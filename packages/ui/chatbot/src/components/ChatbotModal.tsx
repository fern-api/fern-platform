import { useAtom } from "jotai";
import { RESET } from "jotai/utils";
import { ReactElement } from "react";
import { atomWithSessionStorage } from "../atoms/atomWithSessionStorage";
import { Message } from "../types";
import { AskInput } from "./AskInput";
import { ChatConversation } from "./ChatConversation";
import { ResponseMessageWithCitations } from "./ResponseMessage";

const CHAT_HISTORY = atomWithSessionStorage<Message[]>("chat-history", [
    { role: "AI", message: "Hello! How can I help you?" },
    { role: "USER", message: "What is the meaning of life?" },
    { role: "AI", message: "The meaning of life is 42." },
    { role: "USER", message: "Thank you." },
]);

export function ChatbotModal(): ReactElement {
    const [chatHistory, setChatHistory] = useAtom(CHAT_HISTORY);

    const sendMessage = (message: string) => {
        setChatHistory((prev) => [...prev, { role: "USER", message }]);
    };

    return (
        <section className="bg-white dark:bg-gray-950 rounded-lg w-full">
            <div className="px-4 py-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Ask AI</span>
                    <button
                        className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-400"
                        onClick={() => setChatHistory(RESET)}
                    >
                        Clear Chat
                    </button>
                </div>
            </div>
            <div className="min-h-10 overflow-y-auto overflow-x-hidden p-4">
                <ChatConversation messages={chatHistory}>
                    <ResponseMessageWithCitations message="" citations={[]} />
                </ChatConversation>
            </div>
            <div className="p-4">
                <AskInput onSend={sendMessage} />
            </div>
        </section>
    );
}
