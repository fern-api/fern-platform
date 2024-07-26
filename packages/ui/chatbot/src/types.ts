export interface ChatbotMessage {
    role: "AI";
    message: string;
}

export interface UserMessage {
    role: "USER";
    message: string;
}

export type Message = ChatbotMessage | UserMessage;
