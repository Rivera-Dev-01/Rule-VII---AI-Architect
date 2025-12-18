"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Scale, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TypewriterText } from "@/components/ui/typewriter-text";

// --- THE LOGIC: MESSAGES TO LOOP (Same as Login for consistency) ---
const MESSAGES = [
  "Join thousands of Architects automating code compliance...",
  "Stay Free as Long as You Want.",
  "Your AI Partner for NBCP, Fire Code, and BP 344 analysis."
];

export default function SignupPage() {
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);

  // --- THE LOGIC: LOOPING TIMER ---
  useEffect(() => {
    const currentText = MESSAGES[currentMsgIndex];
    const duration = (currentText.length * 50) + 3000;

    const timer = setTimeout(() => {
      setCurrentMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentMsgIndex]);

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-background">
      
      {/* --- LEFT SIDE: REGISTER FORM --- */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-y-auto">
        
        {/* Back Button */}
        <Link href="/" className="absolute top-8 left-8 text-muted-foreground hover:text-foreground transition-colors z-10">
          <div className="flex items-center gap-2 text-sm font-medium">
             <ArrowLeft size={16} /> Back
          </div>
        </Link>

        <div className="mx-auto grid w-[350px] gap-6 mt-12 md:mt-0">
          <div className="grid gap-2 text-center">
            <div className="flex justify-center mb-4">
               <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                  <Scale size={24} strokeWidth={3} />
               </div>
            </div>
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="text-balance text-muted-foreground">
              Enter your information to get started
            </p>
          </div>

          <div className="grid gap-4">
            {/* Name Fields Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input id="first-name" placeholder="Miggy" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" placeholder="Rivera" required />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="architect@example.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" required />
            </div>

            <Button type="submit" className="w-full">
              Create Account
            </Button>
            
            {/* Social Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or sign up with
                </span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-3 gap-3">
               <Button variant="outline" className="w-full" aria-label="Sign up with Google">
                  <GoogleIcon className="h-5 w-5" />
               </Button>
               <Button variant="outline" className="w-full" aria-label="Sign up with Facebook">
                  <FacebookIcon className="h-5 w-5 text-[#1877F2]" />
               </Button>
               <Button variant="outline" className="w-full" aria-label="Sign up with Microsoft">
                  <MicrosoftIcon className="h-5 w-5" />
               </Button>
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline font-medium hover:text-primary">
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: BRAND & ANIMATION --- */}
      <div className="hidden bg-zinc-900 lg:flex flex-col relative justify-center items-center text-white p-12 border-l border-zinc-800">
         {/* Background Decoration */}
         <div className="absolute inset-0 z-0 opacity-20"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM22.485 0l.83.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM0 22.485l.828.83-1.415 1.415-.828-.828-.828.828L-1.415 22.485l.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM0 54.627l.828.83-1.415 1.415-.828-.828-.828.828L-1.415 54.627l.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM54.627 60L53.8 59.17l1.415-1.415.828.828.828-.828 1.415 1.415-.828.828.828.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828zM22.485 60L21.657 59.17l1.415-1.415.828.828.828-.828 1.415 1.415-.828.828.828.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828z' fill='%23FFF' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")` }}>
         </div>

         <div className="z-10 max-w-lg text-left">
            <div className="mb-6 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-mono backdrop-blur-sm text-zinc-300">
               SYSTEM V1.0 // REGISTRATION
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6 min-h-[160px] leading-tight">
               <TypewriterText 
                  key={currentMsgIndex} 
                  text={MESSAGES[currentMsgIndex]} 
                  delay={0.1}
               />
            </h2>

            <p className="text-zinc-400 max-w-md text-lg leading-relaxed">
               Create your professional profile today to access unlimited AI-powered code reviews.
            </p>
         </div>

         <div className="absolute bottom-8 left-12 text-zinc-500 text-xs font-mono">
            RIVERA // TAGUIG, PH
         </div>
      </div>
    </div>
  );
}

// --- SOCIAL ICONS (SVG CODES) ---
// Note: We duplicate these here so this file is self-contained. 
// Ideally, move these to a separate component file later to avoid repetition.

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.797 1.603-2.797 4.16v1.957h3.696l-.582 3.667h-3.114v7.98c-2.053 1.013-4.384 1.013-6.437 0z" />
    </svg>
  );
}

function MicrosoftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 23 23" {...props}>
      <path fill="#f3f3f3" d="M0 0h23v23H0z" />
      <path fill="#f35325" d="M1 1h10v10H1z" />
      <path fill="#81bc06" d="M12 1h10v10H12z" />
      <path fill="#05a6f0" d="M1 12h10v10H1z" />
      <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  );
}