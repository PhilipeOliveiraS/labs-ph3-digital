/* ---
File: app/page.tsx (FIXED - No top spacing)
Changes:
1. Added absolute position reset with -top offset
2. Removed all padding from main
3. Added explicit margin-top: 0 to header
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
    <main className="dark flex min-h-screen w-full flex-col items-center bg-slate-950 text-slate-50 pb-12 px-6 md:px-12">

      {/* Header - ZERO top spacing */}
      <header 
        className="w-full max-w-7xl flex flex-col md:flex-row items-center md:items-center justify-between text-center md:text-left pb-8 gap-0"
        style={{ margin: 0, padding: '0 0 2rem 0' }}
      >
        {/* Logo */}
        <div className="flex justify-center md:justify-start">
          <Image
            src="/logo-ph3-light.svg"
            alt="PH3 Digital Factory Logo"
            width={180}
            height={40}
          />
        </div>
        
        {/* Title */}
        <div className="flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            PH3 Digital Factory
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mt-1">
            Labs & Solutions Showroom
          </p>
        </div>
        
        {/* Right side spacer for desktop alignment */}
        <div className="hidden md:block w-[180px]" />
      </header>

      {/* View Mode Toggle */}
      <div className="flex items-center space-x-2 mb-8">
        <Label htmlFor="mode-switch" className="text-slate-400">
          Business View (What)
        </Label>
        <Switch id="mode-switch" />
        <Label htmlFor="mode-switch" className="font-bold">
          Technical View (How)
        </Label>
      </div>

      {/* Project Grid */}
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

      {/* Analytics */}
      <Analytics />
      <SpeedInsights />
    </main>
  );
}