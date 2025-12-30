export interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    sources?: Source[]
    timestamp: Date
}

export interface Source {
    document: string
    page: number
    section: string
    similarity: number
}

export type ChatMode = "quick_answer" | "plan_draft" | "compliance";

export interface ChatRequest {
    message: string;
    conversation_id?: string;
    project_id?: string;
    mode?: ChatMode;
    reply_context?: string;
    attachments?: AttachmentMetaData[];
}

export interface AttachmentMetaData {
    name: string;
    type: string;
    size: number;
    url: string;
}

export interface ChatResponse {
    response: string
    sources: Source[]
    conversation_id: string
}
