"use client";

import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import InputArea from "./InputArea";
import { WorkspaceMessage, DraftProposal } from "@/types/workspace";
import { Scale } from "lucide-react";

export default function ChatInterface() {
  const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Updated handler to accept content AND file
  const handleSendMessage = (content: string, file: File | null) => {
    // 1. Create User Message
    const userMsg: WorkspaceMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content || (file ? `Uploaded: ${file.name}` : ""), // Fallback text if only file sent
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // 2. Simulate AI Response (Mock)
    setTimeout(() => {
      const isAnalysisRequest = content.toLowerCase().includes("analyze") || file;
      
      const aiMsg: WorkspaceMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: isAnalysisRequest 
          ? `I received your file "${file?.name || 'plan'}". I'm analyzing the setbacks and ventilation requirements...`
          : "I can help you with NBCP Rule VII. Do you have a floor plan to upload?",
        timestamp: new Date(),
        // Mocking a proposal if it's an analysis request
        proposal: isAnalysisRequest ? {
            id: `prop-${Date.now()}`,
            title: "Setback Compliance Check",
            summary: "Analyzed the uploaded site development plan.",
            reasoning: "Rule VII, Section 804 requires specific setbacks based on road width.",
            proposedContent: "**Observation:** The front setback is 2.0m.\n**Requirement:** R-1 zones require 4.5m.\n**Action:** Adjust building footprint."
        } : undefined
      };
      
      setMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  const handleApproveProposal = (proposal: DraftProposal) => {
     console.log("Adding to project:", proposal);
     // Note: In your full app, you might pass this handler up to page.tsx
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[50vh] opacity-80 mt-10">
               <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Scale className="w-8 h-8 text-primary" />
               </div>
               <h2 className="text-xl font-semibold text-foreground">AI Architect Ready</h2>
               <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
                 Upload a PDF/Image of your plan or ask about the Building Code.
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
                onApprove={handleApproveProposal}
            />
          ))}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area (Fixed at bottom) */}
      <InputArea onSendMessage={handleSendMessage} />
    </div>
  );
}