"use client";

import { useState } from "react";
import { Check, X, Sparkles, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DraftProposal } from "@/types/workspace";
import { cn } from "@/lib/utils";

interface DraftBubbleProps {
    proposal: DraftProposal;
    onApprove: (proposal: DraftProposal) => void;
    onReject: (id: string) => void;
}

export default function DraftBubble({ proposal, onApprove, onReject }: DraftBubbleProps) {
    const [isActioned, setIsActioned] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    const handleApprove = () => {
        if (isActioned) return;
        setIsActioned(true);
        onApprove(proposal);
        setTimeout(() => setIsHidden(true), 500);
    };

    const handleReject = () => {
        if (isActioned) return;
        setIsActioned(true);
        onReject(proposal.id);
        setTimeout(() => setIsHidden(true), 200);
    };

    if (isHidden) return null;

    return (
        <div className={cn(
            "flex w-full justify-start mb-5 pl-11 transition-opacity",
            isActioned && "opacity-50"
        )}>
            <div className="w-full max-w-[65%]">
                {/* Card */}
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">

                    {/* Header */}
                    <div className="px-4 py-3 bg-muted/50 border-b border-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span className="text-sm font-medium text-foreground">
                                    {proposal.title}
                                </span>
                            </div>
                            <span className="text-[10px] font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded uppercase">
                                Draft
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {proposal.summary}
                        </p>

                        {proposal.reasoning && (
                            <div className="flex items-start gap-2 text-xs bg-muted/50 p-3 rounded-lg border border-border">
                                <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                <span className="text-muted-foreground italic">
                                    {proposal.reasoning}
                                </span>
                            </div>
                        )}

                        <div className="p-3 bg-muted/30 rounded-lg border border-border font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed max-h-[180px] overflow-y-auto">
                            {proposal.proposedContent}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-muted/50 border-t border-border flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReject}
                            disabled={isActioned}
                            className="h-8 text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                        >
                            <X className="w-4 h-4 mr-1" /> Reject
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleApprove}
                            disabled={isActioned}
                            className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            {isActioned ? (
                                <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Adding...</>
                            ) : (
                                <><Check className="w-4 h-4 mr-1" /> Approve & Add</>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}