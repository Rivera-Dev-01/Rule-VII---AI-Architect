"use client";

import { useState, useRef, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { ChatResponse } from "@/lib/api-types";
import MessageBubble from "./MessageBubble";
import InputArea from "./InputArea";
import { WorkspaceMessage, DraftProposal } from "@/types/workspace";
import { Scale, Loader2, FileCheck } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function ChatInterface() {
  const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [savedProposals, setSavedProposals] = useState<any[]>([]); // State for approved projects
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 2. Fetch Saved Proposals when Conversation ID changes
  useEffect(() => {
    const fetchSavedProposals = async () => {
      if (!conversationId) return;

      try {
        // Using standard fetch since apiClient might not have this method yet
        // Adjust the token retrieval based on where you store it (localStorage/cookies)
        const token = localStorage.getItem("access_token") || "";

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/chat/proposals/${conversationId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (res.ok) {
          const data = await res.json();
          setSavedProposals(data);
        }
      } catch (error) {
        console.error("Failed to fetch saved proposals:", error);
      }
    };

    fetchSavedProposals();
  }, [conversationId]);

  // 3. Handle Sending Messages
  const handleSendMessage = async (content: string, file: File | null) => {
    if (!content && !file) return;

    // Optimistic UI
    const userMsg: WorkspaceMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content || (file ? `Uploaded: ${file.name}` : ""),
      timestamp: new Date(),
      attachment: file ? {
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      } : undefined
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let data: ChatResponse;

      if (file) {
        data = await apiClient.analyze.upload(file, content);
      } else {
        data = await apiClient.chat.send({
          message: content,
          conversation_id: conversationId,
        });
      }

      // Update Conversation ID
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      // Create AI Message
      const aiMsg: WorkspaceMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
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
        role: "system",
        content: "⚠️ " + (error.response?.data?.detail || "Connection failed. Please check your login status."),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle Approving/Saving a Proposal
  const handleApproveProposal = async (proposal: DraftProposal) => {
    if (!conversationId) {
      console.error("No conversation ID present");
      return;
    }

    try {
      const token = localStorage.getItem("access_token") || "";

      // Match the "ProposalSaveRequest" schema from your backend
      const payload = {
        conversation_id: conversationId,
        title: proposal.title,
        summary: proposal.summary,
        content: proposal.proposedContent || proposal.reasoning // Fallback
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/chat/proposal`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save proposal");

      const savedData = await res.json();

      // Update local state to show it immediately
      setSavedProposals(prev => [savedData, ...prev]);
      console.log("Proposal Saved:", savedData);

    } catch (error) {
      console.error("Error saving proposal:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background">

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* NEW: Saved Proposals Section (Display if any exist) */}
          {savedProposals.length > 0 && (
            <div className="w-full mb-6 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 mb-2 px-1">
                <FileCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Approved Drafts</span>
              </div>
              <ScrollArea className="w-full whitespace-nowrap rounded-xl border bg-muted/30 p-2">
                <div className="flex w-max space-x-3 p-1">
                  {savedProposals.map((p: any) => (
                    <div key={p.id} className="flex flex-col gap-1 w-[200px] p-3 rounded-lg bg-background border shadow-sm hover:border-primary/50 transition-colors cursor-default">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-semibold text-xs truncate">{p.title}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate pl-3.5">
                        {p.summary || "No summary"}
                      </span>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}

          {/* Empty State */}
          {messages.length === 0 && savedProposals.length === 0 && (
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