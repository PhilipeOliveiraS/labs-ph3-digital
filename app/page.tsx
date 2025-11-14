// --- Imports (Shadcn + Next.js) ---
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

// --- SRE/DevOps Note (Turn 151): ---
// 1. FIX: Added 'dark' className to <main> to force-load .dark CSS variables.
// 2. FIX: Moved Title block INSIDE <header> for vertical alignment.
// 3. FIX: Added invisible spacer to <header> to force title to the true center.
// 4. FIX: Updated toggle text to 'What' / 'How'.

export default function LabsPage() {
  return (
    // FIX 1: Added 'dark' class to activate .dark variables from globals.css
    <main className="dark flex min-h-screen w-full flex-col items-center bg-slate-950 text-slate-50 p-8 md:p-12">
      
      {/* --- Header: Contains Logo, Title, and Spacer --- */}
      {/* FIX 2: Title block is now INSIDE the header flex container */}
      <header className="w-full max-w-7xl mb-12 flex items-center justify-between">
        
        {/* Logo (Left) */}
        <Image
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
        
        {/* FIX 3: Invisible spacer. Matches logo width to force title center. */}
        <div className="w-[180px]" /> 
      
      </header>

      {/* --- UX Toggle: Global (Value vs. Process) --- */}
      {/* FIX 4: Updated toggle nomenclature */}
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
            <p className="text-sm text-slate-300 italic">
              [Placeholder: Google Sheet (Panel & Log) and Google Form (Action) 
              will be embedded here.]
            </p>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            {/* Tech Stack Badges */}
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-slate-700 text-slate-300">n8n</Badge>
              <Badge variant="secondary" className="bg-slate-700 text-slate-300">GCP</Badge>
              <Badge variant="secondary" className="bg-slate-700 text-slate-300">Gemini</Badge>
            </div>
            
            {/* Button will now use the '--primary' blue from globals.css */}
            <Button variant="default">
              <WrenchIcon className="mr-2 h-4 w-4" /> Explore Solution
            </Button>
          </CardFooter>
        </Card>

        {/* (P1: FinOps Demo Card will go here) */}

      </div>
    </main>
  );
}