import { NextResponse } from "next/server";
import {
  ApiContractError,
  isRecord,
  normalizeDashboard,
  normalizeOffboarding,
} from "@/lib/iam-hr";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TIMEOUT_MS = 55_000;
const UNCERTAIN_RESULT =
  "The request could not be confirmed. Refresh the operation status before retrying; processing may still be running.";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function upstream(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(process.env.N8N_WEBHOOK_KEY
          ? { "X-N8N-Webhook-Secret": process.env.N8N_WEBHOOK_KEY }
          : {}),
      },
    });
    // Keep the timeout active while reading the body, not just the headers.
    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
      if (!isRecord(data) && !Array.isArray(data)) throw new ApiContractError();
    } catch {
      return {
        status: response.status >= 400 ? response.status : 502,
        data: {
          success: false,
          code: "UPSTREAM_INVALID_RESPONSE",
          error: `Automation service returned an invalid response (HTTP ${response.status}). ${UNCERTAIN_RESULT}`,
        },
      };
    }
    return { status: response.status, data };
  } finally {
    clearTimeout(timer);
  }
}

function fail(error: unknown) {
  const timeout = error instanceof Error && error.name === "AbortError";
  const invalid = error instanceof ApiContractError;
  return json(
    {
      success: false,
      code: timeout
        ? "OPERATION_TIMEOUT"
        : invalid
          ? "UPSTREAM_INVALID_RESPONSE"
          : "UPSTREAM_UNAVAILABLE",
      error: UNCERTAIN_RESULT,
    },
    timeout ? 504 : 502,
  );
}

export async function GET() {
  const url = process.env.N8N_GET_DATA_URL;
  if (!url)
    return json({ error: "Dashboard endpoint is not configured." }, 500);
  try {
    const result = await upstream(url, { method: "GET" });
    if (result.status >= 400) return json(result.data, result.status);
    return json(normalizeDashboard(result.data));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  const type = new URL(request.url).searchParams.get("type");
  if (type !== "offboard" && type !== "report")
    return json({ error: "Invalid action." }, 400);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }
  if (!isRecord(body)) return json({ error: "Invalid request." }, 400);

  const email = type === "offboard" ? body.target_email : body.visitor_email;
  if (
    typeof email !== "string" ||
    email.trim().length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return json({ error: "Provide a valid email address." }, 400);
  }
  const operationId =
    body.operation_id == null ? null : String(body.operation_id);
  if (
    type === "offboard" &&
    operationId !== null &&
    !/^[1-9][0-9]{0,17}$/.test(operationId)
  ) {
    return json({ error: "Invalid operation_id." }, 400);
  }
  if (
    type === "report" &&
    (typeof body.target_employee !== "string" || !body.target_employee.trim())
  ) {
    return json({ error: "Provide a target employee." }, 400);
  }

  const url =
    type === "offboard"
      ? process.env.N8N_OFFBOARD_URL
      : process.env.N8N_REPORT_URL;
  if (!url) return json({ error: "Action endpoint is not configured." }, 500);
  const targetEmail = email.trim().toLowerCase();
  const payload =
    type === "offboard"
      ? { target_email: targetEmail, operation_id: operationId }
      : { target_employee: body.target_employee, visitor_email: email.trim() };

  try {
    const result = await upstream(url, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (result.status >= 400) return json(result.data, result.status);
    if (!isRecord(result.data)) throw new ApiContractError();
    if (type === "offboard") {
      const dashboard = normalizeOffboarding(result.data, targetEmail);
      return json({ ...result.data, dashboard }, result.status);
    }
    // The published handover still needs validation. Never infer delivery from HTTP 200.
    if (typeof result.data.success !== "boolean") throw new ApiContractError();
    return json(result.data, result.status);
  } catch (error) {
    return fail(error);
  }
}
