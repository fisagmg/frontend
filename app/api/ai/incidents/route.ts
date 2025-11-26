// app/api/ai/incidents/route.ts
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_LAMBDA_ANALYSIS_URL;

if (!BASE_URL) {
  console.warn(
    "[AI_INCIDENTS_LIST] NEXT_PUBLIC_LAMBDA_ANALYSIS_URL env is not set"
  );
}

export async function GET(req: NextRequest) {
  try {
    if (!BASE_URL) {
      return NextResponse.json(
        { status: "error", message: "Lambda base URL not configured" },
        { status: 500 }
      );
    }

    // 쿼리 파라미터 추출
    const searchParams = req.nextUrl.searchParams;
    const limit = searchParams.get("limit") || "100";

    const res = await fetch(`${BASE_URL}/incidents?limit=${limit}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[AI_INCIDENTS_LIST] Lambda error:", res.status, text);
      return NextResponse.json(
        { status: "error", message: "Failed to fetch incidents from Lambda" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[AI_INCIDENTS_LIST] Route error:", err);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
