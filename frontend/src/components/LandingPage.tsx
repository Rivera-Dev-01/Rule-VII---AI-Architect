"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
    Check,
    Scale,
    BrainCircuit,
    ShieldCheck,
    ArrowRight,
    Search,
    AlertTriangle,
    FileText,
    Menu,
    MessageSquare,
    Clock,
    Upload,
    Headphones,
    Users,
    Zap,
    Sparkles,
    BookOpen
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TypewriterText } from "@/components/ui/typewriter-text";

// Dynamic import to avoid SSR issues with WebGL/GSAP
const LiquidChrome = dynamic(() => import('@/components/ui/LiquidChrome'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-background" />
});

const MagicBento = dynamic(() => import('@/components/ui/MagicBento'), {
    ssr: false,
    loading: () => <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse" />
});

const SplitText = dynamic(() => import('@/components/ui/SplitText'), {
    ssr: false,
    loading: () => <span className="opacity-0">Loading...</span>
});

const SpotlightCard = dynamic(() => import('@/components/ui/SpotlightCard'), {
    ssr: false
});

const Magnet = dynamic(() => import('@/components/ui/Magnet'), {
    ssr: false
});

export default function LandingPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className={`min-h-screen bg-background text-foreground transition-all duration-700 ease-in-out selection:bg-primary/10 selection:text-primary font-sans ${mounted ? 'opacity-100' : 'opacity-0'}`}>

            {/* LiquidChrome Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40 blur-sm">
                {mounted && (
                    <LiquidChrome
                        baseColor={[0.1, 0.1, 0.1]}
                        speed={0.3}
                        amplitude={0.4}
                        frequencyX={2}
                        frequencyY={1.5}
                        interactive={true}
                    />
                )}
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
                        <Badge variant="outline" className="px-3 py-1 text-[10px] font-mono font-normal rounded-full border-zinc-600 uppercase tracking-wider shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            ● SYSTEM V1.0 &nbsp;|&nbsp; NBCP COMPLIANT
                        </Badge>

                        <h1
                            className="text-6xl md:text-7xl lg:text-8xl font-heading font-medium leading-[0.9] tracking-tighter text-white"
                            style={{ textShadow: '0 0 60px rgba(255,255,255,0.15)' }}
                        >
                            {mounted && <SplitText delay={0.2} staggerDelay={0.08}>Precision</SplitText>}
                            {!mounted && "Precision"}
                            <br />
                            <span className="italic font-light text-zinc-400" style={{ textShadow: '0 0 40px rgba(255,255,255,0.1)' }}>
                                {mounted && <SplitText delay={0.5} staggerDelay={0.06}>in every Permit.</SplitText>}
                                {!mounted && "in every Permit."}
                            </span>
                        </h1>

                        <p className="text-xl text-zinc-300 leading-relaxed max-w-lg font-sans font-light">
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
                                <Button size="lg" variant="outline" className="h-14 px-8 w-full sm:w-auto font-sans uppercase tracking-widest text-xs hover:bg-white/10">
                                    System Specs
                                </Button>
                            </a>
                        </div>
                    </div>

                    {/* --- CHAT MOCKUP --- */}
                    <div className="relative group perspective-1000">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                        <SpotlightCard
                            className="rounded-2xl"
                            spotlightColor="rgba(255, 255, 255, 0.08)"
                            spotlightSize={400}
                        >
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
                        </SpotlightCard>
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

                    <MagicBento
                        cards={[
                            {
                                title: "Automated Code Compliance",
                                description: "Cross-reference your design queries against PD 1096, RA 9514 (Fire Code), and BP 344. We cite the law, not guess.",
                                label: "Compliance",
                                icon: <ShieldCheck size={24} className="text-white/80" />,
                                span: "wide"
                            },
                            {
                                title: "Instant Technical Data",
                                description: "Get standard dimensions for plumbing, parking slots (2.5x5.0m), and structural elements instantly.",
                                label: "Data",
                                icon: <Search size={24} className="text-white/80" />
                            },
                            {
                                title: "Logic & Flow Critique",
                                description: "Validate adjacencies. The AI flags privacy issues like a Senior Architect would.",
                                label: "Analysis",
                                icon: <BrainCircuit size={24} className="text-white/80" />
                            },
                            {
                                title: "Citations, Not Hallucinations",
                                description: "Every answer includes a direct link to the PDF page of the code. Verify the source yourself.",
                                label: "Sources",
                                icon: <FileText size={24} className="text-white/80" />,
                                span: "wide"
                            }
                        ]}
                        enableStars={true}
                        enableSpotlight={true}
                        enableBorderGlow={true}
                        enableTilt={true}
                        clickEffect={true}
                        glowColor="255, 255, 255"
                        particleCount={6}
                        spotlightRadius={400}
                    />
                </div>

                {/* --- PRICING SECTION --- */}
                <div id="pricing" className="mt-40 max-w-7xl mx-auto mb-20">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl font-heading font-medium tracking-tight">Professional Licensing</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto font-sans font-light">
                            Start for free. Upgrade when your project demands it.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
                        {/* Free Tier */}
                        <SpotlightCard className="rounded-xl" spotlightColor="rgba(255, 255, 255, 0.05)">
                            <Card className="flex flex-col h-full bg-zinc-950/50 border-zinc-800/50 hover:border-zinc-700 transition-colors duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mb-4">
                                        <Scale size={24} className="text-zinc-400" />
                                    </div>
                                    <CardTitle className="font-heading text-xl text-white">Free</CardTitle>
                                    <CardDescription className="font-sans text-zinc-500">For students & testing</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-6">
                                    <div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-mono font-bold text-white">₱</span><span className="text-4xl font-mono font-bold tracking-tighter text-white">0</span>
                                            <span className="text-zinc-500 font-mono text-sm">/forever</span>
                                        </div>
                                    </div>
                                    <ul className="space-y-3 text-sm font-sans text-zinc-400">
                                        <li className="flex gap-3 items-center"><MessageSquare size={16} className="text-zinc-500 shrink-0" /> 20 Queries / Day</li>
                                        <li className="flex gap-3 items-center"><Zap size={16} className="text-zinc-500 shrink-0" /> Quick Answer Mode</li>
                                        <li className="flex gap-3 items-center"><Clock size={16} className="text-zinc-500 shrink-0" /> Chat History</li>
                                        <li className="flex gap-3 items-center text-zinc-600"><AlertTriangle size={16} className="shrink-0" /> No Full RAG Access</li>
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Link href="/signup" className="w-full">
                                        <Button variant="outline" className="w-full font-sans uppercase tracking-widest text-xs border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:text-white text-zinc-400">Sign Up Free</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        </SpotlightCard>

                        {/* Basic Tier */}
                        <SpotlightCard className="rounded-xl" spotlightColor="rgba(255, 255, 255, 0.08)">
                            <Card className="flex flex-col h-full bg-zinc-950/60 border-zinc-800/60 hover:border-zinc-600 transition-colors duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                                        <FileText size={24} className="text-zinc-300" />
                                    </div>
                                    <CardTitle className="font-heading text-xl text-white">Basic</CardTitle>
                                    <CardDescription className="font-sans text-zinc-500">For freelancers</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-6">
                                    <div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-mono font-bold text-white">₱</span><span className="text-4xl font-mono font-bold tracking-tighter text-white">1,120</span>
                                            <span className="text-zinc-500 font-mono text-sm">/mo</span>
                                        </div>
                                    </div>
                                    <ul className="space-y-3 text-sm font-sans text-zinc-300">
                                        <li className="flex gap-3 items-center"><MessageSquare size={16} className="text-zinc-400 shrink-0" /> 50 Queries / Day</li>
                                        <li className="flex gap-3 items-center"><BookOpen size={16} className="text-zinc-400 shrink-0" /> Full RAG (NBCP + Fire Code)</li>
                                        <li className="flex gap-3 items-center"><Clock size={16} className="text-zinc-400 shrink-0" /> Chat History</li>
                                        <li className="flex gap-3 items-center"><BrainCircuit size={16} className="text-zinc-400 shrink-0" /> <strong>5</strong> Deep Thinking / Day</li>
                                        <li className="flex gap-3 items-center"><ShieldCheck size={16} className="text-zinc-400 shrink-0" /> <strong>3</strong> Compliance Checklists / Day</li>
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" className="w-full font-sans uppercase tracking-widest text-xs border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 hover:text-white text-zinc-300">Get Basic</Button>
                                </CardFooter>
                            </Card>
                        </SpotlightCard>

                        {/* Pro Tier - Featured */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                            <SpotlightCard className="rounded-xl relative" spotlightColor="rgba(255, 255, 255, 0.2)">
                                <Card className="flex flex-col h-full bg-zinc-950 border-primary/60 shadow-2xl shadow-primary/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-purple-500 text-primary-foreground text-[10px] font-mono font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-lg shadow-lg">Popular</div>
                                    <CardHeader>
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                                            <BrainCircuit size={24} className="text-primary" />
                                        </div>
                                        <CardTitle className="font-heading text-xl text-white">Pro</CardTitle>
                                        <CardDescription className="font-sans text-zinc-400">For professionals</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 space-y-6">
                                        <div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-mono font-bold text-white">₱</span><span className="text-4xl font-mono font-bold tracking-tighter text-white">4,990</span>
                                                <span className="text-zinc-500 font-mono text-sm">/mo</span>
                                            </div>
                                        </div>
                                        <ul className="space-y-3 text-sm font-sans text-zinc-200">
                                            <li className="flex gap-3 items-center"><Sparkles size={16} className="text-primary shrink-0" /> <span className="text-primary font-semibold">Unlimited</span> Queries</li>
                                            <li className="flex gap-3 items-center"><BookOpen size={16} className="text-primary shrink-0" /> Full RAG (NBCP + Fire Code)</li>
                                            <li className="flex gap-3 items-center"><BrainCircuit size={16} className="text-primary shrink-0" /> <span className="text-primary font-semibold">Unlimited</span> Deep Thinking</li>
                                            <li className="flex gap-3 items-center"><ShieldCheck size={16} className="text-primary shrink-0" /> <span className="text-primary font-semibold">Unlimited</span> Compliance</li>
                                            <li className="flex gap-3 items-center"><Upload size={16} className="text-primary shrink-0" /> BYOD (Upload Documents)</li>
                                            <li className="flex gap-3 items-center"><Headphones size={16} className="text-primary shrink-0" /> Priority Support</li>
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full font-sans uppercase tracking-widest text-xs font-bold bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-[0_0_30px_rgba(139,92,246,0.3)]">Get Pro</Button>
                                    </CardFooter>
                                </Card>
                            </SpotlightCard>
                        </div>

                        {/* Team Tier */}
                        <SpotlightCard className="rounded-xl" spotlightColor="rgba(255, 255, 255, 0.1)">
                            <Card className="flex flex-col h-full bg-zinc-900 border-zinc-700 hover:border-zinc-500 transition-colors duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                                        <Users size={24} className="text-white" />
                                    </div>
                                    <CardTitle className="font-heading text-xl text-white">Team</CardTitle>
                                    <CardDescription className="font-sans text-zinc-400">For firms & teams</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-6">
                                    <div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-mono font-bold text-white">₱</span><span className="text-4xl font-mono font-bold tracking-tighter text-white">13,990</span>
                                            <span className="text-zinc-500 font-mono text-sm">/mo</span>
                                        </div>
                                    </div>
                                    <ul className="space-y-3 text-sm font-sans text-zinc-300">
                                        <li className="flex gap-3 items-center"><Check size={16} className="text-white shrink-0" /> Everything in Pro</li>
                                        <li className="flex gap-3 items-center"><Users size={16} className="text-white shrink-0" /> <strong>5 Team Seats</strong></li>
                                        <li className="flex gap-3 items-center"><Clock size={16} className="text-white shrink-0" /> Shared Compliance History</li>
                                        <li className="flex gap-3 items-center"><Sparkles size={16} className="text-white shrink-0" /> ~₱2,798/seat value</li>
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="secondary" className="w-full font-bold font-sans uppercase tracking-widest text-xs bg-white text-black hover:bg-zinc-200">Get Team</Button>
                                </CardFooter>
                            </Card>
                        </SpotlightCard>
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