"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Scale, ArrowLeft, Loader2, Menu, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { ChatResponse, ChatHistoryItem } from "@/lib/api-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@/components/ui/resizable";

import DocumentPanel from "@/components/workspace/DocumentPanel";
import DraftBubble from "@/components/workspace/DraftBubble";
import MessageBubble from "@/components/chat/MessageBubble";
import InputArea from "@/components/chat/InputArea";

import { DocumentSection, DraftProposal, WorkspaceMessage } from "@/types/workspace";

export default function WorkspacePage() {
    const router = useRouter();
    const [sections, setSections] = useState<DocumentSection[]>([]);
    const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
    const [conversationId, setConversationId] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    // History State
    const [history, setHistory] = useState<ChatHistoryItem[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Load history on mount
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            // @ts-ignore
            const data = await apiClient.chat.getHistory();
            setHistory(data);
        } catch (e) {
            console.error("Failed to load history", e);
        }
    };

    const handleSelectConversation = async (id: string) => {
        setConversationId(id);
        setIsHistoryOpen(false);
        setIsLoading(true);
        try {
            // @ts-ignore
            const msgs = await apiClient.chat.getConversation(id);
            // Map API Message to WorkspaceMessage
            setMessages(msgs.map((m: any) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp: new Date(m.created_at),
                proposal: m.proposal
            })));
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        setConversationId(undefined);
        setMessages([]);
        setIsHistoryOpen(false);
    };

    const handleSendMessage = async (content: string, file: File | null) => {
        if (!content && !file) return;

        // 1. Optimistic UI: Add user message immediately
        const userMsg: WorkspaceMessage = {
            id: Date.now().toString(),
            role: "user",
            content: content || (file ? `Uploaded: ${file.name}` : ""),
            timestamp: new Date(),
            attachment: file ? {
                name: file.name,
                type: file.type,
                size: file.size,
                url: URL.createObjectURL(file) // Local preview
            } : undefined
        };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            let data: ChatResponse;

            // 2. Route the request: File Analysis vs. Text Chat
            if (file) {
                // CASE A: File Upload (Analysis)
                data = await apiClient.analyze.upload(file, content);
            } else {
                // CASE B: Standard Text Chat
                data = await apiClient.chat.send({
                    message: content,
                    conversation_id: conversationId,
                });
            }

            // 3. Update Conversation ID (if backend created a new session)
            if (data.conversation_id) {
                setConversationId(data.conversation_id);
            }

            // 4. Create AI Message from Response
            const aiMsg: WorkspaceMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.response,
                timestamp: new Date(),
                proposal: data.proposal ? {
                    id: `prop-${Date.now()}`,
                    title: data.proposal.title || "Draft Proposal",
                    summary: data.proposal.summary || "Generated from analysis",
                    reasoning: data.proposal.reasoning || "",
                    proposedContent: data.proposal.proposed_content || data.proposal.proposedContent || ""
                } : undefined
            };

            setMessages(prev => [...prev, aiMsg]);

        } catch (error: any) {
            console.error("Workspace Chat Error:", error);

            const errorMsg: WorkspaceMessage = {
                id: (Date.now() + 2).toString(),
                role: "system",
                content: "⚠️ " + (error.response?.data?.detail || "Connection failed. Please check your login status."),
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    // ... (Keep handleApproveDraft and handleRejectDraft) ...
    const handleApproveDraft = (proposal: DraftProposal) => {
        setSections(prev => [...prev, {
            id: proposal.id,
            title: proposal.title,
            content: proposal.proposedContent,
            status: "approved",
            lastUpdated: new Date()
        }]);
    };

    const handleRejectDraft = (id: string) => { console.log(id) };

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="flex-1">

                {/* --- LEFT PANEL --- */}
                <ResizablePanel defaultSize={60} minSize={30} maxSize={75} className="flex flex-col relative z-10 border-r border-border/40">
                    <div className="h-full flex flex-col bg-muted/20 dark:bg-zinc-900/50 relative">

                        {/* TOP LEFT ACTIONS: HISTORY & BACK */}
                        <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
                            {/* HISTORY MENU */}
                            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                        <Menu className="w-5 h-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                                    <SheetHeader className="mb-6">
                                        <SheetTitle className="flex items-center justify-between">
                                            <span>History</span>
                                            <Button variant="outline" size="sm" onClick={handleNewChat} className="h-8 gap-2">
                                                <Plus className="w-4 h-4" /> New
                                            </Button>
                                        </SheetTitle>
                                    </SheetHeader>
                                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-100px)]">
                                        {history.map(item => (
                                            <Button
                                                key={item.id}
                                                variant={conversationId === item.id ? "secondary" : "ghost"}
                                                className="justify-start text-left h-auto py-3 px-4 truncate"
                                                onClick={() => handleSelectConversation(item.id)}
                                            >
                                                <div className="flex flex-col gap-1 w-full overflow-hidden">
                                                    <span className="truncate font-medium">{item.title || "Untitled Conversation"}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(item.updated_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </Button>
                                        ))}
                                        {history.length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center py-10">No history yet</p>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>

                            {/* BACK BUTTON */}
                            <Button
                                variant="ghost" size="sm"
                                className="text-muted-foreground hover:text-foreground transition-colors gap-2"
                                onClick={() => router.push('/dashboard')}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Back</span>
                            </Button>
                        </div>

                        {/* CHAT SCROLL AREA */}
                        <ScrollArea className="flex-1 px-4 lg:px-8">
                            <div className="max-w-3xl mx-auto flex flex-col min-h-[calc(100vh-2rem)] py-6 pt-14">

                                {messages.length === 0 ? (
                                    // EMPTY STATE
                                    <div className="flex-1 flex flex-col items-center justify-center pb-20 opacity-90">
                                        <div className="mb-8 relative group cursor-default">
                                            <div className="absolute -inset-2 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-3xl blur-lg opacity-40 group-hover:opacity-60 transition duration-500"></div>
                                            <div className="relative w-20 h-20 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-xl border border-primary/10">
                                                <Scale className="w-10 h-10 stroke-[2.5]" />
                                            </div>
                                        </div>
                                        <h2 className="text-xl font-heading font-medium text-foreground">Rule VII Architect</h2>
                                        <p className="text-sm text-muted-foreground mt-2 text-center max-w-sm">
                                            I am ready to analyze your floor plans against the National Building Code.
                                        </p>
                                    </div>
                                ) : (
                                    // MESSAGES
                                    <div className="space-y-4 pb-32"> {/* Large bottom padding for floating input */}
                                        {messages.map((msg) => (
                                            <div key={msg.id}>
                                                <MessageBubble
                                                    role={msg.role}
                                                    content={msg.content}
                                                    proposal={msg.proposal}
                                                    attachment={msg.attachment}
                                                />
                                                {msg.proposal && (
                                                    <DraftBubble
                                                        proposal={msg.proposal}
                                                        onApprove={handleApproveDraft}
                                                        onReject={handleRejectDraft}
                                                    />
                                                )}
                                            </div>
                                        ))}

                                        {/* Loading Indicator */}
                                        {isLoading && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse ml-4">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Analyzing...</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* --- FLOATING INPUT AREA --- */}
                        <div className="absolute bottom-0 left-0 right-0 z-20">
                            {/* GRADIENT FADE: This hides messages scrolling behind the input */}
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />

                            {/* THE INPUT COMPONENT */}
                            <div className="relative z-30 pb-4">
                                <InputArea onSendMessage={handleSendMessage} disabled={isLoading} />
                            </div>
                        </div>

                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle className="bg-border/50 transition-colors hover:bg-primary/50 w-1" />

                {/* --- RIGHT PANEL --- */}
                <ResizablePanel defaultSize={40} minSize={25} maxSize={70} collapsible={true} collapsedSize={0}>
                    <DocumentPanel sections={sections} />
                </ResizablePanel>

            </ResizablePanelGroup>
        </div>
    );
}