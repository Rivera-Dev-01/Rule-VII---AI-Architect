"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { User, Scale, FileText, Image as ImageIcon, Pencil, Copy, Check, Plus } from "lucide-react";
import { WorkspaceMessage } from "@/types/workspace";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps extends WorkspaceMessage {
  onEdit?: (content: string) => void;
  onAddToDraft?: (content: string) => void;
}

export default function MessageBubble({ role, content, attachment, onEdit, onAddToDraft }: MessageBubbleProps) {
  const isUser = role === "user";
  const isSystem = role === "system";
  const [copied, setCopied] = useState(false);
  const [addedToDraft, setAddedToDraft] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToDraft = () => {
    if (addedToDraft || !onAddToDraft) return;
    setAddedToDraft(true);
    onAddToDraft(content);
  };

  // System messages
  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 text-sm">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "group flex w-full gap-3 mb-5",
      isUser ? "justify-end" : "justify-start"
    )}>

      {/* AI AVATAR */}
      {!isUser && (
        <div className="shrink-0 mt-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted border border-border">
            <Scale className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      )}

      <div className={cn("flex flex-col max-w-[65%]", isUser ? "items-end" : "items-start")}>

        {/* ATTACHMENT */}
        {attachment && (
          <div className={cn(
            "mb-2 p-3 rounded-lg flex items-center gap-3 w-fit bg-muted/50 border border-border"
          )}>
            <div className="p-2 bg-background rounded-md border border-border">
              {attachment.type.startsWith('image') ? (
                <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
                {attachment.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {(attachment.size / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>
        )}

        {/* MESSAGE */}
        {content && (
          <div
            className={cn(
              "px-4 py-3 text-sm leading-relaxed",
              isUser
                ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                : "bg-card border border-border text-foreground rounded-2xl rounded-tl-sm shadow-sm"
            )}
          >
            <div className="whitespace-pre-wrap">
              {content}
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className={cn(
          "flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-3 h-3 mr-1 text-emerald-600" /> : <Copy className="w-3 h-3 mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>

          {isUser && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(content)}
            >
              <Pencil className="w-3 h-3 mr-1" /> Edit
            </Button>
          )}

          {!isUser && onAddToDraft && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 px-2 text-xs",
                addedToDraft
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400"
              )}
              onClick={handleAddToDraft}
              disabled={addedToDraft}
            >
              {addedToDraft ? <Check className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
              {addedToDraft ? "Added" : "Add to Draft"}
            </Button>
          )}
        </div>
      </div>

      {/* USER AVATAR */}
      {isUser && (
        <div className="shrink-0 mt-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border border-border">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}