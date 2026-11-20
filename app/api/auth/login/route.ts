
import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("shopease");

    const user = await db.collection("users").findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user || user.role !== "user") {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return NextResponse.json(
        { success: false, message: "Server configuration missing" },
        { status: 500 }
      );
    }

    const payload = Buffer.from(
      JSON.stringify({
        userId: user._id.toString(),
        email: user.email,
        role: "user",
        exp: Date.now() + 8 * 60 * 60 * 1000,
      })
    ).toString("base64url");

    const signature = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const response = NextResponse.json({
      success: true,
      message: "User login successful!",
    });

    response.cookies.set("user_session", `${payload}.${signature}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("User Login Error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
