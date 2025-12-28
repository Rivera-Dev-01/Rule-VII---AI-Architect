"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2, RefreshCw } from "lucide-react";
import { RevisionModalProps } from "@/types/revision";

export default function RevisionModal({
    section,
    isOpen,
    onClose,
    onSubmit,
    isLoading = false
}: RevisionModalProps) {
    const [instructions, setInstructions] = useState("");

    if (!isOpen || !section) return null;

    const handleSubmit = async () => {
        await onSubmit(instructions);
        setInstructions(""); // Clear after submit
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-background border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-gradient-to-r from-muted/50 to-muted/30">
                    <div className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-lg">Revise Section with AI</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        disabled={isLoading}
                        className="h-8 w-8 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                    {/* Section Info */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Section Title</label>
                        <div className="px-4 py-2 bg-muted/50 rounded-lg border border-border">
                            <p className="text-sm font-medium">{section.title}</p>
                        </div>
                    </div>

                    {/* Current Content (Read-only) */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Current Content</label>
                        <div className="px-4 py-3 bg-muted/30 rounded-lg border border-border max-h-40 overflow-y-auto">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{section.content}</p>
                        </div>
                    </div>

                    {/* User Instructions */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">
                            What would you like to improve or clarify?
                        </label>
                        <Textarea
                            placeholder="E.g., 'Make it more concise', 'Add more technical details', 'Fix grammatical errors', etc."
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            disabled={isLoading}
                            className="min-h-[120px] resize-none"
                            autoFocus
                        />
                        <p className="text-xs text-muted-foreground">
                            Provide specific instructions for the AI to improve this section.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-end gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !instructions.trim()}
                        className="min-w-[140px]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Revising...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Submit Revision
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
