"use client";

import { useState, useRef, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { ChatResponse, SavedProposal } from "@/lib/api-types";
import MessageBubble from "./MessageBubble";
import InputArea from "./InputArea";
// Import your types
import { WorkspaceMessage, DraftProposal } from "@/types/workspace";
import {
    Scale,
    Loader2,
    FileCheck,
    MoreHorizontal,
    Trash2,
    Pencil,
    RefreshCw,
    X
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// --- UI COMPONENTS (Ensure you have Button/Input/Textarea, or swap to HTML tags if needed) ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ChatInterface() {
    // Use WorkspaceMessage for the chat history
    const [messages, setMessages] = useState<WorkspaceMessage[]>([]);

    const [conversationId, setConversationId] = useState<string | undefined>(undefined);
    const [savedProposals, setSavedProposals] = useState<SavedProposal[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // State for Editing
    const [editingItem, setEditingItem] = useState<SavedProposal | null>(null);
    const [editForm, setEditForm] = useState({ title: "", content: "" });

    // State for Revise
    const [inputOverride, setInputOverride] = useState<string>("");

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Fetch Proposals
    useEffect(() => {
        const fetchProposals = async () => {
            if (conversationId) {
                try {
                    const data = await apiClient.chat.getSavedProposals(conversationId);
                    setSavedProposals(data);
                } catch (e) { console.error(e); }
            }
        };
        fetchProposals();
    }, [conversationId]);


    // --- ACTIONS ---

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this draft?")) return;
        try {
            await apiClient.chat.deleteProposal(id);
            setSavedProposals(prev => prev.filter(p => p.id !== id));
        } catch (e) { console.error(e); }
    };

    const handleRevise = (item: SavedProposal) => {
        const prompt = `I need to revise the section "${item.title}".\n\nCurrent Content:\n"${item.content || item.summary}"\n\nChanges needed: `;
        setInputOverride(prompt);
    };

    const openEditModal = (item: SavedProposal) => {
        setEditingItem(item);
        setEditForm({
            title: item.title,
            content: item.content || item.summary || ""
        });
    };

    const saveEdit = async () => {
        if (!editingItem) return;
        try {
            const updated = await apiClient.chat.updateProposal(editingItem.id, {
                title: editForm.title,
                content: editForm.content,
                summary: editForm.content.slice(0, 100) + "..."
            });
            setSavedProposals(prev => prev.map(p => p.id === editingItem.id ? updated : p));
            setEditingItem(null);
        } catch (e) { console.error(e); }
    };


    // --- CHAT LOGIC ---

    const handleSendMessage = async (content: string, file: File | null) => {
        setInputOverride("");
        if (!content && !file) return;

        // Create User Message strictly following WorkspaceMessage
        const userMsg: WorkspaceMessage = {
            id: Date.now().toString(),
            role: "user",
            content: content || (file ? `Uploaded: ${file.name}` : ""),
            timestamp: new Date(),
            attachment: file ? { name: file.name, type: file.type, size: file.size, url: URL.createObjectURL(file) } : undefined
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            let data: ChatResponse;
            if (file) {
                data = await apiClient.analyze.upload(file, content);
            } else {
                data = await apiClient.chat.send({ message: content, conversation_id: conversationId });
            }

            if (data.conversation_id && !conversationId) setConversationId(data.conversation_id);

            // Create AI Message strictly following WorkspaceMessage
            const aiMsg: WorkspaceMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.response,
                timestamp: new Date(),
                // Map API proposal to your DraftProposal type
                proposal: data.proposal ? {
                    id: `prop-${Date.now()}`,
                    title: data.proposal.title || "Draft Proposal",
                    summary: data.proposal.summary || "Generated from analysis",
                    reasoning: data.proposal.reasoning || "",
                    proposedContent: data.proposal.proposed_content || data.proposal.proposedContent || ""
                } : undefined
            };
            setMessages((prev) => [...prev, aiMsg]);

        } catch (error: any) {
            console.error("Chat Error:", error);
            const errorMsg: WorkspaceMessage = {
                id: (Date.now() + 2).toString(),
                role: "system",
                content: "⚠️ " + (error.response?.data?.detail || "Connection failed."),
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveProposal = async (proposal: DraftProposal) => {
        if (!conversationId) return;
        try {
            const savedData = await apiClient.chat.saveProposal({
                conversation_id: conversationId,
                title: proposal.title,
                summary: proposal.summary,
                content: proposal.proposedContent || proposal.reasoning
            });
            setSavedProposals(prev => [savedData, ...prev]);
        } catch (e) { console.error(e); }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background">

            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-6">

                    {/* SAVED ITEMS CAROUSEL */}
                    {savedProposals.length > 0 && (
                        <div className="w-full mb-6 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <FileCheck className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Approved Drafts</span>
                            </div>
                            <ScrollArea className="w-full whitespace-nowrap rounded-xl border bg-muted/30 p-2">
                                <div className="flex w-max space-x-3 p-1">
                                    {savedProposals.map((p) => (
                                        <SavedProposalItem
                                            key={p.id}
                                            p={p}
                                            onRevise={handleRevise}
                                            onEdit={openEditModal}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </div>
                    )}

                    {/* EMPTY STATE */}
                    {messages.length === 0 && savedProposals.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-[50vh] opacity-80 mt-10">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <Scale className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-xl font-semibold text-foreground">AI Architect Ready</h2>
                            <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">Upload a site plan or ask about NBCP Rule VII.</p>
                        </div>
                    )}

                    {/* MESSAGES */}
                    {messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            {...msg}
                            onApprove={handleApproveProposal}
                        />
                    ))}

                    {isLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse ml-4">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Analyzing...</span>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </div>

            <InputArea onSendMessage={handleSendMessage} disabled={isLoading} initialValue={inputOverride} />

            {/* EDIT MODAL - CUSTOM IMPLEMENTATION (Replaces Dialog) */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-background border border-border rounded-xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className="flex justify-between items-center pb-2 border-b">
                            <h3 className="font-semibold text-lg">Edit Draft</h3>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setEditingItem(null)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Form */}
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={editForm.title}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content</label>
                                <Textarea
                                    className="min-h-[200px] resize-none"
                                    value={editForm.content}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="ghost" onClick={() => setEditingItem(null)}>Cancel</Button>
                            <Button onClick={saveEdit}>Save Changes</Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

// --- SUB-COMPONENT FOR SAVED ITEM ---
function SavedProposalItem({ p, onRevise, onEdit, onDelete }: {
    p: SavedProposal,
    onRevise: (i: SavedProposal) => void,
    onEdit: (i: SavedProposal) => void,
    onDelete: (id: string) => void
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="group relative flex flex-col gap-1 w-[220px] p-3 rounded-lg bg-background border shadow-sm hover:border-primary/50 transition-all cursor-default">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold text-xs truncate" title={p.title}>{p.title}</span>
                </div>

                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </Button>

                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                            <div className="absolute right-0 top-6 w-32 bg-popover border border-border rounded-lg shadow-lg z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-2 text-foreground"
                                    onClick={() => { onRevise(p); setIsMenuOpen(false); }}
                                >
                                    <RefreshCw className="w-3 h-3" /> Revise
                                </button>
                                <button
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-2 text-foreground"
                                    onClick={() => { onEdit(p); setIsMenuOpen(false); }}
                                >
                                    <Pencil className="w-3 h-3" /> Edit
                                </button>
                                <button
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 text-red-600 dark:hover:bg-red-900/20 flex items-center gap-2"
                                    onClick={() => { onDelete(p.id); setIsMenuOpen(false); }}
                                >
                                    <Trash2 className="w-3 h-3" /> Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <span className="text-[10px] text-muted-foreground truncate pl-3.5">{p.summary || "No summary"}</span>
        </div>
    )
}