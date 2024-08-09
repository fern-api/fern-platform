import { PropsWithChildren, forwardRef } from "react";
import type { Components } from "react-markdown";
import { Message } from "../types";
import { ResponseMessage } from "./ResponseMessage";
import { UserMessage } from "./UserMessage";

interface ChatConversationProps {
    messages: Message[];
    components?: Components;
}

export const ChatConversation = forwardRef<HTMLDivElement, PropsWithChildren<ChatConversationProps>>(
    ({ messages, children, components }, ref) => {
        return (
            <div className="flex flex-col gap-9" ref={ref}>
                {messages.map((message, index) => {
                    if (message.role === "AI") {
                        return <ResponseMessage key={index} message={message.message} components={components} />;
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
