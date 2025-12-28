"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Scale, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTransition } from "@/components/ui/PageTransition";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const SpotlightCard = dynamic(() => import('@/components/ui/SpotlightCard'), {
    ssr: false
});

export default function ForgotPasswordPage() {
    const [mounted, setMounted] = useState(false);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    // --- HANDLE RESET LOGIC ---
    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("REQUIRED FIELD");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${location.origin}/update-password`,
            });

            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className={`min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden font-sans selection:bg-primary/10 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

                {/* 1. BACKGROUND GRID PATTERN (Subtle Architectural Feel) */}
                <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='currentColor' fill-rule='evenodd'/%3E%3C/svg%3E")` }}>
                </div>

                {/* 2. TOP NAV (Minimalist) */}
                <div className="absolute top-8 left-8 z-10">
                    <Link href="/login" className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest font-medium text-muted-foreground hover:text-foreground transition-colors group">
                        <div className="p-1 rounded-full border border-border/50 bg-background group-hover:border-foreground/50 transition-colors">
                            <ArrowLeft size={12} />
                        </div>
                        Return to Login
                    </Link>
                </div>

                {/* 3. CENTERED CARD */}
                <div className="w-full max-w-md px-6 z-10">
                    <SpotlightCard className="rounded-xl" spotlightColor="rgba(255, 255, 255, 0.05)">
                        <div className="bg-background/60 backdrop-blur-xl border border-border/40 shadow-2xl shadow-neutral-500/10 dark:shadow-neutral-950/50 p-8 md:p-12 rounded-xl relative overflow-hidden">

                            {/* Decorative Top Line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

                            <div className="text-center mb-10 space-y-2">
                                <div className="flex justify-center mb-6">
                                    <div className="bg-primary/5 p-3 rounded-full border border-primary/10">
                                        <Scale size={32} strokeWidth={1.5} className="text-primary" />
                                    </div>
                                </div>
                                <h1 className="text-3xl font-heading font-medium tracking-tight text-foreground">
                                    Recovery Protocol
                                </h1>
                                <p className="text-muted-foreground font-sans font-light text-sm max-w-xs mx-auto">
                                    Enter your professional email to restore access to the firm database.
                                </p>
                            </div>

                            {success ? (
                                // --- SUCCESS STATE ---
                                <div className="animate-in fade-in zoom-in-95 duration-300">
                                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-6 text-center space-y-4">
                                        <div className="flex justify-center">
                                            <div className="bg-emerald-500/10 p-3 rounded-full">
                                                <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 h-8 w-8" strokeWidth={1.5} />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-heading font-medium text-emerald-800 dark:text-emerald-200 uppercase tracking-widest">Link Dispatched</h3>
                                            <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 leading-relaxed">
                                                Secure credential reset link sent to:<br />
                                                <span className="font-bold border-b border-emerald-500/30 pb-0.5">{email}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setSuccess(false)}
                                        className="w-full mt-6 text-xs font-sans uppercase tracking-widest text-muted-foreground hover:text-foreground"
                                    >
                                        Reset a different email
                                    </Button>
                                </div>
                            ) : (
                                // --- FORM STATE ---
                                <form onSubmit={handleReset} className="space-y-6" noValidate>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-2">
                                            Work Email
                                        </Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="architect@firm.com"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    if (error) setError("");
                                                }}
                                                className={cn(
                                                    "pl-10 font-mono text-sm bg-neutral-50/50 dark:bg-neutral-900/50 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all",
                                                    error && "border-red-500 focus-visible:ring-red-500 bg-red-50/10"
                                                )}
                                            />
                                        </div>
                                        {error && (
                                            <p className="text-[10px] font-mono text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1 fade-in">
                                                <AlertCircle size={10} /> {error}
                                            </p>
                                        )}
                                    </div>

                                    <Button type="submit" className="w-full h-11 font-sans uppercase tracking-widest text-xs font-semibold shadow-lg shadow-primary/10" disabled={loading}>
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Recover Access"}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </SpotlightCard>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
                            System V1.0 // Security Encrypted
                        </p>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}