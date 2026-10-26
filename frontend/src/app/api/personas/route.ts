import { NextResponse } from "next/server";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://leaklens-api-akh1.onrender.com"
).replace(/\/+$/, "");

export async function GET() {
  try {
    const targetUrl = `${BACKEND_URL}/api/personas`;
    const backendRes = await fetch(targetUrl, { cache: "no-store" });
    const data = await backendRes.text();
    return new NextResponse(data, {
      status: backendRes.status,
      headers: {
        "content-type": backendRes.headers.get("content-type") || "application/json",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to proxy personas", details: String(err?.message || err) },
      { status: 502 }
    );
  }
}
