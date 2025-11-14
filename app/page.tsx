// --- Imports (Shadcn + Next.js) ---
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RocketIcon, WrenchIcon } from "lucide-react";
import Image from "next/image"; // Next.js Image Component

// --- SRE/DevOps Note (Turn 151/169): ---
// 1. FIX (SRE): Replaced deprecated iframe attributes (frameBorder, marginHeight)
//    with modern CSS 'style' object for a zero-border embed.
// 2. FIX (SRE): Injected Vercel <Analytics /> and <SpeedInsights /> components.
// 3. UX: 'Architect Mode (Tech)' nomenclature validated (Turn 151).

export default function LabsPage() {
  return (
    // P0: Dark Mode (Enterprise Standard)
    <main className="dark flex min-h-screen w-full flex-col items-center bg-slate-950 text-slate-50 p-8 md:p-12">
      
      {/* --- Header: Enterprise (Left-Aligned) --- */}
      <header className="w-full max-w-7xl mb-12 flex items-center justify-between">
        
        {/* Logo (Left-Aligned) */}
        <Image
          // CRITICAL: Ensure 'logo-ph3-light.svg' (WHITE text version) is in /public
          src="/logo-ph3-light.svg" 
          alt="PH3 Digital Factory Logo (</PH³>)"
          width={180} 
          height={40} 
        />
        
        {/* Page Title (Center) */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">PH3 Digital Factory</h1>
          <p className="text-xl text-slate-400">Labs & Solutions Showroom</p>
        </div>
        
        {/* Invisible spacer (Maintains title centering) */}
        <div className="w-[180px]" /> 
      
      </header>

      {/* --- UX Toggle: Global (Value vs. Process) --- */}
      <div className="flex items-center space-x-2 mb-8">
        <Label htmlFor="mode-switch" className="text-slate-400">
          Business View (What)
        </Label>
        <Switch id="mode-switch" />
        <Label htmlFor="mode-switch" className="font-bold">
          Technical View (How)
        </Label>
      </div>

      {/* --- Product Container --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* P0: IAM-HR Demo Card */}
        <Card className="bg-slate-900 border-slate-700 text-slate-50 w-[380px]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Demo: IAM-HR Sandbox
              <Badge variant="outline" className="border-green-500 text-green-500">
                <RocketIcon className="mr-1 h-3 w-3" />
                Live (P0)
              </Badge>
            </CardTitle>
            <CardDescription className="text-slate-400 pt-2">
              An interactive sandbox simulating an employee offboarding workflow,
              powered by AI (Gemini) and real-time auditing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* --- Live Feeds (Turn 165) --- */}
            <div className="space-y-4">
              
              {/* Feed 1: Action (Google Form) */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-slate-300">1. Take Action (Submit Form)</h4>
                <iframe
                  src="https://docs.google.com/forms/d/e/1FAIpQLScRhUx7MN1kYWgvPI5UwiUzsCn1Frxn829HAydgAXFSr6RWQg/viewform?embedded=true"
                  width="100%"
                  height="300"
                  // FIX 1 (SRE): Replaced deprecated attributes with CSS
                  style={{ border: 0 }} 
                >
                  Loading Form…
                </iframe>
              </div>

              {/* Feed 2: Panel (Sheet 1) */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-slate-300">2. See Panel Update (Live)</h4>
                <iframe
                  src="https://docs.google.com/spreadsheets/d/e/2PACX-1vQETSEb4DSDkS6RWX6iimcepXX2_YLj4Gecnn2LzyqHnW6jgPPUGY6HbnBJ7KAk1SHjjXa2noLsqjjG/pubhtml?gid=0&amp;single=true&amp;widget=true&amp;headers=false&amp;rm=minimal&amp;chrome=false"
                  width="100%"
                  height="200"
                  // FIX 1 (SRE): Replaced deprecated attributes with CSS
                  style={{ border: 0 }}
                  className="bg-white" // SRE Patch: Sheets embed has a white background
                >
                  Loading Panel…
                </iframe>
              </div>
              
              {/* Feed 3: Log (Sheet 2) */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-slate-300">3. See Log Update (Live)</h4>
                <iframe
                  src="https://docs.google.com/spreadsheets/d/e/2PACX-1vTcWeYgonEvmwDvGQvy9kU8rr4Pogsu2xoZANbPnsEwPiz1V_vM18p60WVIjOZmgSmsPSz9vBJsAxX2/pubhtml?gid=0&amp;single=true&amp;widget=true&amp;headers=false&amp;rm=minimal&amp;chrome=false"
                  width="100%"
                  height="150"
                  // FIX 1 (SRE): Replaced deprecated attributes with CSS
                  style={{ border: 0 }}
                  className="bg-white" // SRE Patch: Sheets embed has a white background
                >
                  Loading Log…
                </iframe>
              </div>
            </div>
            {/* --- End Feeds --- */}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            {/* Tech Stack Badges */}
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-slate-700 text-slate-300">n8n</Badge>
              <Badge variant="secondary" className="bg-slate-700 text-slate-300">GCP</Badge>
              <Badge variant="secondary" className="bg-slate-700 text-slate-300">Gemini</Badge>
            </div>
            
            {/* Button (Primary "Brand Blue") */}
            <Button variant="default">
              <WrenchIcon className="mr-2 h-4 w-4" /> Explore Solution
            </Button>
          </CardFooter>
        </Card>

        {/* (P1: FinOps Demo Card will go here) */}
      </div>

      {/* --- FIX 2 (SRE): Vercel Analytics Injection --- */}
      <Analytics />
      <SpeedInsights />
    </main>
  );
}