"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("loading");
        setErrorMsg("");

        try {
            // Note: Supabase handles session persistence automatically.
            // Explicit persistence setting is optional and can be enabled if strict control is needed.
            // if (!rememberMe) { await supabase.auth.setPersistence('session'); }

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setStatus("error");
                setErrorMsg(error.message);
                return;
            }

            router.push("/");
        } catch (err) {
            setStatus("error");
            setErrorMsg("An unexpected error occurred");
        }
    }

    async function handleSocialLogin(provider: "google" | "facebook" | "azure") {
        setStatus("loading");
        setErrorMsg("");
        
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                scopes: provider === "azure" ? "email" : undefined,
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
                    Log in to Rule VII
                </h1>
                <p className="text-sm text-zinc-400 mb-6">
                    Continue your projects and access your license.
                </p>

                {/* Social Login Buttons */}
                <div className="space-y-3">
                    {/* Google Button */}
                    <button
                        type="button"
                        onClick={() => handleSocialLogin("google")}
                        disabled={status === "loading"}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4
                                 bg-white text-zinc-950 font-medium rounded-sm border border-zinc-300
                                 hover:bg-zinc-50 disabled:opacity-60 transition"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Facebook Button */}
                    <button
                        type="button"
                        onClick={() => handleSocialLogin("facebook")}
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
                        onClick={() => handleSocialLogin("azure")}
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
                                         focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-600"
                                placeholder="you@studio.com"
                            />
                        </div>
                    </label>

                    <label className="block text-sm font-medium text-zinc-300">
                        Password
                        <div className="mt-1 flex relative">
                            <span className="flex items-center px-3 border border-zinc-700 bg-zinc-900 rounded-l-sm">
                                <Lock size={16} className="text-zinc-500" />
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex-1 px-3 py-2 bg-zinc-900 border border-l-0 border-zinc-700 rounded-r-sm text-sm
                                         focus:outline-none focus:ring-1 focus:ring-zinc-400 pr-10 placeholder:text-zinc-600"
                                placeholder="Your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                            >
                                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                        </div>
                    </label>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-zinc-300 select-none">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="rounded border-zinc-700 bg-zinc-900 text-white focus:ring-0 focus:ring-offset-0"
                            />
                            Remember me
                        </label>
                        <Link 
                            href="/forgot-pass" 
                            className="text-zinc-400 hover:text-white underline underline-offset-2 transition"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full flex items-center justify-center gap-2 py-3
                                 bg-white text-zinc-950 font-semibold rounded-sm
                                 hover:bg-zinc-200 disabled:opacity-60 transition"
                    >
                        {status === "loading" ? "Signing in..." : "Log In"}
                        {status !== "loading" && <ArrowRight size={16} />}
                    </button>
                </form>

                {status === "error" && (
                    <p className="mt-4 flex items-center gap-2 text-sm text-rose-400">
                        <AlertCircle size={16} />
                        {errorMsg || "Invalid email or password."}
                    </p>
                )}

                <p className="mt-6 text-xs text-zinc-500">
                    Don&apos;t have an account yet?{" "}
                    <Link href="/signup" className="underline underline-offset-2">
                        Get started
                    </Link>
                </p>
            </div>
        </main>
    );
}