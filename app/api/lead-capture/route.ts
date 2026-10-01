import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Timeout de 30s para garantir que a IA tenha tempo de responder
const TIMEOUT_MS = 30000;

async function fetchWithTimeout(resource: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function POST(request: Request) {
  // Pega a URL do N8N do arquivo .env.local
  const n8nUrl = process.env.N8N_LEAD_CAPTURE_URL;

  if (!n8nUrl) {
    console.error("Missing N8N_LEAD_CAPTURE_URL");
    return NextResponse.json({ error: "Server Config Error" }, { status: 500 });
  }

  try {
    const body = await request.json();

    // Envia para o N8N
    const res = await fetchWithTimeout(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`N8N Error ${res.status}: ${text}`);
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error: unknown) {
    const message = error instanceof Error
      ? error.message
      : "Unexpected lead capture error";
    console.error("[Lead Capture Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
