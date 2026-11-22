
import { NextResponse } from "next/server";
import { createHmac } from "crypto";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const secret = process.env.JWT_SECRET;

    if (!adminEmail || !adminPassword || !secret) {
      return NextResponse.json(
        { success: false, message: "Server configuration missing" },
        { status: 500 }
      );
    }

    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const payload = Buffer.from(
      JSON.stringify({
        email,
        exp: Date.now() + 8 * 60 * 60 * 1000,
      })
    ).toString("base64url");

    const signature = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const response = NextResponse.json({
      success: true,
      message: "Admin login successful!",
    });

    response.cookies.set("admin_session", `${payload}.${signature}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}


