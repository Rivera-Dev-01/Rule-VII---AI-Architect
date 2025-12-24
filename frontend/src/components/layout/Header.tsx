"use client"

import { useState, useEffect } from "react";
import { Bell, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfile {
    username: string;
    role: string;
    avatar_url?: string;
}

export default function Header() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // 1. GET THE REAL TOKEN FROM SUPABASE
                const { data: { session } } = await supabase.auth.getSession();

                if (!session?.access_token) {
                    console.error("No active session found. User might be logged out.");
                    setLoading(false);
                    return;
                }

                const token = session.access_token;

                // 2. USE THE TOKEN TO CALL BACKEND
                const response = await fetch("http://127.0.0.1:8000/api/v1/users/me", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    console.error("Backend rejected token:", response.status);
                }

            } catch (error) {
                console.error("Failed to fetch user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []); // supabase is now module-level constant

    // Helper to get initials
    const getInitials = (name: string) => {
        return name ? name.substring(0, 2).toUpperCase() : "U";
    };

    return (
        <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 flex items-center justify-between sticky top-0 z-50">
            {/* Left: Branding */}
            <div className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground p-1.5 rounded-md md:hidden">
                    <Scale size={18} strokeWidth={3} />
                </div>
                <span className="font-semibold text-lg md:hidden">Rule VII</span>
                <h1 className="hidden md:block text-sm font-medium text-muted-foreground">
                    Project / <span className="text-foreground">Dashboard</span>
                </h1>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Bell size={20} />
                </Button>

                <div className="h-6 w-px bg-border mx-1"></div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:block text-right">
                        {loading ? (
                            <div className="space-y-1">
                                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                                <div className="h-2 w-12 bg-muted animate-pulse rounded ml-auto" />
                            </div>
                        ) : (
                            <>
                                <p className="text-sm font-medium leading-none">
                                    {user?.username || "Guest"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {user?.role || "Free License"}
                                </p>
                            </>
                        )}
                    </div>
                    <Avatar className="h-9 w-9 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {user ? getInitials(user.username) : "..."}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    )
}