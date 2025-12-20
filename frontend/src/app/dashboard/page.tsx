"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from '@supabase/ssr'; // Ensure @supabase/ssr is installed
import { 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileBox,
  Layers,
  Activity,
  Sun,
  Moon,
  Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils"; 
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

// 1. Define the Interface
interface Project {
  id: string;
  name: string;
  location: string;
  status: string;
  created_at: string; 
  score?: number;     
}

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
  const [isDark, setIsDark] = useState(false);
  
  // --- REAL DATA STATE ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. CRITICAL FIX: Initialize Supabase properly
  // We use useState so it is only created ONCE.
  const [supabase] = useState(() => 
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  // 3. Fetch Data
  useEffect(() => {
    async function fetchProjects() {
      try {
        // A. Get Session Token
        const { data: { session } } = await supabase.auth.getSession();
        
        // If no user is logged in, we can't fetch private projects
        if (!session) {
            console.log("No session found");
            setIsLoading(false);
            return;
        }

        // B. Call FastAPI
        const res = await fetch("http://localhost:8000/api/v1/projects/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${session.access_token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error("Failed to fetch projects");

        const data = await res.json();
        setProjects(data);
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
    
    // Theme Logic
    if (typeof window !== 'undefined') {
        const isSystemDark = document.documentElement.classList.contains('dark');
        setIsDark(isSystemDark);
    }
  }, [supabase]); // Safe to include 'supabase' here because it's stable from useState

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  return (
    <div className="flex min-h-screen bg-neutral-50/40 dark:bg-neutral-950 text-foreground font-sans selection:bg-primary/10">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-8 lg:p-12 space-y-12 overflow-y-auto">
            
            {/* WELCOME SECTION */}
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
                
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="mr-2">
                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                    <Button variant="outline" className="h-10 px-6 text-xs font-sans uppercase tracking-widest border-primary/20 hover:border-primary/50 transition-colors">
                        Docs
                    </Button>
                    <Link href="/dashboard/new">
                        <Button className="h-10 px-6 text-xs font-sans uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                            New Analysis <ArrowUpRight className="ml-2 h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* METRIC GRID */}
            <div className="grid gap-6 md:grid-cols-3">
                <TechnicalCard 
                    label="Active Projects" 
                    value={isLoading ? "-" : projects.length.toString()} 
                    subValue="TOTAL"
                    icon={Layers} 
                    trend={`Updated just now`}
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
                    value={isLoading ? "-" : projects.length.toString()} 
                    subValue="USED"
                    icon={FileBox} 
                    trend="Limit: 5 Projects"
                    alert
                />
            </div>

            {/* RECENT PROJECTS TABLE */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-sans font-medium uppercase tracking-widest text-muted-foreground/80">
                        Recent Analysis
                    </h3>
                    <Link href="/dashboard/projects" className="text-xs font-mono text-primary hover:underline underline-offset-4 decoration-primary/30 transition-all">
                        VIEW_ALL_PROJECTS &rarr;
                    </Link>
                </div>

                <div className="border border-border/40 rounded-sm bg-background/50 backdrop-blur-sm shadow-sm overflow-hidden min-h-[200px]">
                    <div className="hidden md:grid grid-cols-12 px-6 py-4 border-b border-border/40 bg-neutral-100/30 dark:bg-neutral-900/30 text-[10px] uppercase tracking-widest font-medium text-muted-foreground/70">
                        <div className="col-span-5 pl-2">Project Identity</div>
                        <div className="col-span-3">Status Check</div>
                        <div className="col-span-2 text-center">Tech Score</div>
                        <div className="col-span-2 text-right pr-2">Last Update</div>
                    </div>

                    <div className="divide-y divide-border/30">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                <span className="text-xs font-mono">LOADING_DATA...</span>
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <FileBox className="w-8 h-8 mb-2 opacity-20" />
                                <span className="text-xs font-mono">NO_PROJECTS_FOUND</span>
                                <Link href="/dashboard/new" className="mt-2 text-xs text-primary hover:underline">
                                    Start your first analysis
                                </Link>
                            </div>
                        ) : (
                            // Slice to show only top 5 recent projects
                            projects.slice(0, 5).map((project) => (
                                <ProjectRow key={project.id} project={project} />
                            ))
                        )}
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

function ProjectRow({ project }: { project: Project }) {
    // Generate a formatted date from the backend timestamp
    const dateStr = new Date(project.created_at).toLocaleDateString('en-GB');
    const displayScore = project.score || 0; 

    return (
        <div className="group grid grid-cols-1 md:grid-cols-12 items-center gap-4 px-6 py-5 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer border-l-2 border-transparent hover:border-primary/50">
            <div className="col-span-1 md:col-span-5 flex flex-col pl-2">
                <span className="font-heading font-medium text-lg text-foreground/90 group-hover:text-primary transition-colors">
                    {project.name}
                </span>
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1 mt-1">
                    LOCATION: {project.location ? project.location.toUpperCase() : "UNKNOWN"}
                </span>
            </div>

            <div className="col-span-1 md:col-span-3">
                <StatusIndicator status={project.status || "Unknown"} />
            </div>

            <div className="col-span-1 md:col-span-2 md:text-center">
                <div className="inline-flex flex-col items-center gap-1">
                    <span className={cn("font-mono text-xl tracking-tighter", 
                        displayScore >= 90 ? "text-emerald-600" : 
                        displayScore >= 70 ? "text-amber-600" : "text-muted-foreground"
                    )}>
                        {displayScore > 0 ? displayScore : "N/A"}
                    </span>
                    <div className="h-0.5 w-12 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                            className={cn("h-full", 
                                displayScore >= 90 ? "bg-emerald-500" : 
                                displayScore >= 70 ? "bg-amber-500" : "bg-transparent"
                            )} 
                            style={{ width: `${displayScore}%` }} 
                        />
                    </div>
                </div>
            </div>

            <div className="col-span-1 md:col-span-2 text-right pr-2">
                <span className="font-mono text-xs text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                    {dateStr.replace(/\//g, '.')}
                </span>
            </div>
        </div>
    )
}

function StatusIndicator({ status }: { status: string }) {
    const styles: Record<string, string> = {
        "Compliant": "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400",
        "Issues Found": "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400",
        "In Progress": "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400",
        "Active": "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-400",
    };
    
    const styleClass = styles[status] || "text-muted-foreground bg-neutral-100 border-neutral-200";

    return (
        <span className={cn("inline-flex items-center px-3 py-1 rounded-sm text-[10px] uppercase tracking-widest font-medium border", styleClass)}>
             {status === "Compliant" && <CheckCircle2 className="w-3 h-3 mr-2" />}
             {(status === "Issues Found" || status === "Issues") && <AlertTriangle className="w-3 h-3 mr-2" />}
             {(status === "In Progress" || status === "Active") && <Clock className="w-3 h-3 mr-2" />}
             {status}
        </span>
    );
}