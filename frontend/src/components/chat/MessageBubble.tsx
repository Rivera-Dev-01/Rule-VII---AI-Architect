"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { User, Scale, Bookmark, Check, FilePlus, Sparkles, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DraftProposal } from "@/types/workspace";

// ADD attachment to the interface
interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  proposal?: DraftProposal; 
  attachment?: { name: string; type: string; size: number; url: string }; // <--- Added
  onApprove?: (proposal: DraftProposal) => void; 
}

export default function MessageBubble({ role, content, proposal, attachment, onApprove }: MessageBubbleProps) {
  const isUser = role === "user";
  const isSystem = role === "system";
  const [isSaved, setIsSaved] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const handleApprove = () => {
    if (onApprove && !isApproved) {
      const payload: DraftProposal = proposal || {
        id: `auto-${Date.now()}`,
        title: "Chat Excerpt",
        summary: "Added directly from chat conversation.",
        reasoning: "User selected",
        proposedContent: content
      };
      onApprove(payload);
      setIsApproved(true);
    }
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/40">
          {content}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      "group flex w-full items-start gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2", 
      isUser ? "justify-end" : "justify-start"
    )}>
      
      {!isUser && (
        <div className="mt-0.5 shrink-0">
           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground border border-primary/10 shadow-sm">
              <Scale className="w-4 h-4" />
           </div>
        </div>
      )}

      <div className={cn("flex flex-col max-w-[85%]", isUser ? "items-end" : "items-start")}>
        
        {/* 1. ATTACHMENT CARD (Display if exists) */}
        {attachment && (
            <div className={cn(
                "mb-2 p-2 rounded-xl border flex items-center gap-3 w-fit min-w-[200px]",
                isUser ? "bg-primary/10 border-primary/20" : "bg-muted border-border"
            )}>
                <div className="p-2 bg-background rounded-lg shadow-sm shrink-0">
                    {attachment.type.startsWith('image') ? (
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                    ) : (
                        <FileText className="w-4 h-4 text-orange-500" />
                    )}
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-medium truncate max-w-[140px] text-foreground">
                        {attachment.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        {(attachment.size / 1024).toFixed(1)} KB
                    </span>
                </div>
            </div>
        )}

        {/* 2. TEXT BUBBLE */}
        {(content || !attachment) && (
            <div
            className={cn(
                "relative px-5 py-3.5 text-sm shadow-sm transition-all duration-200",
                isUser
                ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm" 
                : "bg-muted/50 border border-border/50 text-foreground rounded-2xl rounded-tl-sm hover:border-primary/20 hover:bg-muted/70" 
            )}
            >
            {!isUser && proposal && (
                <div className="mb-2 pb-2 border-b border-border/50 flex items-center gap-2 text-xs font-semibold text-primary">
                <Sparkles className="w-3 h-3" />
                <span>Suggestion: {proposal.title}</span>
                </div>
            )}
            <div className="whitespace-pre-wrap leading-relaxed">
                {content || "Sent an attachment."}
            </div>
            </div>
        )}

        {!isUser && (
            <div className="flex items-center gap-2 mt-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost" size="sm" onClick={handleApprove} disabled={isApproved}
                  className={cn("h-7 px-3 text-[10px] gap-1.5 rounded-full border transition-all shadow-sm",
                    isApproved ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-background border-border hover:border-primary/50"
                  )}
                >
                  {isApproved ? <Check className="w-3 h-3" /> : <FilePlus className="w-3 h-3" />}
                  {isApproved ? "Added to Project" : "Add to Project"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsSaved(!isSaved)} className="h-7 px-3 text-[10px] gap-1.5 rounded-full border border-transparent hover:border-border hover:bg-background">
                    <Bookmark className={cn("w-3 h-3", isSaved && "fill-current")} />
                    {isSaved ? "Saved" : "Save"}
                </Button>
            </div>
        )}
      </div>

      {isUser && (
         <div className="mt-0.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border border-border text-muted-foreground">
               <User className="w-4 h-4" />
            </div>
         </div>
      )}
    </div>
  );
}