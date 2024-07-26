export interface ChatbotMessage {
    role: "CHATBOT";
    message: string;
}

export interface UserMessage {
    role: "USER";
    message: string;
}

export type Message = ChatbotMessage | UserMessage;
