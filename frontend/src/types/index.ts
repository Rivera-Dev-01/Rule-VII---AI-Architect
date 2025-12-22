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

export interface ChatRequest {
    message: string
    conversation_id?: string
}

export interface ChatResponse {
    response: string
    sources: Source[]
    conversation_id: string
}
