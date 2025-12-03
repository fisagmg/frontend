// app/api/ai/incidents/route.ts
import { NextRequest, NextResponse } from "next/server";

// ✅ 서버 사이드 환경변수 (런타임에 K8s에서 주입됨)
const BASE_URL = process.env.LAMBDA_ANALYSIS_URL;

if (!BASE_URL) {
  console.warn("[AI_INCIDENTS_LIST] LAMBDA_ANALYSIS_URL env is not set");
}

export async function GET(req: NextRequest) {
  try {
    console.log("[AI_INCIDENTS_LIST] BASE_URL:", BASE_URL);

    if (!BASE_URL) {
      return NextResponse.json(
        { status: "error", message: "Lambda base URL not configured" },
        { status: 500 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const limit = searchParams.get("limit") || "100";

    console.log(
      `[AI_INCIDENTS_LIST] Fetching from: ${BASE_URL}/incidents?limit=${limit}`
    );

    const res = await fetch(`${BASE_URL}/incidents?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log("[AI_INCIDENTS_LIST] Response status:", res.status);

    if (!res.ok) {
      const text = await res.text();
      console.error("[AI_INCIDENTS_LIST] Lambda error:", res.status, text);
      return NextResponse.json(
        {
          status: "error",
          message: `Failed to fetch incidents from Lambda: ${res.status}`,
          detail: text,
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log(
      `[AI_INCIDENTS_LIST] Successfully fetched ${data.length} incidents`
    );
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[AI_INCIDENTS_LIST] Route error:", err);
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error",
        detail: err.message,
      },
      { status: 500 }
    );
  }
}
