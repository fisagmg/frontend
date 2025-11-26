// app/api/ai/incidents/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_LAMBDA_ANALYSIS_URL;

if (!BASE_URL) {
  console.warn(
    "[AI_INCIDENT_DETAIL] NEXT_PUBLIC_LAMBDA_ANALYSIS_URL env is not set"
  );
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!BASE_URL) {
      return NextResponse.json(
        { status: "error", message: "Lambda base URL not configured" },
        { status: 500 }
      );
    }

    const { id } = await context.params;

    const res = await fetch(`${BASE_URL}/incidents/${id}`, {
      cache: "no-store",
    });

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
        { status: "error", message: "Failed to fetch incident from Lambda" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[AI_INCIDENT_DETAIL] Route error:", err);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
