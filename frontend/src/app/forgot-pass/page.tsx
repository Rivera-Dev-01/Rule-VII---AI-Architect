"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("loading");

        // Placeholder: Simulate network delay (No backend connection yet)
        setTimeout(() => {
            setStatus("success");
        }, 1500);
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white px-6">
            <div className="max-w-md w-full">
                <h1 className="text-2xl font-bold mb-2 tracking-tight">
                    Reset your password
                </h1>
                <p className="text-sm text-zinc-400 mb-6">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                {status === "success" ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-6 text-center animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-center mb-3">
                            <div className="p-3 bg-emerald-500/10 rounded-full">
                                <CheckCircle2 size={32} className="text-emerald-500" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Check your email</h3>
                        <p className="text-sm text-zinc-400 mb-6">
                            We have sent a password reset link to <span className="text-white font-medium">{email}</span>.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setStatus("idle")}
                                className="text-sm text-zinc-400 hover:text-white underline underline-offset-2 transition"
                            >
                                Didn&apos;t receive the email? Click to try again
                            </button>
                            <Link 
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 py-2 rounded-sm transition"
                            >
                                <ArrowLeft size={16} />
                                Back to log in
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label className="block text-sm font-medium text-zinc-300">
                            Email Address
                            <div className="mt-1 flex">
                                <span className="flex items-center px-3 border border-zinc-700 bg-zinc-900 rounded-l-sm">
                                    <Mail size={16} className="text-zinc-500" />
                                </span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-zinc-900 border border-l-0 border-zinc-700 rounded-r-sm text-sm
                                             focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-600"
                                    placeholder="you@studio.com"
                                />
                            </div>
                        </label>

                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-full flex items-center justify-center gap-2 py-3
                                     bg-white text-zinc-950 font-semibold rounded-sm
                                     hover:bg-zinc-200 disabled:opacity-60 transition"
                        >
                            {status === "loading" ? "Sending link..." : "Send Reset Link"}
                            {status !== "loading" && <ArrowRight size={16} />}
                        </button>
                    </form>
                )}

                {status !== "success" && (
                    <div className="mt-6 flex justify-center">
                        <Link 
                            href="/login" 
                            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition"
                        >
                            <ArrowLeft size={16} />
                            Back to log in
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}