import { ReactElement } from "react";
import { Message } from "../types";
import { ChatbotMessage } from "./ChatbotMessage";
import { UserMessage } from "./UserMessage";

interface ChatConversationProps {
    messages: Message[];
}

export function ChatConversation({ messages }: ChatConversationProps): ReactElement {
    return (
        <div className="flex flex-col gap-9">
            {messages.map((message, index) => {
                if (message.role === "CHATBOT") {
                    return <ChatbotMessage key={index} message={message.message} />;
                } else if (message.role === "USER") {
                    return <UserMessage key={index} message={message.message} />;
                } else {
                    return null;
                }
            })}
        </div>
    );
}
