"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Check,
    Scale,
    BrainCircuit,
    ShieldCheck,
    ArrowRight,
    LayoutTemplate,
    Moon,
    Sun,
    Menu,
    X,
    Search,
    AlertTriangle,
    FileText
} from 'lucide-react';

export default function LandingPage() {
    const [darkMode, setDarkMode] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-zinc-950' : 'bg-white'}`}>

            {/* Background Grid */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.05] dark:opacity-[0.05]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23000' fill-rule='evenodd'/%3E%3C/svg%3E")` }}>
            </div>

            {/* --- NAVBAR --- */}
            <nav className="fixed w-full z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 p-1.5 rounded-sm">
                            <Scale size={18} strokeWidth={3} />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-zinc-950 dark:text-white uppercase">Rule VII</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        <a href="#features" className="hover:text-zinc-950 dark:hover:text-white transition">Capabilities</a>
                        <a href="#pricing" className="hover:text-zinc-950 dark:hover:text-white transition">Pricing</a>
                        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-2"></div>
                        <button onClick={() => setDarkMode(!darkMode)} className="hover:text-zinc-950 dark:hover:text-white transition">
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <Link href="/login" className="hover:text-zinc-950 dark:hover:text-white transition">Log In</Link>
                        <Link
                            href="/signup"
                            className="px-5 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 pt-32 pb-20 px-6">

                {/* --- HERO SECTION --- */}
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center mb-32">
                    <div>
                        <div className="inline-block border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1 text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-8 rounded-sm">
                            ● SYSTEM V1.0 &nbsp;|&nbsp; NBCP COMPLIANT
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight text-zinc-950 dark:text-white tracking-tighter mb-6">
                            Precision <br />
                            in every <span className="text-zinc-500">Permit.</span>
                        </h1>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed max-w-lg font-light">
                            The first AI Code Consultant engineered for Philippine Architecture.
                            Draft with confidence knowing your setbacks, egress, and parking layouts are compliant with PD 1096.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/signup" className="flex items-center justify-center gap-2 px-8 py-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-sm font-semibold hover:opacity-90 transition">
                                Analyze Plan
                                <ArrowRight size={18} />
                            </Link>
                            <a href="#features" className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-white rounded-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition">
                                System Specs
                            </a>
                        </div>
                    </div>
                    {/* Chat Mockup (Same as before) */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-zinc-200 to-zinc-400 dark:from-zinc-800 dark:to-zinc-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden aspect-[4/3] flex flex-col">
                            <div className="bg-zinc-900 border-b border-zinc-800 p-3 flex items-center justify-between">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                                </div>
                                <div className="text-[10px] font-mono text-zinc-500">Rule-VII-Analysis_Final.chat</div>
                                <div className="w-4"></div>
                            </div>
                            <div className="p-6 font-mono text-sm space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-6 h-6 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">AR</div>
                                    <div className="flex-1 text-zinc-300">
                                        Is a 1.0m hallway compliant for a 3-storey office building?
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-6 h-6 bg-white flex items-center justify-center text-[10px] font-bold text-black">R7</div>
                                    <div className="flex-1 text-zinc-200">
                                        <span className="text-red-400 font-bold block mb-2">[NON-COMPLIANT]</span>
                                        <p className="mb-2">Reference: <span className="underline decoration-zinc-600">NBCP Rule 12 & RA 9514 Div 8.</span></p>
                                        <p>
                                            For educational/office occupancies, the minimum width for a corridor is <strong>1.12 meters (44 inches)</strong>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CAPABILITIES SECTION (Redesigned) --- */}
                <div id="features" className="mt-32 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-zinc-950 dark:text-white tracking-tight">System Capabilities</h2>
                            <p className="mt-2 text-zinc-500 dark:text-zinc-400">Powered by RAG Technology (Retrieval Augmented Generation)</p>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="text-xs font-mono text-zinc-400">FIG 2.0 // CORE MODULES</p>
                        </div>
                    </div>

                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Feature 1: Compliance (Large) */}
                        <div className="md:col-span-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                                <ShieldCheck size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="w-10 h-10 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-6">
                                    <ShieldCheck size={20} className="text-zinc-900 dark:text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-950 dark:text-white mb-2">Automated Code Compliance</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-8">
                                    Cross-reference your design queries against the full text of PD 1096, RA 9514 (Fire Code), and BP 344. We don't guess; we cite the law.
                                </p>

                                {/* Mock UI Element */}
                                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-sm max-w-sm shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <AlertTriangle size={16} className="text-amber-500" />
                                        <span className="text-xs font-bold text-zinc-900 dark:text-white">Violation Detected</span>
                                    </div>
                                    <div className="text-xs font-mono text-zinc-500">
                                        "Setback is 2.0m. NBCP Rule VIII requires 3.0m for R-2 Zones."
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 2: Data Retrieval */}
                        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 rounded-sm flex flex-col justify-between group hover:border-zinc-400 dark:hover:border-zinc-600 transition">
                            <div>
                                <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-6">
                                    <Search size={20} className="text-zinc-900 dark:text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-950 dark:text-white mb-2">Instant Technical Data</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Get standard dimensions for plumbing, parking slots (2.5x5.0m), and structural elements instantly.
                                </p>
                            </div>
                            <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-900">
                                <div className="flex gap-2 text-[10px] font-mono text-zinc-400">
                                    <span>● PARKING</span>
                                    <span>● PLUMBING</span>
                                    <span>● HVAC</span>
                                </div>
                            </div>
                        </div>

                        {/* Feature 3: Senior Critique */}
                        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 rounded-sm flex flex-col justify-between group hover:border-zinc-400 dark:hover:border-zinc-600 transition">
                            <div>
                                <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-6">
                                    <BrainCircuit size={20} className="text-zinc-900 dark:text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-950 dark:text-white mb-2">Logic & Flow Critique</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Validate your adjacencies. The AI acts as a Senior Architect, flagging privacy issues (e.g., Bathroom opening to Living Room).
                                </p>
                            </div>
                        </div>

                        {/* Feature 4: Citations (Large) */}
                        <div className="md:col-span-2 bg-zinc-900 dark:bg-zinc-50 border border-zinc-900 dark:border-zinc-200 p-8 rounded-sm text-white dark:text-zinc-900 relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div>
                                    <div className="w-10 h-10 bg-white/10 dark:bg-zinc-900/10 flex items-center justify-center mb-6 rounded-full">
                                        <FileText size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Citations, Not Hallucinations.</h3>
                                    <p className="text-zinc-400 dark:text-zinc-600 max-w-md text-sm">
                                        Every answer includes a direct link to the PDF page of the code. Verify the source material yourself with one click.
                                    </p>
                                </div>
                                <div className="bg-white/5 dark:bg-black/5 p-4 rounded border border-white/10 dark:border-black/10 backdrop-blur-sm">
                                    <div className="text-xs font-mono opacity-70 mb-2">SOURCE LINK</div>
                                    <div className="text-sm font-bold underline decoration-zinc-500 underline-offset-4">
                                        View NBCP Rule VIII, Page 104 ↗
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- PRICING SECTION (Uniform & Animated) --- */}
                <div id="pricing" className="mt-32 max-w-7xl mx-auto mb-20">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-zinc-950 dark:text-white tracking-tight">Professional Licensing</h2>
                        <p className="mt-4 text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                            Start for free. Upgrade when your project demands it.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto items-start">

                        {/* 1. FREE TIER */}
                        <div className="group bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col relative transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-zinc-400 dark:hover:border-zinc-600 min-h-[500px]">
                            <div className="mb-4">
                                <h3 className="font-bold text-zinc-900 dark:text-white">Starter</h3>
                                <p className="text-sm text-zinc-500 mt-1">For testing the waters</p>
                            </div>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-bold text-zinc-900 dark:text-white">$0</span>
                                <span className="text-zinc-500">/forever</span>
                            </div>

                            <div className="space-y-4 mb-8 flex-1">
                                <div className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                                    <Check size={18} className="text-zinc-900 dark:text-white shrink-0" />
                                    <span><strong>10 Queries</strong> / Day</span>
                                </div>
                                <div className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                                    <Check size={18} className="text-zinc-900 dark:text-white shrink-0" />
                                    <span>Basic NBCP Access</span>
                                </div>
                                <div className="flex gap-3 text-sm text-zinc-400 dark:text-zinc-600">
                                    <X size={18} className="shrink-0" />
                                    <span className="line-through decoration-zinc-400">Project History</span>
                                </div>
                            </div>

                            <Link href="/signup" className="w-full py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-semibold group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900 transition text-center">
                                Sign Up Free
                            </Link>
                        </div>

                        {/* 2. MONTHLY PLAN */}
                        <div className="group bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col relative transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-zinc-400 dark:hover:border-zinc-600 min-h-[500px]">
                            <div className="mb-4">
                                <h3 className="font-bold text-zinc-900 dark:text-white">Monthly License</h3>
                                <p className="text-sm text-zinc-500 mt-1">For freelancers</p>
                            </div>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-bold text-zinc-900 dark:text-white">$20</span>
                                <span className="text-zinc-500">/mo</span>
                            </div>

                            <div className="space-y-4 mb-8 flex-1">
                                <div className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                                    <Check size={18} className="text-zinc-900 dark:text-white shrink-0" />
                                    <span><strong>Unlimited</strong> Queries</span>
                                </div>
                                <div className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                                    <Check size={18} className="text-zinc-900 dark:text-white shrink-0" />
                                    <span>Full RAG (NBCP + Fire Code)</span>
                                </div>
                                <div className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                                    <Check size={18} className="text-zinc-900 dark:text-white shrink-0" />
                                    <span>Save Chat History</span>
                                </div>
                            </div>

                            <button className="w-full py-3 border border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-white font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition">
                                Get Monthly
                            </button>
                        </div>

                        {/* 3. YEARLY PLAN (Pro) */}
                        <div className="group bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-zinc-100 p-8 flex flex-col relative transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl min-h-[500px]">
                            <div className="absolute top-0 right-0 bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                                Best Value
                            </div>
                            <div className="mb-4">
                                <h3 className="font-bold text-zinc-900 dark:text-white">Yearly Pro</h3>
                                <p className="text-sm text-zinc-500 mt-1">For serious practitioners</p>
                            </div>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-bold text-zinc-900 dark:text-white">$180</span>
                                <span className="text-zinc-500">/yr</span>
                            </div>

                            <div className="space-y-4 mb-8 flex-1">
                                <div className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                                    <Check size={18} className="text-zinc-900 dark:text-white shrink-0" />
                                    <span><strong>3 Months Free</strong> (Save $60)</span>
                                </div>
                                <div className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                                    <Check size={18} className="text-zinc-900 dark:text-white shrink-0" />
                                    <span>Priority Server Access</span>
                                </div>
                                <div className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                                    <Check size={18} className="text-zinc-900 dark:text-white shrink-0" />
                                    <span>Early Access: Vision Plan Review</span>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold hover:opacity-90 transition">
                                Get Yearly License
                            </button>
                        </div>

                    </div>
                </div>

            </main>

            {/* --- FOOTER --- */}
            <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 p-1 rounded-sm">
                            <Scale size={16} strokeWidth={3} />
                        </div>
                        <span className="font-bold text-sm tracking-tight text-zinc-950 dark:text-white uppercase">Rule VII</span>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs font-mono">
                        RIVERA, MIGGY G. // SYSTEM V1.0 // TAGUIG, PH
                    </p>
                </div>
            </footer>

        </div>
    );
}