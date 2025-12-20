"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  FolderPlus, 
  MoreHorizontal, 
  MessageSquare, 
  FileText, 
  Calendar,
  Search,
  ArrowLeft,
  MapPin,
  X,
  Trash2,
  Edit,
  PenTool
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Ensure you have this or use standard <textarea>
import { cn } from "@/lib/utils";
import { Project } from "@/types/workspace";

// --- MOCK DATA ---
const INITIAL_PROJECTS: Project[] = [
  { 
    id: "p-1", 
    name: "Taguig Residential Tower A", 
    description: "32-storey high-rise residential development with 4 basement levels.", 
    location: "BGC, Taguig",
    lastAccessed: new Date('2024-05-12'), 
    fileCount: 14, 
    status: 'Active',
    thumbnailClass: "from-blue-500/20 to-cyan-500/20"
  },
  { 
    id: "p-2", 
    name: "Makati Commercial Complex", 
    description: "Mixed-use commercial and office spaces. Zone C-3.", 
    location: "Ayala Ave, Makati",
    lastAccessed: new Date('2024-05-10'), 
    fileCount: 8, 
    status: 'Pending',
    thumbnailClass: "from-purple-500/20 to-pink-500/20"
  },
  { 
    id: "p-3", 
    name: "Quezon City Bungalow", 
    description: "Single-family renovation project. R-1 Zoning check.", 
    location: "Loyola Heights, QC",
    lastAccessed: new Date('2024-05-01'), 
    fileCount: 3, 
    status: 'Archived',
    thumbnailClass: "from-emerald-500/20 to-teal-500/20"
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // --- HANDLERS ---
  const handleDelete = (id: string) => {
    if(confirm("Are you sure you want to delete this project?")) {
        setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd gather form data here
    alert("Project created! (Mock)");
    setIsCreateOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-neutral-50/40 dark:bg-neutral-950 overflow-hidden relative">
      
      {/* 1. HEADER */}
      <div className="px-8 py-6 border-b border-border/40 flex items-center justify-between bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
            {/* BACK TO DASHBOARD BUTTON */}
            <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Button>
            </Link>
            <div>
                <h1 className="text-2xl font-heading font-semibold text-foreground">My Projects</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Manage your analysis contexts and uploaded plans.</p>
            </div>
        </div>

        {/* CREATE PROJECT BUTTON (Triggers Modal) */}
        <Button 
            className="shadow-lg shadow-primary/20 gap-2"
            onClick={() => setIsCreateOpen(true)}
        >
          <FolderPlus className="w-4 h-4" />
          Create Project
        </Button>
      </div>

      {/* 2. CONTENT SCROLL */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* SEARCH BAR */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              className="pl-9 bg-background/50 border-border/50 focus:bg-background transition-all rounded-xl"
            />
          </div>

          {/* PROJECTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onDelete={() => handleDelete(project.id)}
              />
            ))}
            
            {/* NEW PROJECT GHOST CARD */}
            <button 
                onClick={() => setIsCreateOpen(true)}
                className="group flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border hover:border-primary/50 bg-transparent hover:bg-muted/30 transition-all h-[280px]"
            >
                <div className="w-16 h-16 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <FolderPlus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-sm font-medium text-muted-foreground group-hover:text-primary">Create New Project</div>
            </button>
          </div>
        </div>
      </div>

      {/* 3. CREATE PROJECT MODAL (Custom Overlay) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-background border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
                    <h3 className="font-semibold text-lg">New Project</h3>
                    <Button variant="ghost" size="icon" onClick={() => setIsCreateOpen(false)} className="h-8 w-8 rounded-full">
                        <X className="w-4 h-4" />
                    </Button>
                </div>
                
                {/* Modal Form */}
                <form onSubmit={handleCreate} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Project Name</label>
                        <Input placeholder="e.g. Taguig Residential Tower" required autoFocus />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="City, Address" className="pl-9" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <Textarea 
                            placeholder="Brief details about zoning, floor area, etc..." 
                            className="min-h-[100px] resize-none"
                        />
                    </div>

                    <div className="pt-2 flex gap-3 justify-end">
                        <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Project</Button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}

// --- SUB-COMPONENTS ---

function ProjectCard({ project, onDelete }: { project: Project, onDelete: () => void }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="group relative flex flex-col bg-card/50 hover:bg-card border border-border/50 hover:border-primary/20 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 h-[280px]">
            
            {/* CARD HEADER (Color Banner) */}
            <div className={cn("h-24 w-full bg-gradient-to-br relative transition-all", project.thumbnailClass)}>
                
                {/* --- CUSTOM DROPDOWN MENU --- */}
                <div className="absolute top-3 right-3">
                    <div className="relative">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="h-8 w-8 bg-black/10 hover:bg-black/20 text-white rounded-full backdrop-blur-sm"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                        
                        {/* Dropdown Content */}
                        {isMenuOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setIsMenuOpen(false)} 
                                />
                                <div className="absolute right-0 mt-2 w-32 bg-popover border border-border rounded-lg shadow-lg z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                                    <button 
                                        className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-2 text-foreground"
                                        onClick={() => { alert("Edit Mock"); setIsMenuOpen(false); }}
                                    >
                                        <Edit className="w-3 h-3" /> Edit
                                    </button>
                                    <button 
                                        className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 text-red-600 dark:hover:bg-red-900/20 flex items-center gap-2"
                                        onClick={() => { onDelete(); setIsMenuOpen(false); }}
                                    >
                                        <Trash2 className="w-3 h-3" /> Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="absolute -bottom-6 left-6 w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                    <FileText className="w-6 h-6 text-primary/80" />
                </div>
            </div>

            {/* CARD BODY */}
            <div className="flex-1 p-6 pt-8 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-heading font-semibold text-lg line-clamp-1">{project.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {project.description}
                </p>

                {/* META INFO */}
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-5">
                    <div className="flex items-center gap-1.5">
                        <FileText className="w-3 h-3" />
                        {project.fileCount} Files
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {project.lastAccessed.toLocaleDateString()}
                    </div>
                </div>

                {/* ACTION: Chat with Rule VII AI */}
                <Link href={`/dashboard/new?project=${project.id}`} className="w-full">
                    <Button variant="outline" className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all text-xs">
                        Chat with Rule VII AI
                        <MessageSquare className="w-3 h-3 ml-2 opacity-50 group-hover:opacity-100" />
                    </Button>
                </Link>
            </div>
        </div>
    )
}