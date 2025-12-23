"use client";

import { useState, useRef, useEffect } from "react";
import { apiClient } from "@/lib/api-client"; // <--- The new client doing the heavy lifting
import { ChatResponse } from "@/lib/api-types";
import MessageBubble from "./MessageBubble";
import InputArea from "./InputArea";
import { WorkspaceMessage, DraftProposal } from "@/types/workspace";
import { Scale, Loader2 } from "lucide-react";

export default function ChatInterface() {
  const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (content: string, file: File | null) => {
    if (!content && !file) return;

    // 1. Optimistic UI: Add user message immediately
    const userMsg: WorkspaceMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content || (file ? `Uploaded: ${file.name}` : ""),
      timestamp: new Date(),
      attachment: file ? {
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file) // Local preview
      } : undefined
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let data: ChatResponse;

      // 2. Route the request: Chat vs. Analysis
      if (file) {
        // CASE A: File Upload (Analysis)
        // logic: The apiClient handles the FormData construction
        data = await apiClient.analyze.upload(file, content);
      } else {
        // CASE B: Standard Text Chat
        // logic: Pass the conversation_id to maintain context
        data = await apiClient.chat.send({
          message: content,
          conversation_id: conversationId,
        });
      }

      // 3. Update Conversation ID (if backend created a new session)
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      // 4. Create AI Message from Response
      const aiMsg: WorkspaceMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response, // The text response from AI
        timestamp: new Date(),
        proposal: data.proposal ? {
          id: `prop-${Date.now()}`,
          title: data.proposal.title || "Draft Proposal",
          summary: data.proposal.summary || "Generated from analysis",
          reasoning: data.proposal.reasoning || "",
          proposedContent: data.proposal.proposed_content || data.proposal.proposedContent
        } as DraftProposal : undefined
      };

      setMessages((prev) => [...prev, aiMsg]);

    } catch (error: any) {
      console.error("Chat Error:", error);

      const errorMsg: WorkspaceMessage = {
        id: (Date.now() + 2).toString(),
        role: "system", // Special styling for errors
        content: "⚠️ " + (error.response?.data?.detail || "Connection failed. Please check your login status."),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveProposal = (proposal: DraftProposal) => {
    // You can connect this to your Project state later
    console.log("Proposal Approved:", proposal);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background">

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Empty State */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[50vh] opacity-80 mt-10 animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Scale className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">AI Architect Ready</h2>
              <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
                Upload a site plan for analysis or ask about NBCP Rule VII requirements.
              </p>
            </div>
          )}

          {/* Message List */}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              proposal={msg.proposal}
              attachment={msg.attachment}
              onApprove={handleApproveProposal}
            />
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse ml-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area */}
      <InputArea onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
}