// app/api/ai/incidents/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.LAMBDA_ANALYSIS_URL;

if (!BASE_URL) {
  console.warn("[AI_INCIDENT_DETAIL] LAMBDA_ANALYSIS_URL env is not set");
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log("[AI_INCIDENT_DETAIL] BASE_URL:", BASE_URL);

    if (!BASE_URL) {
      return NextResponse.json(
        { status: "error", message: "Lambda base URL not configured" },
        { status: 500 }
      );
    }

    const { id } = await context.params;

    console.log(
      `[AI_INCIDENT_DETAIL] Fetching from: ${BASE_URL}/incidents/${id}`
    );

    const res = await fetch(`${BASE_URL}/incidents/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log("[AI_INCIDENT_DETAIL] Response status:", res.status);

    if (res.status === 404) {
      return NextResponse.json(
        { status: "error", message: "Incident not found" },
        { status: 404 }
      );
    }

    if (!res.ok) {
      const text = await res.text();
      console.error("[AI_INCIDENT_DETAIL] Lambda error:", res.status, text);
      return NextResponse.json(
        {
          status: "error",
          message: `Failed to fetch incident from Lambda: ${res.status}`,
          detail: text,
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[AI_INCIDENT_DETAIL] Route error:", err);
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
