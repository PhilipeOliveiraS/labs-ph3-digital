/* ---
File: app/page.tsx (Showroom Hall – Stable Version)
Correções aplicadas:
1. Remoção de comentários dentro de className (causava quebra no Brave/Firefox).
2. Remoção de max-w-lg para evitar colapso de grid.
3. Card agora é w-full, h-full e flex-col.
4. Grid com items-stretch para manter altura uniforme.
--- */

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
import { RocketIcon, ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const projects = [
  {
    id: "iam-hr-sandbox",
    href: "/iam-hr-sandbox",
    title: "IAM-RH Offboarding Sandbox",
    status: "Live (P0)",
    statusColor: "border-green-500 text-green-500",
    description:
      "An interactive, event-driven sandbox simulating an AI-powered offboarding workflow. Designed to eliminate critical security risks through real-time auditing.",
    copywriting:
      "Manual offboarding isn't just slow—it's dangerous. A single error costs $15k+ in data breach risks, while manual processes waste an average of 40+ engineering/management hours ($4,350) monthly. This playbook eliminates that risk and operational waste in 60 seconds.",
    stack: ["n8n", "GCP", "Gemini", "IAM", "Docker"],
  },
  {
    id: "finops-agent",
    href: "#",
    title: "FinOps Predictive Cost Agent (Atlas)",
    status: "In Development (P1)",
    statusColor: "border-yellow-500 text-yellow-500",
    description:
      "An AI-powered solution that transforms raw cloud billing data (GCP/AWS) into actionable business insights, enabling financial predictability.",
    copywriting:
      "Stop waiting 30 days for bill shock. This agent delivers real-time, predictive alerts, identifying an average of 30% waste in idle resources, turning your finance team from reactive to proactive.",
    stack: ["Python", "GCP Billing", "Gemini", "SRE"],
  },
];

export default function LabsPage() {
  return (
    <main className="dark flex min-h-screen w-full flex-col items-center bg-slate-950 text-slate-50 pt-4 pb-12 px-8 md:px-12">
      
      {/* Header */}
      <header className="w-full max-w-7xl mb-4 flex items-center justify-between">
        <Image
          src="/logo-ph3-light.svg"
          alt="PH3 Digital Factory Logo"
          width={180}
          height={40}
        />

        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">PH3 Digital Factory</h1>
          <p className="text-xl text-slate-400">Labs & Solutions Showroom</p>
        </div>

        <div className="w-[180px]" />
      </header>

      {/* UX Toggle */}
      <div className="flex items-center space-x-2 mb-8">
        <Label htmlFor="mode-switch" className="text-slate-400">
          Business View (What)
        </Label>
        <Switch id="mode-switch" />
        <Label htmlFor="mode-switch" className="font-bold">
          Technical View (How)
        </Label>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch w-full max-w-7xl">
        
        {projects.map((project) => (
          <Link href={project.href} key={project.id} className="block h-full">
            <Card
              className="
                bg-slate-900 border-slate-700/50 text-slate-50 
                flex flex-col h-full w-full
                transition-all duration-300 ease-in-out
                hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/20
                hover:border-primary/50
              "
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {project.title}
                  <Badge variant="outline" className={project.statusColor}>
                    {project.status === "Live (P0)" && (
                      <RocketIcon className="mr-1 h-3 w-3" />
                    )}
                    {project.status}
                  </Badge>
                </CardTitle>

                <CardDescription className="text-slate-400 pt-2">
                  {project.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <p className="text-sm text-slate-300 italic border-l-2 border-primary/50 pl-3">
                  {project.copywriting}
                </p>
              </CardContent>

              <CardFooter className="flex justify-between items-center">
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="bg-slate-700 text-slate-300"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>

                <div className="text-primary text-sm flex items-center">
                  Explore
                  <ArrowRightIcon className="ml-1 h-4 w-4" />
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}

      </div>

      {/* Vercel Analytics */}
      <Analytics />
      <SpeedInsights />
    </main>
  );
}
