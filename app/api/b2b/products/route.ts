import { NextRequest, NextResponse } from "next/server";
import { getOdooProducts } from "@/lib/odoo/client";

export async function GET(request: NextRequest) {
  try {
    const limit = Number(
      request.nextUrl.searchParams.get("limit") ?? 20
    );

    const offset = Number(
      request.nextUrl.searchParams.get("offset") ?? 0
    );

    const sessionId = request.cookies.get(
      "odoo_session_id"
    )?.value;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const data = await getOdooProducts({
      limit,
      offset,
      sessionId,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("B2B products API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}