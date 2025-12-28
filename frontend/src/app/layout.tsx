// src/app/layout.tsx
import { Bodoni_Moda, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider"; // <--- IMPORT THIS

// ... (Keep your font configurations here unchanged) ...
const fontHeading = Bodoni_Moda({ subsets: ["latin"], variable: "--font-heading", weight: ["400", "500", "600", "700"] });
const fontSans = Manrope({ subsets: ["latin"], variable: "--font-sans", weight: ["300", "400", "500", "600"] });
const fontMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: "AI Architect Dashboard",
  description: "Compliance analysis for professionals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontHeading.variable,
          fontSans.variable,
          fontMono.variable
        )}
      >
        {/* DARK MODE ONLY */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}