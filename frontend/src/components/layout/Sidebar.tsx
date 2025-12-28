"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  PlusCircle,
  LogOut,
  Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

// Updated Navigation Items
const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Projects", icon: FolderOpen, href: "/dashboard/projects" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

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
    <aside className="w-64 border-r border-border bg-gradient-to-b from-card/50 to-card/30 h-screen sticky top-0 hidden md:flex flex-col">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <Scale size={18} strokeWidth={2.5} />
          </div>
          <div className="font-bold text-xl tracking-tight">
            Rule<span className="text-primary">VII</span>
          </div>
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
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                )}
                <item.icon size={18} className={cn(
                  "transition-transform duration-200",
                  !isActive && "group-hover:scale-110"
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-border/50 bg-background/30">
        <button
          onClick={handleSignOut}
          className="group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 w-full"
        >
          <LogOut size={18} className="group-hover:scale-110 transition-transform" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
