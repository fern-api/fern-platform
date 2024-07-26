import { useAtom } from "jotai";
import { ReactElement } from "react";
import { atomWithSessionStorage } from "../atoms/atomWithSessionStorage";
import { Message } from "../types";
import { AskInput } from "./AskInput";
import { ChatConversation } from "./ChatConversation";

const CHAT_HISTORY = atomWithSessionStorage<Message[]>("chat-history", []);

export function ChatbotModal(): ReactElement {
    const [chatHistory, setChatHistory] = useAtom(CHAT_HISTORY);

    const sendMessage = (message: string) => {
        setChatHistory((prev) => [...prev, { role: "USER", message }]);
    };

    return (
        <section className="bg-white dark:bg-gray-950 rounded-lg w-full">
            <div className="px-4 py-2">
                <span className="text-sm text-gray-500">Ask AI</span>
            </div>
            <div className="min-h-10 overflow-y-auto overflow-x-hidden p-4">
                <ChatConversation messages={chatHistory} />
            </div>
            <div className="p-4">
                <AskInput onSend={sendMessage} />
            </div>
        </section>
    );
}
