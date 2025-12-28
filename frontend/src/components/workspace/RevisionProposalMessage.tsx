"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { RevisionProposalMessageProps } from "@/types/revision";
import { cn } from "@/lib/utils";

export default function RevisionProposalMessage({
    proposal,
    onApprove,
    onReviseAgain,
    onReject
}: RevisionProposalMessageProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isApproved, setIsApproved] = useState(proposal.status === 'approved');
    const [isRejected, setIsRejected] = useState(proposal.status === 'rejected');

    const handleApprove = () => {
        setIsApproved(true);
        onApprove(proposal.sectionId, proposal.revisedContent);
    };

    const handleReject = () => {
        setIsRejected(true);
        onReject(proposal.id);
    };

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                            <RefreshCw className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-foreground">Revision Proposal</h4>
                            <p className="text-xs text-muted-foreground">Section: {proposal.sectionTitle}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="h-7 w-7 p-0"
                    >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="p-4 space-y-4">
                    {/* User Instructions */}
                    {proposal.userInstructions && (
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Instructions:</p>
                            <p className="text-sm text-foreground italic bg-muted/30 px-3 py-2 rounded-lg">
                                "{proposal.userInstructions}"
                            </p>
                        </div>
                    )}

                    {/* Revised Content */}
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Revised Content:</p>
                        <div className="bg-muted/20 px-4 py-3 rounded-lg border border-border max-h-60 overflow-y-auto">
                            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                {proposal.revisedContent}
                            </p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    {(isApproved || isRejected) && (
                        <div className="flex items-center gap-2">
                            {isApproved && (
                                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Approved
                                </span>
                            )}
                            {isRejected && (
                                <span className="px-3 py-1 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full flex items-center gap-1">
                                    <X className="w-3 h-3" /> Rejected
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Sticky Action Buttons */}
            {!isApproved && !isRejected && (
                <div className={cn(
                    "sticky bottom-0 px-4 py-3 bg-background/95 backdrop-blur-sm border-t border-border flex items-center justify-end gap-2",
                    "shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
                )}>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReject}
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900"
                    >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReviseAgain(proposal.sectionId)}
                        className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                    >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Revise Again
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleApprove}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                    </Button>
                </div>
            )}
        </div>
    );
}
