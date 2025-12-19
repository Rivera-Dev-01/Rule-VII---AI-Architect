"use client";

import { Check, X, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DraftProposal } from "@/types/workspace";

interface DraftBubbleProps {
    proposal: DraftProposal;
    onApprove: (proposal: DraftProposal) => void;
    onReject: (id: string) => void;
}

export default function DraftBubble({ proposal, onApprove, onReject }: DraftBubbleProps) {
    return (
        <div className="my-4 ml-4 max-w-2xl">
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-primary uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Draft Proposal
            </div>
            
            <Card className="border-primary/20 bg-primary/5 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-primary/10 bg-primary/10 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-medium text-sm text-foreground">
                        <FileText className="w-4 h-4 text-primary" />
                        {proposal.title}
                    </div>
                </div>

                {/* Content Preview */}
                <div className="p-4 space-y-3">
                    <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                        "{proposal.reasoning}"
                    </p>
                    
                    <div className="bg-background/50 rounded-md p-3 text-xs font-mono text-foreground/80 border border-border/50">
                        {proposal.summary}
                    </div>
                </div>

                {/* Actions */}
                <div className="p-2 bg-background/40 flex justify-end gap-2 border-t border-primary/10">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => onReject(proposal.id)}
                    >
                        <X className="w-3 h-3 mr-1.5" />
                        Reject
                    </Button>
                    <Button 
                        size="sm" 
                        className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                        onClick={() => onApprove(proposal)}
                    >
                        <Check className="w-3 h-3 mr-1.5" />
                        Add to Report
                        <ArrowRight className="w-3 h-3 ml-1.5 opacity-50" />
                    </Button>
                </div>
            </Card>
        </div>
    );
}