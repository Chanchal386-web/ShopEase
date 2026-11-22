
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export async function GET(request) {
  try {
    const token = request.cookies.get("user_session")?.value;
    const secret = process.env.JWT_SECRET;

    if (!token || !secret) {
      return NextResponse.json(
        { success: false, message: "User not logged in" },
        { status: 401 }
      );
    }

    const parts = token.split(".");

    if (parts.length !== 2) {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    const [payload, signature] = parts;

    const expectedSignature = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const receivedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    const user = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (
      user.role !== "user" ||
      !user.userId ||
      !user.exp ||
      user.exp < Date.now()
    ) {
      return NextResponse.json(
        { success: false, message: "Session expired or invalid" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User is logged in",
      user: {
        userId: user.userId,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Session Verification Error:", error);

    return NextResponse.json(
      { success: false, message: "Session verification failed" },
      { status: 500 }
    );
  }
}

