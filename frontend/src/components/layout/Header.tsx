import { Bell, User, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
    return (
        <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 flex items-center justify-between sticky top-0 z-50">
            {/* Left: Branding (Visible on mobile if sidebar is hidden) */}
            <div className="flex items-center gap-3">
                 <div className="bg-primary text-primary-foreground p-1.5 rounded-md md:hidden">
                    <Scale size={18} strokeWidth={3} />
                </div>
                <span className="font-semibold text-lg md:hidden">Rule VII</span>
                
                {/* Breadcrumbs or Page Title could go here */}
                <h1 className="hidden md:block text-sm font-medium text-muted-foreground">
                    Project / <span className="text-foreground">New Analysis</span>
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
                        <p className="text-sm font-medium leading-none">Architect User</p>
                        <p className="text-xs text-muted-foreground mt-1">Free License</p>
                    </div>
                    <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src="/placeholder-avatar.jpg" />
                        <AvatarFallback className="bg-secondary">AR</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    )
}