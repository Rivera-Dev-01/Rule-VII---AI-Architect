"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from "next-themes"; // <--- 1. IMPORT THIS
import {
    Check,
    Scale,
    BrainCircuit,
    ShieldCheck,
    ArrowRight,
    Moon,
    Sun,
    Search,
    AlertTriangle,
    FileText,
    Menu
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TypewriterText } from "@/components/ui/typewriter-text";

export default function LandingPage() {
    // --- 2. USE GLOBAL THEME HOOK ---
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by waiting for mount
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className={`min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary/10 selection:text-primary font-sans`}>

            {/* Background Grid Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.03]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='currentColor' fill-rule='evenodd'/%3E%3C/svg%3E")` }}>
            </div>

            {/* --- NAVBAR --- */}
            <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                            <Scale size={18} strokeWidth={3} />
                        </div>
                        <span className="font-heading font-bold text-xl tracking-tight">Rule VII</span>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <a href="#features" className="text-xs font-sans font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Capabilities</a>
                        <a href="#pricing" className="text-xs font-sans font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                        
                        <div className="h-4 w-px bg-border mx-2"></div>
                        
                        {/* --- 3. UPDATED TOGGLE BUTTON --- */}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="rounded-full"
                        >
                            {/* Wait for mount to avoid icon flickering */}
                            {mounted && (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />)}
                        </Button>
                        
                        <Link href="/login">
                            <Button variant="ghost" className="font-sans uppercase tracking-wide text-xs">Log In</Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="font-sans uppercase tracking-widest text-xs">Get Started</Button>
                        </Link>
                    </div>
                    
                    <div className="md:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu size={24} />
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 pt-32 pb-20 px-6">

                {/* --- HERO SECTION --- */}
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center mb-32">
                    <div className="space-y-8">
                        <Badge variant="outline" className="px-3 py-1 text-[10px] font-mono font-normal rounded-full border-zinc-400 dark:border-zinc-700 uppercase tracking-wider">
                            ● SYSTEM V1.0 &nbsp;|&nbsp; NBCP COMPLIANT
                        </Badge>
                        
                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-heading font-medium leading-[0.9] tracking-tighter text-foreground">
                            Precision <br />
                            <span className="italic font-light text-muted-foreground">in every Permit.</span>
                        </h1>
                        
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-lg font-sans font-light">
                            The first AI Code Consultant engineered for Philippine Architecture.
                            Draft with confidence knowing your setbacks and egress are compliant.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/signup">
                                <Button size="lg" className="h-14 px-8 w-full sm:w-auto gap-2 font-sans uppercase tracking-widest text-xs font-semibold">
                                    Analyze Plan <ArrowRight size={16} />
                                </Button>
                            </Link>
                            <a href="#features">
                                <Button size="lg" variant="outline" className="h-14 px-8 w-full sm:w-auto font-sans uppercase tracking-widest text-xs">
                                    System Specs
                                </Button>
                            </a>
                        </div>
                    </div>

                    {/* --- CHAT MOCKUP --- */}
                    <div className="relative group perspective-1000">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                        <Card className="relative bg-zinc-950 border-zinc-800 shadow-2xl overflow-hidden aspect-[4/3] flex flex-col transform group-hover:scale-[1.01] transition-transform duration-500">
                            <div className="bg-zinc-900/50 border-b border-zinc-800 p-3 flex items-center justify-between backdrop-blur-sm">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                                </div>
                                <div className="text-[10px] font-mono text-zinc-500">Rule-VII-Analysis_Final.chat</div>
                                <div className="w-4"></div>
                            </div>
                            <div className="p-6 font-mono text-sm space-y-6 flex-1 overflow-hidden">
                                
                                {/* User Message */}
                                <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0">AR</div>
                                    <div className="flex-1 text-zinc-300">
                                        Is a 1.0m hallway compliant for a 3-storey office building?
                                    </div>
                                </div>

                                {/* AI Message */}
                                <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                                    <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-[10px] font-bold text-black shrink-0">R7</div>
                                    <div className="flex-1 text-zinc-200">
                                        <span className="text-red-400 font-bold block mb-2">[NON-COMPLIANT]</span>
                                        <p className="mb-2 text-zinc-400">Reference: <span className="underline decoration-zinc-600">NBCP Rule 12 & RA 9514 Div 8.</span></p>
                                        <p className="opacity-90 leading-relaxed min-h-[60px]">
                                            <TypewriterText 
                                                text="For educational/office occupancies, the minimum width for a corridor is 1.12 meters (44 inches). Your 1.0m width is insufficient." 
                                                delay={1.5} 
                                                loop={true}
                                            />
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* --- CAPABILITIES SECTION --- */}
                <div id="features" className="mt-40 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-border pb-6">
                        <div>
                            <h2 className="text-4xl font-heading font-medium tracking-tight">System Capabilities</h2>
                            <p className="mt-2 text-muted-foreground font-sans font-light">Powered by RAG Technology (Retrieval Augmented Generation)</p>
                        </div>
                        <div className="text-right hidden md:block">
                            <Badge variant="secondary" className="font-mono text-[10px] tracking-widest">FIG 2.0 // CORE MODULES</Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <Card className="md:col-span-2 p-8 relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-zinc-200 dark:border-zinc-800">
                             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ShieldCheck size={200} />
                            </div>
                            <CardHeader className="p-0 mb-6">
                                <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center mb-4">
                                    <ShieldCheck size={24} className="text-primary" />
                                </div>
                                <CardTitle className="text-2xl font-heading font-medium">Automated Code Compliance</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <p className="text-muted-foreground max-w-md mb-8 font-sans font-light">
                                    Cross-reference your design queries against the full text of PD 1096, RA 9514 (Fire Code), and BP 344. We don't guess; we cite the law.
                                </p>
                                <div className="bg-background border border-border p-4 rounded-lg max-w-sm shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <AlertTriangle size={16} className="text-amber-500" />
                                        <span className="text-xs font-bold font-mono uppercase">Violation Detected</span>
                                    </div>
                                    <div className="text-xs font-mono text-muted-foreground">
                                        "Setback is 2.0m. NBCP Rule VIII requires 3.0m for R-2 Zones."
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Feature 2 */}
                        <Card className="flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                            <CardHeader>
                                <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center mb-4">
                                    <Search size={24} className="text-primary" />
                                </div>
                                <CardTitle className="font-heading font-medium text-xl">Instant Technical Data</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm font-sans font-light">
                                    Get standard dimensions for plumbing, parking slots (2.5x5.0m), and structural elements instantly.
                                </p>
                            </CardContent>
                            <CardFooter className="border-t pt-6 mt-6">
                                <div className="flex flex-wrap gap-2 text-[10px] font-mono text-muted-foreground">
                                    <Badge variant="secondary" className="text-[10px]">PARKING</Badge>
                                    <Badge variant="secondary" className="text-[10px]">PLUMBING</Badge>
                                    <Badge variant="secondary" className="text-[10px]">HVAC</Badge>
                                </div>
                            </CardFooter>
                        </Card>

                        {/* Feature 3 */}
                        <Card className="flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                            <CardHeader>
                                <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center mb-4">
                                    <BrainCircuit size={24} className="text-primary" />
                                </div>
                                <CardTitle className="font-heading font-medium text-xl">Logic & Flow Critique</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm font-sans font-light">
                                    Validate your adjacencies. The AI acts as a Senior Architect, flagging privacy issues (e.g., Bathroom opening to Living Room).
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 4 */}
                        <Card className="md:col-span-2 bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-50 dark:text-zinc-900">
                            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-white/10 rounded-full"><FileText size={20} /></div>
                                        <h3 className="text-xl font-heading font-medium">Citations, Not Hallucinations.</h3>
                                    </div>
                                    <p className="text-zinc-400 dark:text-zinc-600 max-w-md text-sm font-sans">
                                        Every answer includes a direct link to the PDF page of the code. Verify the source material yourself with one click.
                                    </p>
                                </div>
                                <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 dark:text-black dark:border-black/20 font-sans uppercase tracking-widest text-xs">
                                    View NBCP Rule VIII, Page 104 ↗
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* --- PRICING SECTION --- */}
                <div id="pricing" className="mt-40 max-w-7xl mx-auto mb-20">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl font-heading font-medium tracking-tight">Professional Licensing</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto font-sans font-light">
                            Start for free. Upgrade when your project demands it.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
                        {/* Free Tier */}
                        <Card className="flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle className="font-heading text-xl">Starter</CardTitle>
                                <CardDescription className="font-sans">For testing the waters</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-mono font-bold tracking-tighter">$0</span>
                                    <span className="text-muted-foreground font-mono text-sm">/forever</span>
                                </div>
                                <ul className="space-y-3 text-sm font-sans">
                                    <li className="flex gap-3"><Check size={18} className="text-primary" /> 10 Queries / Day</li>
                                    <li className="flex gap-3"><Check size={18} className="text-primary" /> Basic NBCP Access</li>
                                    <li className="flex gap-3 text-muted-foreground"><span className="line-through">Project History</span></li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Link href="/signup" className="w-full">
                                    <Button variant="outline" className="w-full font-sans uppercase tracking-widest text-xs">Sign Up Free</Button>
                                </Link>
                            </CardFooter>
                        </Card>

                        {/* Monthly Tier */}
                        <Card className="flex flex-col h-full hover:shadow-xl transition-shadow duration-300 border-primary/20 relative">
                             <div className="absolute top-0 right-0 -mt-3 mr-4">
                                <Badge className="font-sans uppercase tracking-wider text-[10px]">Popular</Badge>
                             </div>
                            <CardHeader>
                                <CardTitle className="font-heading text-xl">Monthly License</CardTitle>
                                <CardDescription className="font-sans">For freelancers</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-mono font-bold tracking-tighter">$20</span>
                                    <span className="text-muted-foreground font-mono text-sm">/mo</span>
                                </div>
                                <ul className="space-y-3 text-sm font-sans">
                                    <li className="flex gap-3"><Check size={18} className="text-primary" /> <strong>Unlimited</strong> Queries</li>
                                    <li className="flex gap-3"><Check size={18} className="text-primary" /> Full RAG (NBCP + Fire Code)</li>
                                    <li className="flex gap-3"><Check size={18} className="text-primary" /> Save Chat History</li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full font-sans uppercase tracking-widest text-xs">Get Monthly</Button>
                            </CardFooter>
                        </Card>

                        {/* Yearly Tier */}
                        <Card className="flex flex-col h-full hover:shadow-xl transition-shadow duration-300 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950">
                            <CardHeader>
                                <CardTitle className="text-white dark:text-black font-heading text-xl">Yearly Pro</CardTitle>
                                <CardDescription className="text-zinc-400 dark:text-zinc-600 font-sans">For serious practitioners</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-mono font-bold tracking-tighter">$180</span>
                                    <span className="text-zinc-400 dark:text-zinc-600 font-mono text-sm">/yr</span>
                                </div>
                                <ul className="space-y-3 text-sm text-zinc-300 dark:text-zinc-700 font-sans">
                                    <li className="flex gap-3"><Check size={18} /> <strong>3 Months Free</strong> (Save $60)</li>
                                    <li className="flex gap-3"><Check size={18} /> Priority Server Access</li>
                                    <li className="flex gap-3"><Check size={18} /> Early Access: Vision Plan Review</li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button variant="secondary" className="w-full font-bold font-sans uppercase tracking-widest text-xs">Get Yearly License</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>

            </main>

            {/* --- FOOTER --- */}
            <footer className="bg-muted/30 border-t border-border py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground p-1 rounded-md">
                            <Scale size={16} strokeWidth={3} />
                        </div>
                        <span className="font-heading font-bold text-sm tracking-tight uppercase">Rule VII</span>
                    </div>
                    <p className="text-muted-foreground text-[10px] font-mono tracking-widest uppercase">
                        RIVERA, MIGGY G. // SYSTEM V1.0 // TAGUIG, PH
                    </p>
                </div>
            </footer>
        </div>
    );
}