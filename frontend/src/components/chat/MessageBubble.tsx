import { cn } from "@/lib/utils";
import { User, Scale } from "lucide-react"; // Import Scale

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";
  const isSystem = role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          {content}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex w-full items-start gap-3 mb-6", isUser ? "justify-end" : "justify-start")}>
      
      {/* --- AI AVATAR (Scale Logo) --- */}
      {!isUser && (
        <div className="mt-0.5 shrink-0">
           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground border border-primary/10 shadow-sm">
              <Scale className="w-4 h-4" />
           </div>
        </div>
      )}

      {/* --- MESSAGE CONTENT --- */}
      <div
        className={cn(
          "relative px-5 py-3.5 text-sm shadow-sm max-w-[85%]",
          isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm" 
            : "bg-muted/50 border border-border/50 text-foreground rounded-2xl rounded-tl-sm" 
        )}
      >
        <div className="whitespace-pre-wrap leading-relaxed">
            {content}
        </div>
      </div>

      {/* --- USER AVATAR --- */}
      {isUser && (
         <div className="mt-0.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border border-border text-muted-foreground">
               <User className="w-4 h-4" />
            </div>
         </div>
      )}
      
    </div>
  );
}