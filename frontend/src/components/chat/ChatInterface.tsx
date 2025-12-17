'use client'

import { useState } from 'react'
import MessageBubble from './MessageBubble'
import InputArea from './InputArea'

export default function ChatInterface() {
    const [messages, setMessages] = useState([])

    return (
        <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
                {/* Message list */}
            </div>
            <InputArea />
        </div>
    )
}
