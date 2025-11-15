// --- Imports (Shadcn + Next.js) ---
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RocketIcon } from "lucide-react";
import Image from "next/image";

// --- SRE Note (Turn 170): Import the P0 Sandbox Component ---
import { IamHrDemo } from "@/components/ph3/iam-hr-demo"; 

export default function LabsPage() {
  return (
    // P0: Dark Mode (Enterprise Standard)
    <main className="dark flex min-h-screen w-full flex-col items-center bg-slate-950 text-slate-50 p-8 md:p-12">
      
      {/* --- Header: Enterprise (Left-Aligned) --- */}
      <header className="w-full max-w-7xl mb-12 flex items-center justify-between">
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
          
          {/* --- SRE FIX (Turn 185): The native component is now rendered --- */}
          <CardContent>
            <IamHrDemo />
          </CardContent>
          
          <CardFooter className="flex justify-between items-center">
            {/* Tech Stack Badges */}
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-slate-700 text-slate-300">n8n</Badge>
              <Badge variant="secondary" className="bg-slate-700 text-slate-300">GCP</Badge>
              <Badge variant="secondary" className="bg-slate-700 text-slate-300">Gemini</Badge>
            </div>
            {/* (Button moved *inside* the IamHrDemo component) */}
          </CardFooter>
        </Card>

        {/* (P1: FinOps Demo Card will go here) */}
      </div>

      {/* Vercel Analytics Injection */}
      <Analytics />
      <SpeedInsights />
    </main>
  );
}