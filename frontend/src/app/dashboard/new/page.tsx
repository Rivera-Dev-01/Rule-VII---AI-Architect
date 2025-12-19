"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Sparkles, Scale, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";

import DocumentPanel from "@/components/workspace/DocumentPanel";
import DraftBubble from "@/components/workspace/DraftBubble";
import MessageBubble from "@/components/chat/MessageBubble"; 
import { DocumentSection, DraftProposal, WorkspaceMessage } from "@/types/workspace";

// --- MOCK DATA ---
const MOCK_PROPOSAL: DraftProposal = {
    id: "prop-1",
    title: "Ventilation Compliance: Master Bedroom",
    summary: "Current WFR is 8%. Code requires 10%.",
    reasoning: "I detected a violation of Rule VII Section 3.2 based on the uploaded floor plan.",
    proposedContent: "### Ventilation Analysis\n\n**Finding:** The Master Bedroom (Zone A) currently exhibits a window opening area of 1.2sqm against a floor area of 15sqm (8%).\n\n**Requirement:** National Building Code Rule VII requires a minimum of 10% for residential zones.\n\n**Recommendation:** Increase window width by 0.4m or add a secondary clerestory window."
};

export default function WorkspacePage() {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [sections, setSections] = useState<DocumentSection[]>([]);
    const [messages, setMessages] = useState<WorkspaceMessage[]>([]);

    const handleSendMessage = () => {
        if (!input.trim()) return;

        const userMsg: WorkspaceMessage = { 
            id: Date.now().toString(), 
            role: "user", 
            content: input, 
            timestamp: new Date() 
        };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        setTimeout(() => {
            if (input.toLowerCase().includes("analyze")) {
                const aiMsg: WorkspaceMessage = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "I've analyzed the ventilation requirements for the residential zones. I found a discrepancy in the Master Bedroom.",
                    timestamp: new Date(),
                    proposal: MOCK_PROPOSAL
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "Understood. I'm cross-referencing that with the National Building Code...",
                    timestamp: new Date()
                }]);
            }
        }, 800);
    };

    const handleApproveDraft = (proposal: DraftProposal) => {
        setSections(prev => [...prev, {
            id: proposal.id,
            title: proposal.title,
            content: proposal.proposedContent,
            status: "approved",
            lastUpdated: new Date()
        }]);
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
            content: "Noted. I've discarded that draft. What specific changes would you like?",
            timestamp: new Date()
        }]);
    };

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                
                {/* --- LEFT PANEL --- */}
                <ResizablePanel defaultSize={60} minSize={30} maxSize={75} className="flex flex-col relative z-10">
                    <div className="h-full flex flex-col bg-muted/20 dark:bg-zinc-900/50 relative">
                        
                        {/* BACK BUTTON */}
                        <div className="absolute top-4 left-4 z-30">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-muted-foreground hover:text-foreground transition-colors gap-2"
                                onClick={() => router.push('/dashboard')}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Back</span>
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 px-4 lg:px-8">
                            {/* 
                               FIX: Changed height to 'h-[calc(100vh-2rem)]' 
                               This forces the container to fill the screen vertically,
                               so 'justify-center' works correctly.
                            */}
                            <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-2rem)] py-6 pt-14">
                                
                                {messages.length === 0 ? (
                                    /* 
                                       CENTERING LOGIC:
                                       flex-1 expands to fill space.
                                       justify-center puts content in middle.
                                       pb-20 offsets the floating input bar so it looks visually centered.
                                    */
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
                                    /* MESSAGES (Just standard layout) */
                                    <div className="space-y-4 pb-4">
                                        {messages.map((msg) => (
                                            <div key={msg.id}>
                                                <MessageBubble role={msg.role} content={msg.content} />
                                                {msg.proposal && (
                                                    <DraftBubble 
                                                        proposal={msg.proposal}
                                                        onApprove={handleApproveDraft}
                                                        onReject={handleRejectDraft}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        <div className="h-32" /> 
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* FLOATING INPUT */}
                        <div className="absolute bottom-6 left-0 right-0 px-6 z-20 pointer-events-none">
                            <div className="max-w-3xl mx-auto relative group pointer-events-auto">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                <div className="relative flex items-end gap-2 bg-background/80 backdrop-blur-xl border border-border/50 rounded-3xl p-2 shadow-2xl">
                                    <Textarea 
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if(e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder="Describe your plan or ask for a code review..."
                                        className="min-h-[50px] max-h-[200px] w-full resize-none bg-transparent border-0 focus-visible:ring-0 text-sm py-3 px-4 shadow-none"
                                    />
                                    <Button 
                                        size="icon" 
                                        className="mb-1 mr-1 h-9 w-9 rounded-full bg-primary hover:bg-primary/90 shrink-0 transition-all"
                                        onClick={handleSendMessage}
                                        disabled={!input.trim()}
                                    >
                                        {input.trim() ? <Send className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                    </Button>
                                </div>
                                <div className="text-center mt-2 text-[10px] text-muted-foreground/50">
                                    AI Architect can make mistakes. Please verify important code requirements.
                                </div>
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