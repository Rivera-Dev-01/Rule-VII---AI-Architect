"use client";

import { useState } from "react";
import { Send, PanelLeftClose, PanelRightClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

import DocumentPanel from "@/components/workspace/DocumentPanel";
import DraftBubble from "@/components/workspace/DraftBubble";
import { DocumentSection, DraftProposal, WorkspaceMessage } from "@/types/workspace";

// --- MOCK DATA ---
const MOCK_PROPOSAL: DraftProposal = {
    id: "prop-1",
    title: "Rule VII: Ventilation Analysis",
    summary: "Window-to-floor ratio in Master Bedroom is 8% (Req: 10%).",
    reasoning: "I detected a potential compliance issue in the provided plan.",
    proposedContent: "The Master Bedroom (Zone A) currently exhibits a window opening area of 1.2sqm against a floor area of 15sqm (8%).\n\nRecommendation: Increase window width by 0.4m to satisfy Rule VII Sec 3.2 requirements for natural ventilation."
};

export default function WorkspacePage() {
    // --- STATE ---
    const [input, setInput] = useState("");
    const [sections, setSections] = useState<DocumentSection[]>([]);
    const [messages, setMessages] = useState<WorkspaceMessage[]>([
        { id: "1", role: "assistant", content: "Hello, Architect. Upload a plan or describe the project scope to begin our analysis.", timestamp: new Date() }
    ]);

    // --- HANDLERS ---
    const handleSendMessage = () => {
        if (!input.trim()) return;

        // 1. Add User Message
        const userMsg: WorkspaceMessage = { 
            id: Date.now().toString(), 
            role: "user", 
            content: input, 
            timestamp: new Date() 
        };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        // 2. SIMULATE AI RESPONSE
        setTimeout(() => {
            if (input.toLowerCase().includes("analyze")) {
                const aiMsg: WorkspaceMessage = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "I've analyzed the ventilation requirements.",
                    timestamp: new Date(),
                    proposal: MOCK_PROPOSAL
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "Understood. I'm reviewing the specs...",
                    timestamp: new Date()
                }]);
            }
        }, 800);
    };

    const handleApproveDraft = (proposal: DraftProposal) => {
        const newSection: DocumentSection = {
            id: proposal.id,
            title: proposal.title,
            content: proposal.proposedContent,
            status: "approved",
            lastUpdated: new Date()
        };
        setSections(prev => [...prev, newSection]);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: "system",
            content: `Added "${proposal.title}" to the report.`,
            timestamp: new Date()
        }]);
    };

    const handleRejectDraft = (id: string) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: "assistant",
            content: "Noted. What changes would you like?",
            timestamp: new Date()
        }]);
    };

    return (
        <div className="h-[calc(100vh-4rem)] bg-background flex flex-col overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                
                {/* --- LEFT PANEL: CHAT --- */}
                <ResizablePanel defaultSize={60} minSize={30} maxSize={75} className="flex flex-col">
                    <div className="h-full flex flex-col relative">
                        {/* Chat Header */}
                        <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/95 backdrop-blur">
                            <span className="font-semibold text-sm">Design Assistant</span>
                            <div className="text-xs text-muted-foreground font-mono">
                                V1.0.0
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-6 max-w-3xl mx-auto pb-4">
                                {messages.map((msg) => (
                                    <div key={msg.id}>
                                        <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.role !== 'system' && (
                                                <div className={`
                                                    max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm
                                                    ${msg.role === 'user' 
                                                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                                                        : 'bg-muted/50 border border-border/50 rounded-bl-none'}
                                                `}>
                                                    {msg.content}
                                                </div>
                                            )}
                                            {msg.role === 'system' && (
                                                <div className="w-full text-center text-xs text-muted-foreground font-mono my-2 opacity-70">
                                                    — {msg.content} —
                                                </div>
                                            )}
                                        </div>

                                        {/* Proposal Card */}
                                        {msg.proposal && (
                                            <DraftBubble 
                                                proposal={msg.proposal}
                                                onApprove={handleApproveDraft}
                                                onReject={handleRejectDraft}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 bg-background border-t border-border">
                            <div className="max-w-3xl mx-auto relative">
                                <Textarea 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if(e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Type a message..."
                                    className="min-h-[60px] pr-12 resize-none shadow-sm text-sm bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary/30"
                                />
                                <Button 
                                    size="icon" 
                                    className="absolute right-2 bottom-2 h-8 w-8"
                                    onClick={handleSendMessage}
                                    disabled={!input.trim()}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </ResizablePanel>

                {/* --- DRAGGABLE HANDLE --- */}
                <ResizableHandle withHandle />

                {/* --- RIGHT PANEL: DOCUMENT --- */}
                <ResizablePanel defaultSize={40} minSize={25} maxSize={70} collapsible={true} collapsedSize={0}>
                    <DocumentPanel sections={sections} />
                </ResizablePanel>
            
            </ResizablePanelGroup>
        </div>
    );
}