// app/api/ai/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.LAMBDA_ANALYSIS_URL;

if (!BASE_URL) {
  console.warn("[AI_ANALYZE] LAMBDA_ANALYSIS_URL env is not set");
}

export async function GET(req: NextRequest) {
  try {
    console.log("[AI_ANALYZE] BASE_URL:", BASE_URL);

    if (!BASE_URL) {
      return NextResponse.json(
        { status: "error", message: "Lambda base URL not configured" },
        { status: 500 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const alarmName = searchParams.get("alarm_name");
    const instanceId = searchParams.get("instance_id");
    const timestamp = searchParams.get("timestamp");

    if (!alarmName || !instanceId || !timestamp) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Missing required parameters: alarm_name, instance_id, timestamp",
        },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      alarm_name: alarmName,
      instance_id: instanceId,
      timestamp: timestamp,
    });

    const url = `${BASE_URL}/?${params.toString()}`;
    console.log(`[AI_ANALYZE] Fetching from: ${url}`);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("[AI_ANALYZE] Response status:", res.status);

    if (!res.ok) {
      const text = await res.text();
      console.error("[AI_ANALYZE] Lambda error:", res.status, text);
      return NextResponse.json(
        {
          status: "error",
          message: `Failed to analyze alarm: ${res.status}`,
          detail: text,
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log("[AI_ANALYZE] Analysis completed successfully");
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[AI_ANALYZE] Route error:", err);
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
