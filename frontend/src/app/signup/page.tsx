"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] =
        useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("loading");
        setErrorMsg("");

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setStatus("error");
            setErrorMsg(error.message);
            return;
        }

        // Depending on your Supabase settings, this may send a confirmation email.
        setStatus("success");
        // After a short delay, send them to home or a dashboard.
        setTimeout(() => router.push("/"), 1500);
    }

    async function handleFacebookSignup() {
        setStatus("loading");
        setErrorMsg("");

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "facebook",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setStatus("error");
            setErrorMsg(error.message);
        }
    }

    async function handleMicrosoftSignup() {
        setStatus("loading");
        setErrorMsg("");

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "azure",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                scopes: "email",
            },
        });

        if (error) {
            setStatus("error");
            setErrorMsg(error.message);
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white px-6">
            <div className="max-w-md w-full">
                <h1 className="text-2xl font-bold mb-2 tracking-tight">
                    Create your Rule VII account
                </h1>
                <p className="text-sm text-zinc-400 mb-6">
                    Used to save your chats and manage your license.
                </p>

                {/* Social Sign Up Buttons */}
                <div className="space-y-3">
                    {/* Facebook Button */}
                    <button
                        type="button"
                        onClick={handleFacebookSignup}
                        disabled={status === "loading"}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4
                           bg-[#1877F2] text-white font-medium rounded-sm
                           hover:bg-[#166FE5] disabled:opacity-60 transition"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Continue with Facebook
                    </button>

                    {/* Microsoft Button */}
                    <button
                        type="button"
                        onClick={handleMicrosoftSignup}
                        disabled={status === "loading"}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4
                           bg-white text-zinc-950 font-medium rounded-sm border border-zinc-300
                           hover:bg-zinc-50 disabled:opacity-60 transition"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 23 23">
                            <path fill="#f35325" d="M0 0h11v11H0z" />
                            <path fill="#81bc06" d="M12 0h11v11H12z" />
                            <path fill="#05a6f0" d="M0 12h11v11H0z" />
                            <path fill="#ffba08" d="M12 12h11v11H12z" />
                        </svg>
                        Continue with Microsoft
                    </button>
                </div>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-zinc-950 text-zinc-500">Or continue with email</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block text-sm font-medium text-zinc-300">
                        Email
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
                           focus:outline-none focus:ring-1 focus:ring-zinc-400"
                                placeholder="you@studio.com"
                            />
                        </div>
                    </label>

                    <label className="block text-sm font-medium text-zinc-300">
                        Password
                        <div className="mt-1 flex">
                            <span className="flex items-center px-3 border border-zinc-700 bg-zinc-900 rounded-l-sm">
                                <Lock size={16} className="text-zinc-500" />
                            </span>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex-1 px-3 py-2 bg-zinc-900 border border-l-0 border-zinc-700 rounded-r-sm text-sm
                           focus:outline-none focus:ring-1 focus:ring-zinc-400"
                                placeholder="At least 8 characters"
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
                        {status === "loading" ? "Creating account..." : "Get Started"}
                        {status !== "loading" && <ArrowRight size={16} />}
                    </button>
                </form>

                {status === "success" && (
                    <p className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
                        <CheckCircle2 size={16} />
                        Account created. Redirecting…
                    </p>
                )}

                {status === "error" && (
                    <p className="mt-4 flex items-center gap-2 text-sm text-rose-400">
                        <AlertCircle size={16} />
                        {errorMsg || "Something went wrong. Please try again."}
                    </p>
                )}

                <p className="mt-6 text-xs text-zinc-500">
                    Already have an account?{" "}
                    <a href="/login" className="underline underline-offset-2">
                        Log in
                    </a>
                </p>
            </div>
        </main>
    );
}