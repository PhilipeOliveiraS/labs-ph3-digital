// --- SRE Note (Turn 191): P0.7 (FINAL FIX) ---
// This code REPLACES Turn 189.
// FIX (Turn 190): The 'n8n' Webhook node (Turn 172) does NOT return a raw Array.
// It returns an OBJECT (like { "values": [...] } or { "data": [...] }).
// The 't.map is not a function' error (Turn 190) proves 'data' is an OBJECT.
//
// This fix updates the 'fetcher' (Turn 189) to correctly PARSE the n8n object
// and extract the array (the "values") *before* SWR uses it.

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

// --- SRE: Define the data structure (Defensive Engineering) ---
// This is the structure of the *clean* array *after* we extract it.
interface Employee {
  FullName: string;
  Email: string;
  Status: string;
  AccessGroups: string;
}

// --- SRE "CHECKMATE" (THE "HOTFIX" v2) ---
// The data from n8n (Turn 172) is an OBJECT (like { values: [ ... ] }).
// We teach the 'fetcher' to "unwrap" the array.
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch data from n8n.");
  }
  
  const n8nResponse = await res.json();
  
  // SRE FIX (Turn 191): Check if the data is the 'values' property
  // (This matches the output of the Google Sheets node IF it was the LAST node)
  if (n8nResponse.values && Array.isArray(n8nResponse.values)) {
    return n8nResponse.values; // RETURN THE ARRAY
  }
  
  // SRE FIX: Fallback if n8n wrapped it differently (e.g., in 'data')
  if (n8nResponse.data && Array.isArray(n8nResponse.data)) {
    return n8nResponse.data; // RETURN THE ARRAY
  }

  // SRE FIX: Fallback if n8n returned a *raw* array (Turn 189 assumption)
  if (Array.isArray(n8nResponse)) {
     return n8nResponse; // RETURN THE ARRAY
  }

  // If we reach here, the data structure is unknown.
  throw new Error("Unknown data structure received from n8n API.");
};


export function IamHrDemo() {
  // --- SRE: SWR Data Fetching Hook ---
  // SRE FIX: We now expect 'data' (aliased to 'employeeRows') to be the *clean array*.
  const { data: employeeRows, error, isLoading: isTableLoading } = useSWR<string[][]>(
    N8N_GET_DATA_URL, 
    fetcher,
    { refreshInterval: 30000 }
  );

  // --- State for the Form ---
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleSubmit = async () => {
    // ... (O código handleSubmit (Turn 189) está 100% CORRETO e não muda) ...
    if (!selectedEmployee) {
      setSubmitMessage("Please select an employee to offboard.");
      return;
    }
    setIsSubmitting(true);
    setSubmitMessage("");
    try {
      const response = await fetch(N8N_POST_ACTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "Select Employee to Offboard": selectedEmployee,
        }),
      });
      if (!response.ok) throw new Error("Webhook failed");
      setSubmitMessage("Success! Request logged. Refreshing panel...");
      mutate(N8N_GET_DATA_URL);
    } catch (error) {
      setSubmitMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
      setSelectedEmployee("");
    }
  };

  // --- SRE: Handle Table Loading/Error States ---
  let tableContent;
  if (isTableLoading) {
    tableContent = <p className="text-slate-400 italic">Loading Live Panel...</p>;
  } else if (error) {
    // SRE: Display the *actual* error message for debugging
    tableContent = <p className="text-red-500">Error: {error.message}</p>;
  } else if (employeeRows) { // SRE FIX: Check 'employeeRows' (the array)
    
    // SRE: Skip the header row (A1, B1, C1...) from Google Sheets
    const employeesData: Employee[] = employeeRows.slice(1).map((row: string[]) => ({
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
              {/* SRE FIX: Read 'employeeRows' (the array) and filter it */}
              {employeeRows &&
                employeeRows.slice(1) // Skip header row
                  .filter((row: string[]) => row[2] === "ACTIVE")
                  .map((row: string[]) => (
                    // SRE FIX: Use array indices
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
          {tableContent} {/* SRE: This will now render correctly */}
        </div>
      </div>
    </div>
  );
}