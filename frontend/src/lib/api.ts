import { AuditResponse, PersonaMetadata, ActionDraftRequest, ActionDraftResponse } from "@/types/audit";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://leaklens-api-akh1.onrender.com"
).replace(/\/+$/, "");

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_URL}${cleanPath}`;
}

export async function fetchPersonas(): Promise<PersonaMetadata[]> {
  try {
    const res = await fetch(getApiUrl("/api/personas"), { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load personas");
    const data = await res.json();
    return data.personas;
  } catch (err) {
    console.error("Error fetching personas:", err);
    return [];
  }
}

export async function runAuditByPersona(personaId: string): Promise<AuditResponse> {
  const res = await fetch(getApiUrl(`/api/audit?persona_id=${encodeURIComponent(personaId)}`), {
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

  const res = await fetch(getApiUrl("/api/audit"), {
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
  const res = await fetch(getApiUrl("/api/draft-action"), {
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
