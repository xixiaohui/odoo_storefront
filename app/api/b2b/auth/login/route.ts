import { NextResponse } from "next/server";

const ODOO_URL = process.env.ODOO_URL;

export async function POST(request: Request) {
  try {
    if (!ODOO_URL) {
      return NextResponse.json(
        {
          success: false,
          error: "ODOO_URL is not configured",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    console.log("Calling Odoo:", `${ODOO_URL}/web/session/authenticate`);

    const response = await fetch(
      `${ODOO_URL}/web/session/authenticate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params: {
            db: body.db,
            login: body.login,
            password: body.password,
          },
          id: 1,
        }),
        cache: "no-store",
      }
    );

    const data = await response.json();

    console.log("Odoo response:", data);

    if (data.error) {
      return NextResponse.json(
        {
          success: false,
          error:
            data.error?.data?.message ||
            data.error?.message ||
            "Odoo login failed",
        },
        { status: 401 }
      );
    }

    if (!data.result?.uid) {
      return NextResponse.json(
        {
          success: false,
          error: "Odoo login failed: uid not found",
        },
        { status: 401 }
      );
    }

    // 获取 Odoo session_id
    const setCookie = response.headers.get("set-cookie");

    console.log("Odoo Set-Cookie:", setCookie);

    if (!setCookie) {
      return NextResponse.json(
        {
          success: false,
          error: "Odoo session_id not found",
        },
        { status: 401 }
      );
    }

    const match = setCookie.match(/session_id=([^;]+)/);

    if (!match) {
      return NextResponse.json(
        {
          success: false,
          error: "session_id not found in Odoo cookie",
        },
        { status: 401 }
      );
    }

    const sessionId = match[1];

    const result = NextResponse.json({
      success: true,
      user: {
        uid: data.result.uid,
        name: data.result.name,
        username: data.result.username,
        partner_id: data.result.partner_id,
      },
    });

    result.cookies.set("odoo_session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return result;
  } catch (error) {
    console.error("Odoo login error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}