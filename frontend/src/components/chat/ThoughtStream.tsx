"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThoughtStreamProps {
    steps: string[];
    isComplete: boolean;
}

// Rule VII branded steps
const COMPLIANCE_STEPS = ["Scanning NBCP", "Reviewing IRR", "Compliance Check"];

interface FocusRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export default function ThoughtStream({ steps, isComplete }: ThoughtStreamProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const stepRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const [focusRect, setFocusRect] = useState<FocusRect>({ x: 0, y: 0, width: 0, height: 0 });

    // Auto-cycle through steps
    useEffect(() => {
        if (isComplete) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => {
                if (prev >= COMPLIANCE_STEPS.length - 1) return prev;
                return prev + 1;
            });
        }, 1200);

        return () => clearInterval(interval);
    }, [isComplete]);

    // Update focus rectangle position
    useEffect(() => {
        if (currentIndex === null || currentIndex === -1) return;
        if (!stepRefs.current[currentIndex] || !containerRef.current) return;

        const parentRect = containerRef.current.getBoundingClientRect();
        const activeRect = stepRefs.current[currentIndex]!.getBoundingClientRect();

        setFocusRect({
            x: activeRect.left - parentRect.left,
            y: activeRect.top - parentRect.top,
            width: activeRect.width,
            height: activeRect.height
        });
    }, [currentIndex]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25 }}
            className="flex gap-3 mb-4"
        >
            {/* AI Avatar */}
            <div className="shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <Scale className="w-4 h-4 text-primary" />
                </div>
            </div>

            {/* TrueFocus Container - Rule VII themed */}
            <div
                ref={containerRef}
                className={cn(
                    "relative flex items-center gap-4 px-5 py-3",
                    "rounded-2xl rounded-tl-sm",
                    "bg-muted/30 border border-border/50"
                )}
            >
                {COMPLIANCE_STEPS.map((step, index) => {
                    const isActive = index === currentIndex;
                    const isPast = index < currentIndex;

                    return (
                        <span
                            key={index}
                            ref={el => { stepRefs.current[index] = el; }}
                            className={cn(
                                "relative text-sm font-medium whitespace-nowrap transition-all duration-400",
                                isActive
                                    ? "text-primary"
                                    : isPast
                                        ? "text-muted-foreground/60"
                                        : "text-muted-foreground/30"
                            )}
                            style={{
                                filter: isActive ? 'blur(0px)' : isPast ? 'blur(1px)' : 'blur(2.5px)',
                                transition: 'filter 0.4s ease, color 0.4s ease'
                            }}
                        >
                            {step}
                        </span>
                    );
                })}

                {/* Focus Bracket Corners - Rule VII primary color */}
                <motion.div
                    className="absolute top-0 left-0 pointer-events-none"
                    animate={{
                        x: focusRect.x - 8,
                        y: focusRect.y - 8,
                        width: focusRect.width + 16,
                        height: focusRect.height + 16,
                        opacity: 1
                    }}
                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    {/* Top Left Corner */}
                    <motion.span
                        className="absolute w-3 h-3 top-0 left-0 border-l-2 border-t-2 rounded-tl-sm"
                        style={{ borderColor: 'hsl(var(--primary))' }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    {/* Top Right Corner */}
                    <motion.span
                        className="absolute w-3 h-3 top-0 right-0 border-r-2 border-t-2 rounded-tr-sm"
                        style={{ borderColor: 'hsl(var(--primary))' }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    />
                    {/* Bottom Left Corner */}
                    <motion.span
                        className="absolute w-3 h-3 bottom-0 left-0 border-l-2 border-b-2 rounded-bl-sm"
                        style={{ borderColor: 'hsl(var(--primary))' }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    />
                    {/* Bottom Right Corner */}
                    <motion.span
                        className="absolute w-3 h-3 bottom-0 right-0 border-r-2 border-b-2 rounded-br-sm"
                        style={{ borderColor: 'hsl(var(--primary))' }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
}
