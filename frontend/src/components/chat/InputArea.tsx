"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, FileText, Image as ImageIcon, Mic, ChevronUp, MessageSquare, FileEdit, CheckCircle, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_FILES = 5;

// Chat mode type
export type ChatMode = "quick_answer" | "plan_draft" | "compliance";

interface ModeOption {
  id: ChatMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const MODE_OPTIONS: ModeOption[] = [
  { id: "quick_answer", label: "Quick Answer", description: "Fast general responses", icon: <MessageSquare className="w-4 h-4" /> },
  { id: "plan_draft", label: "Plan Draft", description: "Deep Research and Drafting", icon: <FileEdit className="w-4 h-4" /> },
  { id: "compliance", label: "Compliance Check", description: "Verify code requirements", icon: <ClipboardCheck className="w-4 h-4" /> },
];

interface InputAreaProps {
  onSendMessage: (content: string, files: File[], mode: ChatMode) => void;
  disabled?: boolean;
  initialValue?: string;
}

export default function InputArea({ onSendMessage, disabled, initialValue }: InputAreaProps) {
  const [input, setInput] = useState(initialValue || "");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<ChatMode>("quick_answer");
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modeButtonRef = useRef<HTMLDivElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  // Sync initialValue when it changes (e.g. from Edit/Revise actions)
  useEffect(() => {
    if (initialValue) {
      setInput(initialValue);
      if (textareaRef.current) {
        setTimeout(adjustHeight, 0);
      }
    }
  }, [initialValue]);

  // Close mode menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modeButtonRef.current && !modeButtonRef.current.contains(e.target as Node)) {
        setIsModeMenuOpen(false);
      }
    };
    if (isModeMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModeMenuOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => {
        const combined = [...prev, ...newFiles];
        return combined.slice(0, MAX_FILES);
      });
      e.target.value = '';
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file && selectedFiles.length < MAX_FILES) {
          setSelectedFiles(prev => [...prev, file]);
        }
        return;
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = () => {
    if ((!input.trim() && selectedFiles.length === 0) || disabled) return;
    onSendMessage(input, selectedFiles, mode);
    setInput("");
    clearFiles();
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentMode = MODE_OPTIONS.find(m => m.id === mode) || MODE_OPTIONS[0];

  return (
    <div className="w-full px-4 pb-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-2">

        {/* FILE PREVIEW PILLS - Inline horizontal */}
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 bg-muted/80 rounded-full text-xs border border-border/50 animate-in fade-in slide-in-from-bottom-2"
              >
                {file.type.startsWith('image') ? (
                  <ImageIcon className="w-3 h-3 text-blue-500 shrink-0" />
                ) : (
                  <FileText className="w-3 h-3 text-orange-500 shrink-0" />
                )}
                <span className="max-w-[100px] truncate font-medium">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="hover:bg-destructive/20 hover:text-destructive rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {selectedFiles.length < MAX_FILES && (
              <span className="text-[10px] text-muted-foreground">
                {MAX_FILES - selectedFiles.length} more allowed
              </span>
            )}
          </div>
        )}

        {/* INPUT CAPSULE - Redesigned with toolbar */}
        <div className={`
            relative flex flex-col rounded-[20px] transition-all
            
            /* Light Mode Styles */
            bg-white/80 border border-zinc-200 shadow-xl shadow-black/5
            
            /* Dark Mode Styles */
            dark:bg-zinc-900/60 dark:backdrop-blur-xl dark:border-white/10 dark:shadow-black/20
            
            focus-within:ring-2 focus-within:ring-primary/20
        `}>

          {/* Textarea Section */}
          <div className="px-4 pt-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.dwg"
              multiple
            />

            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Ask about building codes or paste an image..."
              rows={1}
              className="min-h-[44px] max-h-[200px] w-full resize-none bg-transparent border-0 focus-visible:ring-0 text-sm py-2 px-0 shadow-none placeholder:text-muted-foreground/50 overflow-y-auto"
            />
          </div>

          {/* Bottom Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-border/30">

            {/* Left Side: File + Voice */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Voice input (coming soon)"
                disabled
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>

            {/* Right Side: Mode Selector + Send */}
            <div className="flex items-center gap-2">

              {/* Mode Selector Button */}
              <div className="relative" ref={modeButtonRef}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted gap-1.5"
                  onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                >
                  {currentMode.icon}
                  <span className="hidden sm:inline">{currentMode.label}</span>
                  <ChevronUp className={`w-3 h-3 transition-transform ${isModeMenuOpen ? '' : 'rotate-180'}`} />
                </Button>

                {/* Upward Dropdown Menu */}
                {isModeMenuOpen && (
                  <>
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsModeMenuOpen(false)}
                    />
                    <div className="absolute bottom-full right-0 mb-2 w-64 bg-popover border border-border rounded-xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-bottom-2 duration-150">

                      {/* Option 1: Quick Answer */}
                      <button
                        className={`w-full text-left px-4 py-3 hover:bg-muted flex items-center gap-3 transition-colors ${mode === "quick_answer" ? 'bg-primary/10' : ''
                          }`}
                        onClick={() => {
                          setMode("quick_answer");
                          setIsModeMenuOpen(false);
                        }}
                      >
                        <MessageSquare className={`w-4 h-4 shrink-0 ${mode === "quick_answer" ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${mode === "quick_answer" ? 'text-primary' : 'text-foreground'}`}>
                            Quick Answer
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Fast general responses
                          </div>
                        </div>
                        {mode === "quick_answer" && (
                          <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </button>

                      {/* Option 2: Plan Draft */}
                      <button
                        className={`w-full text-left px-4 py-3 hover:bg-muted flex items-center gap-3 transition-colors ${mode === "plan_draft" ? 'bg-primary/10' : ''
                          }`}
                        onClick={() => {
                          setMode("plan_draft");
                          setIsModeMenuOpen(false);
                        }}
                      >
                        <FileEdit className={`w-4 h-4 shrink-0 ${mode === "plan_draft" ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${mode === "plan_draft" ? 'text-primary' : 'text-foreground'}`}>
                            Plan Draft
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Deep Research and Drafting
                          </div>
                        </div>
                        {mode === "plan_draft" && (
                          <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </button>

                      {/* Option 3: Compliance Check */}
                      <button
                        className={`w-full text-left px-4 py-3 hover:bg-muted flex items-center gap-3 transition-colors ${mode === "compliance" ? 'bg-primary/10' : ''
                          }`}
                        onClick={() => {
                          setMode("compliance");
                          setIsModeMenuOpen(false);
                        }}
                      >
                        <ClipboardCheck className={`w-4 h-4 shrink-0 ${mode === "compliance" ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${mode === "compliance" ? 'text-primary' : 'text-foreground'}`}>
                            Compliance Check
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Verify code requirements
                          </div>
                        </div>
                        {mode === "compliance" && (
                          <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </button>

                    </div>
                  </>
                )}
              </div>

              {/* Send Button */}
              <Button
                size="icon"
                className={`h-8 w-8 rounded-full shrink-0 transition-all duration-200 ${input.trim() || selectedFiles.length > 0
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  : "bg-zinc-100 text-zinc-300 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed"
                  }`}
                onClick={handleSend}
                disabled={(!input.trim() && selectedFiles.length === 0) || disabled}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center text-[10px] text-muted-foreground/40 font-medium select-none">
          AI Architect can make mistakes. Verify with NBCP (PD 1096).
        </div>
      </div>
    </div>
  );
}
