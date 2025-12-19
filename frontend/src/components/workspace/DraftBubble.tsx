"use client";

import { Check, X, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DraftProposal } from "@/types/workspace";
import { motion } from "framer-motion";

interface DraftBubbleProps {
    proposal: DraftProposal;
    onApprove: (proposal: DraftProposal) => void;
    onReject: (id: string) => void;
}

export default function DraftBubble({ proposal, onApprove, onReject }: DraftBubbleProps) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="pl-11 pr-4 mb-6 max-w-2xl"
        >
            <div className="group relative overflow-hidden rounded-xl border border-primary/20 bg-background/50 backdrop-blur-md shadow-xl transition-all hover:shadow-2xl hover:border-primary/30">
                
                {/* Decorative Gradient Line */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-purple-500 to-blue-500" />

                {/* Header */}
                <div className="p-5 border-b border-border/50 flex justify-between items-start bg-neutral-50/50 dark:bg-neutral-900/50">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" />
                            Architectural Insight
                        </div>
                        <h4 className="font-heading font-medium text-base text-foreground">
                            {proposal.title}
                        </h4>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    <div className="text-sm text-muted-foreground italic pl-3 border-l-2 border-border">
                        "{proposal.reasoning}"
                    </div>
                    
                    <div className="rounded-lg bg-neutral-100 dark:bg-neutral-800 p-4 text-xs font-mono text-foreground/80 leading-relaxed border border-border/50 shadow-inner">
                        {proposal.summary}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-3 bg-neutral-50/80 dark:bg-neutral-900/80 flex justify-end gap-3 border-t border-border/50">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onReject(proposal.id)}
                        className="text-xs hover:bg-red-100/50 hover:text-red-600 transition-colors"
                    >
                        <X className="w-3 h-3 mr-1.5" />
                        Dismiss
                    </Button>
                    <Button 
                        size="sm" 
                        onClick={() => onApprove(proposal)}
                        className="text-xs bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                    >
                        <Check className="w-3 h-3 mr-1.5" />
                        Add to Specification
                        <ArrowRight className="w-3 h-3 ml-1.5 opacity-70" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}