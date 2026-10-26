import { AuditResponse, PersonaMetadata, ActionDraftRequest, ActionDraftResponse } from "@/types/audit";

/**
 * Resolve the API base URL.
 * - In the browser: use "" (empty string) so fetch hits /api/* on the same origin,
 *   which Next.js rewrites proxy to the real backend (bypasses CORS entirely).
 * - During SSR / Node: use the full backend URL so server-side fetches reach the API.
 */
function getApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  // Strip trailing slash to prevent double-slash in URLs
  const cleaned = envUrl.replace(/\/+$/, "");

  if (typeof window !== "undefined") {
    // Client-side: always use relative paths through Next.js rewrite proxy
    return "";
  }
  // Server-side (SSR): use the explicit backend URL
  return cleaned || "https://leaklens-api-akh1.onrender.com";
}

const API_BASE_URL = getApiBase();

export async function fetchPersonas(): Promise<PersonaMetadata[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/personas`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load personas");
    const data = await res.json();
    return data.personas;
  } catch (err) {
    console.error("Error fetching personas:", err);
    return [];
  }
}

export async function runAuditByPersona(personaId: string): Promise<AuditResponse> {
  const res = await fetch(`${API_BASE_URL}/api/audit?persona_id=${encodeURIComponent(personaId)}`, {
    method: "POST",
    cache: "no-store",
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Audit failed (${res.status}): ${errorBody}`);
  }
  return res.json();
}

export async function runAuditByFile(file: File): Promise<AuditResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/audit`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Audit upload failed (${res.status}): ${errorBody}`);
  }
  return res.json();
}

export async function draftAction(payload: ActionDraftRequest): Promise<ActionDraftResponse> {
  const res = await fetch(`${API_BASE_URL}/api/draft-action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Action drafting failed (${res.status}): ${errorBody}`);
  }
  return res.json();
}
