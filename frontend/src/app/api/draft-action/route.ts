import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://leaklens-api-akh1.onrender.com"
).replace(/\/+$/, "");

export async function POST(req: NextRequest) {
  try {
    const targetUrl = `${BACKEND_URL}/api/draft-action`;
    const body = await req.text();

    const backendRes = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const data = await backendRes.text();
    return new NextResponse(data, {
      status: backendRes.status,
      headers: {
        "content-type": backendRes.headers.get("content-type") || "application/json",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to proxy draft action", details: String(err?.message || err) },
      { status: 502 }
    );
  }
}
