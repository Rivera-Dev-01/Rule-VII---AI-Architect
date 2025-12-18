"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileBox,
  Layers,
  Activity,
  Sun,
  Moon
} from "lucide-react";
import { cn } from "@/lib/utils"; 
import { Button } from "@/components/ui/button";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

// --- DUMMY DATA ---
const RECENT_PROJECTS = [
  { id: 1, name: "Taguig Residential Tower A", location: "BGC, Taguig", date: "2024-05-12", status: "Compliant", score: 98 },
  { id: 2, name: "Makati Commercial Complex", location: "Ayala Ave, Makati", date: "2024-05-10", status: "Issues Found", score: 72 },
  { id: 3, name: "Pasig Mixed-Use Renovation", location: "Ortigas, Pasig", date: "2024-05-08", status: "In Progress", score: 0 },
  { id: 4, name: "Quezon City Bungalow", location: "Loyola Heights, QC", date: "2024-05-01", status: "Compliant", score: 100 },
];

export default function DashboardPage() {
  // Format date like a blueprint stamp: "FRIDAY, 12 MAY 2024"
  const currentDate = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();

  // --- THEME LOGIC ---
  const [isDark, setIsDark] = useState(false);

  // Sync state with document class on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSystemDark = document.documentElement.classList.contains('dark');
      setIsDark(isSystemDark);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-50/40 dark:bg-neutral-950 text-foreground font-sans selection:bg-primary/10">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-8 lg:p-12 space-y-12 overflow-y-auto">
            
            {/* 1. WELCOME SECTION - Editorial Style */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/40">
                <div>
                    <div className="text-[10px] font-mono text-muted-foreground tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse"></span>
                        SYSTEM ACTIVE &mdash; {currentDate}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-heading font-medium tracking-tight text-foreground">
                        Project <span className="italic text-muted-foreground font-light">Overview</span>
                    </h2>
                </div>
                
                {/* ACTIONS TOOLBAR */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle Only */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleTheme}
                        className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors mr-2"
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>

                    <Button variant="outline" className="h-10 px-6 text-xs font-sans uppercase tracking-widest border-primary/20 hover:border-primary/50 transition-colors">
                        Docs
                    </Button>
                    <Button className="h-10 px-6 text-xs font-sans uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                        New Analysis <ArrowUpRight className="ml-2 h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* 2. METRIC GRID - Blueprint Spec Style */}
            <div className="grid gap-6 md:grid-cols-3">
                <TechnicalCard 
                    label="Active Projects" 
                    value="12" 
                    subValue="TOTAL"
                    icon={Layers} 
                    trend="+2 this week"
                />
                <TechnicalCard 
                    label="Compliance Index" 
                    value="85%" 
                    subValue="AVG. SCORE"
                    icon={Activity} 
                    trend="Top 10% performance"
                    highlight
                />
                <TechnicalCard 
                    label="Plan Usage" 
                    value="4" 
                    subValue="OF 5 SLOTS"
                    icon={FileBox} 
                    trend="1 analysis remaining"
                    alert
                />
            </div>

            {/* 3. RECENT PROJECTS - Minimalist Table */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-sans font-medium uppercase tracking-widest text-muted-foreground/80">
                        Recent Analysis
                    </h3>
                    <Link href="/dashboard/projects" className="text-xs font-mono text-primary hover:underline underline-offset-4 decoration-primary/30 transition-all">
                        VIEW_ALL_PROJECTS &rarr;
                    </Link>
                </div>

                <div className="border border-border/40 rounded-sm bg-background/50 backdrop-blur-sm shadow-sm overflow-hidden">
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 px-6 py-4 border-b border-border/40 bg-neutral-100/30 dark:bg-neutral-900/30 text-[10px] uppercase tracking-widest font-medium text-muted-foreground/70">
                        <div className="col-span-5 pl-2">Project Identity</div>
                        <div className="col-span-3">Status Check</div>
                        <div className="col-span-2 text-center">Tech Score</div>
                        <div className="col-span-2 text-right pr-2">Last Update</div>
                    </div>

                    <div className="divide-y divide-border/30">
                        {RECENT_PROJECTS.map((project) => (
                            <ProjectRow key={project.id} project={project} />
                        ))}
                    </div>
                </div>
            </section>

        </main>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function TechnicalCard({ label, value, subValue, icon: Icon, trend, highlight, alert }: any) {
    return (
        <div className={cn(
            "group relative p-8 rounded-sm border transition-all duration-500 ease-out",
            "bg-background/80 hover:bg-background hover:shadow-xl hover:shadow-neutral-200/20 dark:hover:shadow-neutral-900/30 hover:-translate-y-1",
            highlight ? "border-primary/20" : "border-border/40"
        )}>
            <div className={cn("absolute top-0 right-0 w-8 h-8 border-t border-r transition-colors", highlight ? "border-primary/30" : "border-transparent group-hover:border-border/60")} />
            
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-2.5 rounded-sm transition-colors", highlight ? "bg-primary/10 text-primary" : "bg-neutral-100 dark:bg-neutral-800 text-muted-foreground group-hover:text-primary")}>
                    <Icon className="h-5 w-5" strokeWidth={1.2} />
                </div>
                {alert && <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
            </div>
            
            <div className="space-y-2">
                <div className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground/80 font-semibold">
                    {label}
                </div>
                <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-mono font-light tracking-tighter text-foreground">
                        {value}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                        {subValue}
                    </span>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/30 flex items-center gap-2">
                <div className={cn("text-xs font-medium flex items-center gap-1.5", alert ? "text-amber-600 dark:text-amber-500" : "text-emerald-600 dark:text-emerald-500")}>
                   <span className={cn("w-1 h-1 rounded-full", alert ? "bg-amber-500" : "bg-emerald-500")} /> 
                   {trend}
                </div>
            </div>
        </div>
    )
}

function ProjectRow({ project }: any) {
    return (
        <div className="group grid grid-cols-1 md:grid-cols-12 items-center gap-4 px-6 py-5 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer border-l-2 border-transparent hover:border-primary/50">
            <div className="col-span-1 md:col-span-5 flex flex-col pl-2">
                <span className="font-heading font-medium text-lg text-foreground/90 group-hover:text-primary transition-colors">
                    {project.name}
                </span>
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1 mt-1">
                    LOCATION: {project.location.toUpperCase()}
                </span>
            </div>

            <div className="col-span-1 md:col-span-3">
                <StatusIndicator status={project.status} />
            </div>

            <div className="col-span-1 md:col-span-2 md:text-center">
                <div className="inline-flex flex-col items-center gap-1">
                    <span className={cn("font-mono text-xl tracking-tighter", 
                        project.score >= 90 ? "text-emerald-600" : 
                        project.score >= 70 ? "text-amber-600" : "text-muted-foreground"
                    )}>
                        {project.score > 0 ? project.score : "N/A"}
                    </span>
                    <div className="h-0.5 w-12 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                            className={cn("h-full", 
                                project.score >= 90 ? "bg-emerald-500" : 
                                project.score >= 70 ? "bg-amber-500" : "bg-transparent"
                            )} 
                            style={{ width: `${project.score}%` }} 
                        />
                    </div>
                </div>
            </div>

            <div className="col-span-1 md:col-span-2 text-right pr-2">
                <span className="font-mono text-xs text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                    {project.date.replace(/-/g, '.')}
                </span>
            </div>
        </div>
    )
}

function StatusIndicator({ status }: { status: string }) {
    const styles = {
        "Compliant": "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400",
        "Issues Found": "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400",
        "In Progress": "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400",
    }[status] || "text-muted-foreground bg-neutral-100 border-neutral-200";

    return (
        <span className={cn("inline-flex items-center px-3 py-1 rounded-sm text-[10px] uppercase tracking-widest font-medium border", styles)}>
             {status === "Compliant" && <CheckCircle2 className="w-3 h-3 mr-2" />}
             {status === "Issues Found" && <AlertTriangle className="w-3 h-3 mr-2" />}
             {status === "In Progress" && <Clock className="w-3 h-3 mr-2" />}
             {status}
        </span>
    );
}