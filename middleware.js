
import { NextResponse } from "next/server";

export async function middleware(request) {
  const token = request.cookies.get("admin_session")?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const [payload, signature] = token.split(".");

    if (!payload || !signature) {
      throw new Error("Invalid token");
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const base64 = signature
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      "="
    );

    const signatureBytes = Uint8Array.from(
      atob(padded),
      (char) => char.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      new TextEncoder().encode(payload)
    );

    if (!valid) {
      throw new Error("Invalid signature");
    }

    const payloadBase64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payloadPadded = payloadBase64.padEnd(
      Math.ceil(payloadBase64.length / 4) * 4,
      "="
    );

    const session = JSON.parse(atob(payloadPadded));

    if (!session.email || !session.exp || Date.now() > session.exp) {
      throw new Error("Session expired");
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(
      new URL("/login", request.url)
    );

    response.cookies.delete("admin_session");

    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};

