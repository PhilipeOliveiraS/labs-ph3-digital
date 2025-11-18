// --- File: app/iam-hr-sandbox/page.tsx ---

// Redesigned IAM-HR Sandbox inspired by dashboard structure

// Features: Sidebar navigation, table view, status tracking, real-time updates



import { IamHrDemo } from "@/components/ph3/iam-hr-demo";

import Link from "next/link";

import {

  Shield,

  Users,

  Activity,

  Settings,

  Home,

  Clock,

  CheckCircle2,

  XCircle,

  AlertCircle

} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import {

  Card,

  CardContent,

  CardDescription,

  CardHeader,

  CardTitle,

} from "@/components/ui/card";



export default function IamHrSandboxPage() {

  return (

    <main className="dark flex min-h-screen w-full bg-slate-950 text-slate-50">

     

      {/* Sidebar Navigation */}

      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-900/50 p-6">

        {/* Logo/Brand */}

        <div className="mb-8">

          <Link

            href="/"

            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"

          >

            <Shield className="h-6 w-6" />

            <span className="font-bold text-lg">IAM-HR Sandbox</span>

          </Link>

        </div>



        {/* Navigation Menu */}

        <nav className="flex-1 space-y-2">

          <div className="text-xs font-semibold text-slate-400 uppercase mb-3">

            Main Menu

          </div>

         

          <Link

            href="/"

            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-50 hover:bg-slate-800/50 transition-colors"

          >

            <Home className="h-4 w-4" />

            <span>Dashboard</span>

          </Link>



          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary border-l-2 border-primary">

            <Activity className="h-4 w-4" />

            <span className="font-medium">Offboarding</span>

          </div>



          <Link

            href="#"

            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-50 hover:bg-slate-800/50 transition-colors"

          >

            <Users className="h-4 w-4" />

            <span>Employees</span>

          </Link>



          <Link

            href="#"

            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-50 hover:bg-slate-800/50 transition-colors"

          >

            <Settings className="h-4 w-4" />

            <span>IAM Settings</span>

          </Link>

        </nav>



        {/* Help Card at Bottom */}

        <Card className="bg-slate-800/50 border-slate-700">

          <CardHeader className="pb-3">

            <CardTitle className="text-sm">Need Help?</CardTitle>

          </CardHeader>

          <CardContent className="text-xs text-slate-400">

            <p className="mb-3">Check our documentation for setup guides.</p>

            <button className="w-full px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-md text-xs font-medium transition-colors">

              Documentation

            </button>

          </CardContent>

        </Card>

      </aside>



      {/* Main Content Area */}

      <div className="flex-1 flex flex-col overflow-hidden">

       

        {/* Top Bar */}

        <header className="border-b border-slate-800 bg-slate-900/30 backdrop-blur-sm px-8 py-4">

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-2xl font-bold tracking-tight">

                Offboarding Workflow

              </h1>

              <p className="text-sm text-slate-400 mt-1">

                Real-time IAM resource deprovisioning sandbox

              </p>

            </div>

           

            {/* Status Indicator */}

            <div className="flex items-center gap-2">

              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>

              <span className="text-sm text-slate-400">System Active</span>

            </div>

          </div>

        </header>



        {/* Scrollable Content */}

        <div className="flex-1 overflow-y-auto px-8 py-6">

         

          {/* Stats Cards Row */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            <Card className="bg-slate-900 border-slate-700/50">

              <CardHeader className="pb-3">

                <div className="flex items-center justify-between">

                  <CardDescription className="text-slate-400">

                    Total Offboardings

                  </CardDescription>

                  <CheckCircle2 className="h-4 w-4 text-green-500" />

                </div>

              </CardHeader>

              <CardContent>

                <div className="text-3xl font-bold">24</div>

                <p className="text-xs text-slate-500 mt-1">This month</p>

              </CardContent>

            </Card>



            <Card className="bg-slate-900 border-slate-700/50">

              <CardHeader className="pb-3">

                <div className="flex items-center justify-between">

                  <CardDescription className="text-slate-400">

                    Avg. Processing Time

                  </CardDescription>

                  <Clock className="h-4 w-4 text-blue-500" />

                </div>

              </CardHeader>

              <CardContent>

                <div className="text-3xl font-bold">58s</div>

                <p className="text-xs text-slate-500 mt-1">Down from 40+ hours</p>

              </CardContent>

            </Card>



            <Card className="bg-slate-900 border-slate-700/50">

              <CardHeader className="pb-3">

                <div className="flex items-center justify-between">

                  <CardDescription className="text-slate-400">

                    Security Score

                  </CardDescription>

                  <Shield className="h-4 w-4 text-primary" />

                </div>

              </CardHeader>

              <CardContent>

                <div className="text-3xl font-bold">98%</div>

                <p className="text-xs text-slate-500 mt-1">Compliance rate</p>

              </CardContent>

            </Card>

          </div>



          {/* Main Demo Component */}

          <Card className="bg-slate-900 border-slate-700/50 mb-8">

            <CardHeader>

              <CardTitle className="flex items-center gap-2">

                <Activity className="h-5 w-5 text-primary" />

                Live Offboarding Demo

              </CardTitle>

              <CardDescription>

                Simulate an employee offboarding workflow with real-time IAM resource deprovisioning

              </CardDescription>

            </CardHeader>

            <CardContent>

              <IamHrDemo />

            </CardContent>

          </Card>



          {/* Recent Activity Table */}

          <Card className="bg-slate-900 border-slate-700/50">

            <CardHeader>

              <CardTitle>Recent Offboarding Activity</CardTitle>

              <CardDescription>

                Latest employee offboarding requests processed

              </CardDescription>

            </CardHeader>

            <CardContent>

              <div className="space-y-4">

                {/* Table Header */}

                <div className="grid grid-cols-4 gap-4 text-xs font-semibold text-slate-400 uppercase pb-2 border-b border-slate-800">

                  <div>Employee</div>

                  <div>Position</div>

                  <div>Status</div>

                  <div>Timestamp</div>

                </div>



                {/* Table Rows */}

                <ActivityRow

                  name="Sarah Johnson"

                  email="sarah.j@company.com"

                  position="Designer"

                  status="completed"

                  time="2 min ago"

                />

                <ActivityRow

                  name="Mike Chen"

                  email="mike.c@company.com"

                  position="Developer"

                  status="processing"

                  time="5 min ago"

                />

                <ActivityRow

                  name="Emily Davis"

                  email="emily.d@company.com"

                  position="Manager"

                  status="completed"

                  time="12 min ago"

                />

                <ActivityRow

                  name="Alex Rivera"

                  email="alex.r@company.com"

                  position="Analyst"

                  status="failed"

                  time="18 min ago"

                />

              </div>

            </CardContent>

          </Card>



          {/* Footer Spacing */}

          <div className="h-8"></div>

        </div>

      </div>

    </main>

  );

}



// Activity Row Component

function ActivityRow({

  name,

  email,

  position,

  status,

  time

}: {

  name: string;

  email: string;

  position: string;

  status: 'completed' | 'processing' | 'failed';

  time: string;

}) {

  const statusConfig = {

    completed: {

      icon: CheckCircle2,

      color: 'text-green-500 border-green-500',

      bg: 'bg-green-500/10',

      label: 'Completed'

    },

    processing: {

      icon: Clock,

      color: 'text-blue-500 border-blue-500',

      bg: 'bg-blue-500/10',

      label: 'Processing'

    },

    failed: {

      icon: XCircle,

      color: 'text-red-500 border-red-500',

      bg: 'bg-red-500/10',

      label: 'Failed'

    }

  };



  const config = statusConfig[status];

  const Icon = config.icon;



  return (

    <div className="grid grid-cols-4 gap-4 items-center py-3 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors rounded-lg px-2">

      <div>

        <div className="font-medium text-slate-200">{name}</div>

        <div className="text-xs text-slate-500">{email}</div>

      </div>

      <div className="text-sm text-slate-400">{position}</div>

      <div>

        <Badge

          variant="outline"

          className={`${config.color} ${config.bg} flex items-center gap-1 w-fit`}

        >

          <Icon className="h-3 w-3" />

          {config.label}

        </Badge>

      </div>

      <div className="text-sm text-slate-500">{time}</div>

    </div>

  );

}