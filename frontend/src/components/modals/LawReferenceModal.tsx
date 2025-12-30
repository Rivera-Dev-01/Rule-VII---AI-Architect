"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, BookOpen } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface LawReferenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    citation: string;
    content: string | null;
    isLoading: boolean;
    source?: string;
}

export function LawReferenceModal({
    isOpen,
    onClose,
    citation,
    content,
    isLoading,
    source
}: LawReferenceModalProps) {
    return (
        <Sheet open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col p-0 gap-0 overflow-hidden bg-background border-l shadow-2xl">
                <SheetHeader className="px-6 py-6 border-b bg-muted/40 shrink-0 text-left">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-lg shrink-0">
                            <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <SheetTitle className="text-xl font-semibold tracking-tight">
                                {citation}
                            </SheetTitle>
                            {source && (
                                <SheetDescription className="text-xs mt-1 truncate">
                                    Source: {source}
                                </SheetDescription>
                            )}
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-hidden relative min-h-[200px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground animate-pulse">Retrieving legal text...</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-full">
                            <div className="px-6 py-6 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                                {content ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {content}
                                    </ReactMarkdown>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <p>No content found for this citation.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <div className="p-4 border-t bg-muted/20 text-xs text-center text-muted-foreground shrink-0">
                    AI-retrieved content. Verify with official sources for critical compliance.
                </div>
            </SheetContent>
        </Sheet>
    );
}
