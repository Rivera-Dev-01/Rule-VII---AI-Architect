"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Added useRouter
import { 
  LayoutDashboard, 
  FolderOpen, 
  FileText, 
  Settings, 
  PlusCircle, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase"; // Import your existing supabase client

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Projects", icon: FolderOpen, href: "/dashboard/projects" },
  { label: "Saved Reports", icon: FileText, href: "/dashboard/reports" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter(); // Initialize router

  // --- SIGN OUT LOGIC ---
  const handleSignOut = async () => {
    // 1. Clear session from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Sign out error:", error);
    
    // 2. Clear Next.js cache and redirect
    router.refresh();
    router.replace("/login");
  };

  return (
    <aside className="w-64 border-r border-border bg-card/50 h-screen sticky top-0 hidden md:flex flex-col">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="font-bold text-xl tracking-tight">
          Rule<span className="text-primary">VII</span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="flex-1 py-6 px-4 space-y-2">
        {/* Call to Action */}
        <Link href="/dashboard/new" className="block mb-6">
            <Button className="w-full justify-start gap-2 shadow-lg shadow-primary/20" size="lg">
            <PlusCircle size={18} />
            New Analysis
            </Button>
        </Link>

        {/* Links */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-border">
        <button 
            onClick={handleSignOut} // <--- Connected here
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-red-500 transition-colors w-full"
        >
            <LogOut size={18} />
            Sign Out
        </button>
      </div>
    </aside>
  );
}