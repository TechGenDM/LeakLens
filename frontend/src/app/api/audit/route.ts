import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://leaklens-api-akh1.onrender.com"
).replace(/\/+$/, "");

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const targetUrl = `${BACKEND_URL}/api/audit${url.search}`;

    const contentType = req.headers.get("content-type") || "";
    const headers: Record<string, string> = {};
    if (contentType) {
      headers["content-type"] = contentType;
    }

    const body = await req.arrayBuffer();

    const backendRes = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: body.byteLength > 0 ? body : undefined,
    });

    const resContentType = backendRes.headers.get("content-type") || "application/json";
    const resData = await backendRes.text();

    return new NextResponse(resData, {
      status: backendRes.status,
      headers: {
        "content-type": resContentType,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Proxy to backend failed", details: String(err?.message || err) },
      { status: 502 }
    );
  }
}
