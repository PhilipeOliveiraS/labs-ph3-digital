// --- SRE Note (Turn 183): P0.5 (Live Data) ---
// This code REPLACES the P0.1 (Turn 170) placeholder.
// 1. Installs 'swr' (Vercel's data fetcher).
// 2. Installs 'shadcn/ui Table' (Enterprise UI).
// 3. 'useSWR' fetches the LIVE data from the n8n GET webhook.
// 4. 'handleSubmit' now uses 'mutate' (SWR) to trigger a refresh
//    (the "Aha! Moment").

"use client"; // CRITICAL: This component is now fully interactive.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WrenchIcon } from "lucide-react";
// SRE: Import SWR hooks
import useSWR, { mutate } from "swr";
// SRE: Import Shadcn Table components
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // For the Status

// --- SRE: Define API Endpoints (Turn 172/173) ---
const N8N_GET_DATA_URL = "https://n8n.ph3digital.com.br/webhook/iam-hr-data";
const N8N_POST_ACTION_URL = "https://n8n.ph3digital.com.br/webhook/iam-hr-action";

// SRE: Define the SWR data fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// SRE: Define the data structure (Defensive Engineering)
interface Employee {
  FullName: string;
  Email: string;
  Status: string;
  AccessGroups: string;
}

export function IamHrDemo() {
  // --- SRE: SWR Data Fetching Hook ---
  // This hook fetches, caches, and re-validates data automatically.
  const { data, error, isLoading: isTableLoading } = useSWR(N8N_GET_DATA_URL, fetcher, {
    // SRE: Refresh data every 30 seconds
    refreshInterval: 30000, 
  });

  // --- State for the Form ---
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleSubmit = async () => {
    if (!selectedEmployee) {
      setSubmitMessage("Please select an employee to offboard.");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      // SRE Note: POSTing to the n8n action webhook (Turn 173)
      const response = await fetch(N8N_POST_ACTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // SRE Note: This key MUST match the Zod schema (Turn 182)
          "Select Employee to Offboard": selectedEmployee,
        }),
      });

      if (!response.ok) {
        throw new Error("Webhook failed");
      }

      // SRE Note: This is the "Aha! Moment" (Turn 143)
      setSubmitMessage("Success! Request logged. Refreshing panel...");

      // --- SRE "CHECKMATE" (THE "AHA! MOMENT") ---
      // Force SWR (the table) to re-fetch its data NOW.
      // This makes the panel update instantly after the POST.
      mutate(N8N_GET_DATA_URL);

    } catch (error) {
      setSubmitMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
      setSelectedEmployee(""); // Reset dropdown
    }
  };

  // --- SRE: Handle Table Loading/Error States ---
  let tableContent;
  if (isTableLoading) {
    tableContent = <p className="text-slate-400 italic">Loading Live Panel...</p>;
  } else if (error) {
    tableContent = <p className="text-red-500">Error: Failed to load data from n8n.</p>;
  } else if (data && data.values) {
    // SRE: Skip the header row (A1, B1, C1...) from Google Sheets
    const employeesData: Employee[] = data.values.slice(1).map((row: string[]) => ({
      FullName: row[0],
      Email: row[1],
      Status: row[2],
      AccessGroups: row[3],
    }));

    tableContent = (
      <Table>
        <TableCaption className="text-slate-400">Live Employee Status Panel</TableCaption>
        <TableHeader>
          <TableRow className="border-slate-700 hover:bg-slate-800">
            <TableHead className="text-white">Employee</TableHead>
            <TableHead className="text-white">Status</TableHead>
            <TableHead className="text-white">Access Groups</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employeesData.map((emp) => (
            <TableRow key={emp.Email} className="border-slate-800">
              <TableCell className="font-medium">{emp.FullName}<br/>
                <span className="text-xs text-slate-400">{emp.Email}</span>
              </TableCell>
              <TableCell>
                <Badge 
                  className={emp.Status === "ACTIVE" 
                    ? "bg-green-600 text-white" 
                    : "bg-red-600 text-white"}
                >
                  {emp.Status}
                </Badge>
              </TableCell>
              <TableCell>{emp.AccessGroups}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="space-y-4">
      {/* Feed 1: The Action (Native Shadcn Form) */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-300">1. Take Action (Submit)</h4>
        
        <Select onValueChange={setSelectedEmployee} value={selectedEmployee} disabled={isSubmitting}>
          <SelectTrigger className="w-full bg-slate-800 border-slate-700">
            <SelectValue placeholder="Select Employee to Offboard" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700 text-slate-50">
            <SelectGroup>
              <SelectLabel>Employees (Active)</SelectLabel>
              {data && data.values.slice(1)
                .filter((row: string[]) => row[2] === "ACTIVE")
                .map((row: string[]) => (
                  <SelectItem key={row[1]} value={row[1]}>
                    {row[0]} ({row[1]})
                  </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <Button 
          variant="default" 
          className="w-full" 
          onClick={handleSubmit} 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : (
            <>
              <WrenchIcon className="mr-2 h-4 w-4" /> Execute Offboarding
            </>
          )}
        </Button>
        
        {submitMessage && (
          <p className="text-sm text-green-500 pt-2 text-center">{submitMessage}</p>
        )}
      </div>

      {/* Feed 2: The Panel (Live Shadcn Table) */}
      <div className="pt-4">
        <h4 className="text-sm font-semibold text-slate-300">2. See Panel Update (Live)</h4>
        <div className="mt-2 border border-slate-700 rounded-lg">
          {tableContent}
        </div>
      </div>
    </div>
  );
}