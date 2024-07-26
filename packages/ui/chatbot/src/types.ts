export interface ChatbotMessage {
    role: "AI";
    message: string;
    citations: Citation[];
}

export interface UserMessage {
    role: "USER";
    message: string;
}

export type Message = ChatbotMessage | UserMessage;

export interface CitationDocument {
    title: string;
    url: string;
}

export interface Citation {
    start: number;
    end: number;
    documents: CitationDocument[];
}
