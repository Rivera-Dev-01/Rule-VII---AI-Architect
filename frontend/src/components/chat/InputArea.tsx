"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface InputAreaProps {
  onSendMessage: (content: string, file: File | null) => void;
  disabled?: boolean;
  initialValue?: string;
}

export default function InputArea({ onSendMessage, disabled, initialValue }: InputAreaProps) {
  const [input, setInput] = useState(initialValue || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        // Slight delay to ensure render
        setTimeout(adjustHeight, 0);
      }
    }
  }, [initialValue]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) setSelectedFile(file);
        return;
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = () => {
    if ((!input.trim() && !selectedFile) || disabled) return;
    onSendMessage(input, selectedFile);
    setInput("");
    removeFile();
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full px-4 pb-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-2">

        {/* FILE PREVIEW CHIP */}
        {selectedFile && (
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-md w-fit px-3 py-2 rounded-xl border border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="p-1.5 bg-muted rounded-md">
              {selectedFile.type.startsWith('image') ? (
                <ImageIcon className="w-4 h-4 text-blue-500" />
              ) : (
                <FileText className="w-4 h-4 text-orange-500" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground max-w-[200px] truncate">
                {selectedFile.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
            <button
              onClick={removeFile}
              className="ml-2 hover:bg-destructive/10 hover:text-destructive rounded-full p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* INPUT CAPSULE */}
        <div className={`
            relative flex items-end gap-2 p-2 rounded-[26px] transition-all
            
            /* Light Mode Styles: distinct border, slight off-white bg, stronger shadow */
            bg-white/80 border border-zinc-200 shadow-xl shadow-black/5
            
            /* Dark Mode Styles: keeping the glass look */
            dark:bg-zinc-900/60 dark:backdrop-blur-xl dark:border-white/10 dark:shadow-black/20
            
            focus-within:ring-2 focus-within:ring-primary/20
        `}>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.dwg"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-zinc-500 hover:text-foreground hover:bg-muted shrink-0 mb-0.5"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Ask AI or Paste an image..."
            rows={1}
            className="min-h-[44px] max-h-[200px] w-full resize-none bg-transparent border-0 focus-visible:ring-0 text-sm py-3 px-0 shadow-none placeholder:text-muted-foreground/50 overflow-y-auto"
          />

          <Button
            size="icon"
            className={`h-10 w-10 rounded-full shrink-0 transition-all duration-200 mb-0.5 ${input.trim() || selectedFile
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              : "bg-zinc-100 text-zinc-300 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed"
              }`}
            onClick={handleSend}
            disabled={(!input.trim() && !selectedFile) || disabled}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Footer Text */}
        <div className="text-center text-[10px] text-muted-foreground/40 font-medium select-none">
          AI Architect can make mistakes. Verify with NBCP (PD 1096).
        </div>
      </div>
    </div>
  );
}