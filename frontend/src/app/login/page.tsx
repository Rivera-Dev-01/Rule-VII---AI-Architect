"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, ArrowLeft, Loader2, AlertCircle } from "lucide-react"; // Added AlertCircle
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { supabase } from "@/lib/supabase"; 
import { cn } from "@/lib/utils"; // Added cn utility

const MESSAGES = [
  "Instantly audit your floor plans against NBCP Rule VII...",
  "I am your AI Code Consultant. I help you navigate the complexities of Building Permits.",
  "NBCP Compliance. Fire Safety Standards. Accessibility Guidelines."
];

export default function LoginPage() {
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // --- ERROR STATE ---
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const router = useRouter();

  // --- THE LOGIC: LOOPING TIMER ---
  useEffect(() => {
    const currentText = MESSAGES[currentMsgIndex];
    const duration = (currentText.length * 50) + 3000;
    const timer = setTimeout(() => {
      setCurrentMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, duration);
    return () => clearTimeout(timer);
  }, [currentMsgIndex]);

  // --- HANDLE LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. CUSTOM VALIDATION (Matches Signup Style)
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = "REQUIRED FIELD";
    if (!password) newErrors.password = "REQUIRED FIELD";

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return; // Stop here if errors exist
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert("Login failed: " + error.message);
      } else {
        router.refresh();
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-background font-sans selection:bg-primary/10">
      
      {/* LEFT SIDE - The Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative">
        <Link href="/" className="absolute top-8 left-8 text-muted-foreground hover:text-foreground transition-colors group">
          <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest font-medium group-hover:underline underline-offset-4">
             <ArrowLeft size={14} /> Back
          </div>
        </Link>

        <div className="mx-auto grid w-[350px] gap-8">
          <div className="grid gap-4 text-center">
            <div className="flex justify-center mb-2">
               <div className="bg-primary text-primary-foreground p-2 rounded-lg shadow-lg shadow-primary/20">
                  <Scale size={24} strokeWidth={3} />
               </div>
            </div>
            
            {/* UPDATED: Bodoni Heading */}
            <h1 className="text-4xl font-heading font-medium tracking-tight">Welcome back</h1>
            
            {/* UPDATED: Manrope Light */}
            <p className="text-balance text-muted-foreground font-sans font-light">
              Enter your credentials to access the terminal
            </p>
          </div>

          {/* ADDED: noValidate to stop browser bubbles */}
          <form onSubmit={handleLogin} className="grid gap-5" noValidate>
            <div className="grid gap-2">
              {/* UPDATED: Technical Label */}
              <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                  Email Address
              </Label>
              {/* UPDATED: Mono Input for "Data Entry" feel + Error Handling */}
              <Input
                id="email"
                type="email"
                placeholder="architect@firm.com"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear error on type
                    if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                }}
                className={cn(
                    "font-mono text-sm bg-neutral-50 dark:bg-neutral-900 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/50",
                    errors.email && "border-red-500 focus-visible:ring-red-500 bg-red-50/10"
                )}
              />
              {/* Custom Error Message */}
              {errors.email && (
                  <p className="text-[10px] font-mono text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1 fade-in">
                      <AlertCircle size={10} /> {errors.email}
                  </p>
              )}
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                    Password
                </Label>
                <Link href="/forgot-pass" className="text-[10px] uppercase tracking-wider underline text-muted-foreground hover:text-primary font-medium">
                  Recover Access?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    // Clear error on type
                    if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                }}
                className={cn(
                    "font-mono text-sm bg-neutral-50 dark:bg-neutral-900 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/50",
                    errors.password && "border-red-500 focus-visible:ring-red-500 bg-red-50/10"
                )}
              />
              {/* Custom Error Message */}
              {errors.password && (
                  <p className="text-[10px] font-mono text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1 fade-in">
                      <AlertCircle size={10} /> {errors.password}
                  </p>
              )}
            </div>

            {/* UPDATED: Technical Button */}
            <Button type="submit" className="w-full h-10 font-sans uppercase tracking-widest text-xs font-semibold" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Access Dashboard"}
            </Button>
          </form>

            {/* Social Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-background px-2 text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
               <Button variant="outline" className="w-full border-border/60 hover:bg-neutral-50 dark:hover:bg-neutral-900"><GoogleIcon className="h-4 w-4" /></Button>
               <Button variant="outline" className="w-full border-border/60 hover:bg-neutral-50 dark:hover:bg-neutral-900"><FacebookIcon className="h-4 w-4 text-[#1877F2]" /></Button>
               <Button variant="outline" className="w-full border-border/60 hover:bg-neutral-50 dark:hover:bg-neutral-900"><MicrosoftIcon className="h-4 w-4" /></Button>
            </div>
          
          <div className="mt-2 text-center text-sm font-sans font-light text-muted-foreground">
            No active license? <Link href="/signup" className="underline font-medium hover:text-primary underline-offset-4">Register Firm</Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Visuals */}
      <div className="hidden bg-zinc-950 lg:flex flex-col relative justify-center items-center text-white p-12 border-l border-zinc-800">
         <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM22.485 0l.83.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM0 22.485l.828.83-1.415 1.415-.828-.828-.828.828L-1.415 22.485l.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM0 54.627l.828.83-1.415 1.415-.828-.828-.828.828L-1.415 54.627l.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM54.627 60L53.8 59.17l1.415-1.415.828.828.828-.828 1.415 1.415-.828.828.828.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828zM22.485 60L21.657 59.17l1.415-1.415.828.828.828-.828 1.415 1.415-.828.828.828.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828z' fill='%23FFF' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>
         <div className="z-10 max-w-lg text-left">
            <div className="mb-8 inline-block rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-mono tracking-widest backdrop-blur-sm text-zinc-300">
                SYSTEM V1.0 // ONLINE
            </div>
            
            {/* UPDATED: Bodoni Heading for Typewriter */}
            <h2 className="text-3xl font-heading font-medium tracking-tight sm:text-4xl mb-8 min-h-[160px] leading-tight text-zinc-100">
               <TypewriterText key={currentMsgIndex} text={MESSAGES[currentMsgIndex]} delay={0.1}/>
            </h2>
            
            <p className="text-zinc-400 max-w-md text-lg leading-relaxed font-sans font-light">
                Rule VII Architect is designed to assist professionals in checking compliance against Philippine Building Laws.
            </p>
         </div>
         <div className="absolute bottom-8 left-12 text-zinc-600 text-[10px] font-mono tracking-widest uppercase">
            RIVERA // TAGUIG, PH
         </div>
      </div>
    </div>
  );
}

// ICONS
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) { return <svg viewBox="0 0 24 24" {...props}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>; }
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) { return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.797 1.603-2.797 4.16v1.957h3.696l-.582 3.667h-3.114v7.98c-2.053 1.013-4.384 1.013-6.437 0z" /></svg>; }
function MicrosoftIcon(props: React.SVGProps<SVGSVGElement>) { return <svg viewBox="0 0 23 23" {...props}><path fill="#f3f3f3" d="M0 0h23v23H0z" /><path fill="#f35325" d="M1 1h10v10H1z" /><path fill="#81bc06" d="M12 1h10v10H12z" /><path fill="#05a6f0" d="M1 12h10v10H1z" /><path fill="#ffba08" d="M12 12h10v10H12z" /></svg>; }