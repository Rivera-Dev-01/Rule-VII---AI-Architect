interface MessageBubbleProps {
    role: 'user' | 'assistant'
    content: string
    sources?: any[]
}

export default function MessageBubble({ role, content, sources }: MessageBubbleProps) {
    return (
        <div className={`message-bubble ${role}`}>
            {/* Your message styling here */}
        </div>
    )
}
