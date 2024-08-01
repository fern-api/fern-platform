import { PropsWithChildren, forwardRef } from "react";
import { Message } from "../types";
import { ResponseMessage } from "./ResponseMessage";
import { UserMessage } from "./UserMessage";

interface ChatConversationProps {
    messages: Message[];
}

export const ChatConversation = forwardRef<HTMLDivElement, PropsWithChildren<ChatConversationProps>>(
    ({ messages, children }, ref) => {
        return (
            <div className="flex flex-col gap-9" ref={ref}>
                {messages.map((message, index) => {
                    if (message.role === "AI") {
                        return <ResponseMessage key={index} message={message.message} />;
                    } else if (message.role === "USER") {
                        return <UserMessage key={index} message={message.message} />;
                    } else {
                        return null;
                    }
                })}
                {children}
            </div>
        );
    },
);
