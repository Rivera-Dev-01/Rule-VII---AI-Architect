"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { User, Scale, FileText, Image as ImageIcon, Pencil, Copy, Check, Plus, X, RefreshCw, Reply, ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import { WorkspaceMessage, RAGSource } from "@/types/workspace";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps extends WorkspaceMessage {
  onEdit?: (content: string) => void;
  onAddToDraft?: (content: string) => void;
  onReply?: (content: string) => void;
  onApproveRevision?: (sectionId: string, content: string) => void;
  onReviseAgain?: (sectionId: string) => void;
  onRejectRevision?: (messageId: string) => void;
}

import { formatCitations } from "./citation-utils";

export default function MessageBubble({
  id,
  role,
  content,
  attachment,
  sources,
  revisionData,
  onEdit,
  onAddToDraft,
  onReply,
  onApproveRevision,
  onReviseAgain,
  onRejectRevision
}: MessageBubbleProps) {
  const isUser = role === "user";
  const isSystem = role === "system";
  const [copied, setCopied] = useState(false);
  const [addedToDraft, setAddedToDraft] = useState(false);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);

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

      <div className={cn("flex flex-col max-w-[75%]", isUser ? "items-end" : "items-start")}>

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
              "px-4 py-3 leading-relaxed",
              isUser
                ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm text-sm"
                : "bg-card border border-border text-foreground rounded-2xl rounded-tl-sm shadow-sm"
            )}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap">{content}</div>
            ) : (
              <div className="markdown-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  urlTransform={(url) => url}
                  components={{
                    // Headers
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0 text-foreground">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-semibold mb-2 mt-3 first:mt-0 text-foreground">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-semibold mb-2 mt-3 first:mt-0 text-foreground">{children}</h3>
                    ),
                    // Paragraphs
                    p: ({ children }) => (
                      <p className="text-sm leading-relaxed mb-3 last:mb-0 text-foreground">{children}</p>
                    ),
                    // Lists
                    ul: ({ children }) => (
                      <ul className="list-disc list-outside ml-4 mb-3 space-y-1">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-outside ml-4 mb-3 space-y-1">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm text-foreground">{children}</li>
                    ),
                    // Bold & Italic
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic">{children}</em>
                    ),
                    // Code
                    code: ({ className, children }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono text-primary">{children}</code>
                      ) : (
                        <code className="block bg-muted/50 rounded-lg p-3 text-xs font-mono overflow-x-auto">{children}</code>
                      );
                    },
                    pre: ({ children }) => (
                      <pre className="bg-muted/50 rounded-lg p-3 mb-3 overflow-x-auto">{children}</pre>
                    ),
                    // Tables - Responsive and fits container
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-3 rounded-lg border border-border">
                        <table className="w-full text-sm">{children}</table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-muted/50 border-b border-border">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody className="divide-y divide-border">{children}</tbody>
                    ),
                    tr: ({ children }) => (
                      <tr className="hover:bg-muted/20 transition-colors">{children}</tr>
                    ),
                    th: ({ children }) => (
                      <th className="px-3 py-2 text-left text-xs font-semibold text-foreground">{children}</th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3 py-2 text-sm text-foreground">{children}</td>
                    ),
                    // Blockquote
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary/50 pl-4 py-1 my-3 italic text-muted-foreground">{children}</blockquote>
                    ),
                    // Links
                    a: ({ href, children }) => {
                      // Law citations - only show icon for actual law codes (RA, PD, BP)
                      if (href?.startsWith("law:")) {
                        const citation = decodeURIComponent(href.replace("law:", ""));
                        const isLawCode = /^(RA|PD|BP)\s/i.test(citation);

                        return (
                          <span className="inline-flex items-center gap-0.5 text-primary font-semibold">
                            {isLawCode && <Scale className="w-3 h-3" />}
                            {children}
                          </span>
                        );
                      }
                      return (
                        <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
                      );
                    },
                    // Horizontal rule
                    hr: () => <hr className="border-border my-4" />,
                  }}
                >
                  {formatCitations(content)}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* SOURCES USED - Collapsible */}
        {!isUser && sources && sources.length > 0 && (() => {
          // Filter out low relevance (<40%) and sort by similarity (highest first)
          const filteredSources = sources
            .filter(s => s.similarity >= 0.4)
            .sort((a, b) => b.similarity - a.similarity);

          if (filteredSources.length === 0) return null;

          // Helper to clean law code (remove chunk index like "(1)")
          const cleanLawCode = (code: string) => {
            return code
              .replace(/\s*\(\d+\)\s*$/, '')  // Remove "(1)" suffix
              .replace(/_/g, ' ')              // Replace underscores with spaces
              .trim();
          };

          // Helper to truncate section text
          const truncateSection = (text: string, maxLen = 50) => {
            if (!text) return '';
            // Clean up common prefixes
            let clean = text
              .replace(/^\[?Reference:\s*/i, '')
              .replace(/^\[?Section\s*/i, 'Section ')
              .replace(/\]$/, '');
            return clean.length > maxLen ? clean.substring(0, maxLen) + '...' : clean;
          };

          return (
            <div className="mt-2">
              <button
                onClick={() => setSourcesExpanded(!sourcesExpanded)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {sourcesExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                <BookOpen className="w-3 h-3" />
                <span>Sources Used ({filteredSources.length})</span>
              </button>

              {sourcesExpanded && (
                <div className="mt-2 space-y-1.5 pl-5">
                  {filteredSources.map((source, idx) => {
                    const lawCode = cleanLawCode(source.law_code || source.document.split('.')[0]);
                    const section = truncateSection(source.section);

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs bg-muted/50 rounded px-2 py-1.5 border border-border/50"
                      >
                        {/* Law code with icon */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Scale className="w-3 h-3 text-primary" />
                          <span className="font-medium text-foreground">{lawCode}</span>
                        </div>

                        {/* Section (no icon, just text) */}
                        {section && (
                          <span className="text-muted-foreground truncate flex-1" title={source.section}>
                            — {section}
                          </span>
                        )}

                        {/* Similarity score */}
                        <span className="text-muted-foreground shrink-0 tabular-nums">
                          {Math.round(source.similarity * 100)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

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

          {!isUser && onAddToDraft && !revisionData && (
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

          {/* Reply to AI Response */}
          {!isUser && onReply && !revisionData && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
              onClick={() => onReply(content)}
            >
              <Reply className="w-3 h-3 mr-1" /> Reply
            </Button>
          )}

          {/* Revision Actions */}
          {revisionData && revisionData.status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRejectRevision?.(id)}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3 mr-1" /> Reject
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReviseAgain?.(revisionData.sectionId)}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Revise
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onApproveRevision?.(revisionData.sectionId, content)}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
              >
                <Check className="w-3 h-3 mr-1" /> Approve
              </Button>
            </>
          )}

          {revisionData && revisionData.status !== 'pending' && (
            <span className={cn(
              "text-xs ml-1",
              revisionData.status === 'approved' ? 'text-primary' : 'text-muted-foreground'
            )}>
              {revisionData.status === 'approved' ? '✓ Added to section' : '✗ Rejected'}
            </span>
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