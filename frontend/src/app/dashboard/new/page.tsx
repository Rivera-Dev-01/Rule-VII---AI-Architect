"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scale, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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

// ... (Keep your MOCK_PROPOSAL code here) ...
const MOCK_PROPOSAL: DraftProposal = {
    id: "prop-1",
    title: "Ventilation Compliance: Master Bedroom",
    summary: "Current WFR is 8%. Code requires 10%.",
    reasoning: "I detected a violation of Rule VII Section 3.2 based on the uploaded floor plan.",
    proposedContent: "### Ventilation Analysis\n\n**Finding:** The Master Bedroom (Zone A) currently exhibits a window opening area of 1.2sqm against a floor area of 15sqm (8%).\n\n**Requirement:** National Building Code Rule VII requires a minimum of 10% for residential zones.\n\n**Recommendation:** Increase window width by 0.4m or add a secondary clerestory window."
};

export default function WorkspacePage() {
    const router = useRouter();
    const [sections, setSections] = useState<DocumentSection[]>([]);
    const [messages, setMessages] = useState<WorkspaceMessage[]>([]);

    const handleSendMessage = (content: string, file: File | null) => {
        // ... (Keep your handleSendMessage logic exactly as it is) ...
        const userMsg: WorkspaceMessage = { 
            id: Date.now().toString(), 
            role: "user", 
            content: content, 
            timestamp: new Date(),
            attachment: file ? {
                name: file.name,
                type: file.type,
                size: file.size,
                url: URL.createObjectURL(file)
            } : undefined
        };
        setMessages(prev => [...prev, userMsg]);

        setTimeout(() => {
            const isAnalysis = content.toLowerCase().includes("analyze") || file;
            if (isAnalysis) {
                const aiMsg: WorkspaceMessage = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: file 
                        ? `I've received "${file.name}". Analyzing the floor plan against Rule VII setbacks...`
                        : "I've analyzed the ventilation requirements for the residential zones.",
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
        }, 1000);
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
                        
                        {/* BACK BUTTON */}
                        <div className="absolute top-4 left-4 z-30">
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
                                <InputArea onSendMessage={handleSendMessage} />
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