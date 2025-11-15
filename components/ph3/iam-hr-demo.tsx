// --- SRE Note (Turn 189): P0.6 (Hotfix) ---
// This code REPLACES Turn 183.
// FIX: The data structure from the native n8n 'Get Rows' node (Turn 173)
// is an ARRAY: [ { Email, FullName, ... } ]
// The previous code (Turn 183) expected an OBJECT: { values: [...] }.
// This fix reads the data as a direct array, resolving the '.slice' crash.

"use client"; // CRITICAL: This component is interactive.

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
import useSWR, { mutate } from "swr"; // SRE: Imports SWR hooks
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
  // SRE FIX: The 'data' variable will be the ARRAY: [ { ... }, { ... } ]
  const { data: employeesData, error, isLoading: isTableLoading } = useSWR<Employee[]>(
    N8N_GET_DATA_URL, 
    fetcher,
    { refreshInterval: 30000 }
  );

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

      setSubmitMessage("Success! Request logged. Refreshing panel...");

      // --- SRE "CHECKMATE" (THE "AHA! MOMENT") ---
      mutate(N8N_GET_DATA_URL); // Force SWR (the table) to re-fetch data

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
  } else if (employeesData) { // SRE FIX: Check 'employeesData' (the array)
    
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
          {/* SRE FIX: Map 'employeesData' (the array) directly */}
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
              {/* SRE FIX: Read 'employeesData' (the array) and filter it */}
              {employeesData &&
                employeesData
                  .filter((emp) => emp.Status === "ACTIVE")
                  .map((emp) => (
                    // SRE FIX: Use emp.Email and emp.FullName
                    <SelectItem key={emp.Email} value={emp.Email}>
                      {emp.FullName} ({emp.Email})
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
          {tableContent} {/* SRE: This will now render correctly */}
        </div>
      </div>
    </div>
  );
}