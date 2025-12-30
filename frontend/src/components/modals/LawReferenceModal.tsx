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
            <SheetContent side="right" className="w-full sm:w-[75vw] sm:max-w-[1000px] flex flex-col p-0 gap-0 overflow-hidden bg-background border-l shadow-2xl">
                <SheetHeader className="px-8 py-6 border-b bg-muted/30 shrink-0 text-left">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                            <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <SheetTitle className="text-2xl font-bold tracking-tight">
                                {citation}
                            </SheetTitle>
                            {source && (
                                <SheetDescription className="text-sm mt-1.5 flex items-center gap-2">
                                    <span className="font-medium text-primary">Source:</span> {source}
                                </SheetDescription>
                            )}
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-hidden relative min-h-[200px] bg-background">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-base font-medium text-muted-foreground animate-pulse">Retrieving legal text...</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-full">
                            <div className="px-8 py-8 text-base leading-loose prose prose-lg prose-slate dark:prose-invert max-w-none 
                                            prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
                                            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h3:text-primary
                                            prose-p:mb-4 prose-p:text-slate-700 dark:prose-p:text-slate-300
                                            prose-li:mb-2">
                                {content ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {content
                                            // Convert sentences ending with period+space+capital to paragraphs
                                            .replace(/\.(\s+)([A-Z])/g, '.\n\n$2')
                                            // Ensure markdown headers have proper spacing
                                            .replace(/###/g, '\n\n###')
                                        }
                                    </ReactMarkdown>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                        <p className="text-lg">No content found for this citation.</p>
                                        <p className="text-sm mt-2">The requested law reference may not be in the database.</p>
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
