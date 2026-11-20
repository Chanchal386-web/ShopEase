
import { NextRequest, NextResponse } from "next/server";
import { randomInt, createHash } from "crypto";
import clientPromise from "../../../../lib/mongodb";
import transporter from "../../../../lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const client = await clientPromise;
    const db = client.db("shopease");

    const user = await db.collection("users").findOne({
      email: normalizedEmail,
      role: "user",
    });

    // Same response whether the account exists or not
    if (!user) {
      return NextResponse.json({
        message: "If the account exists, an OTP will be sent.",
      });
    }

    // Generate a 6-digit OTP
    const otp = randomInt(100000, 1000000).toString();

    // Store only the hashed OTP
    const hashedOTP = createHash("sha256")
      .update(otp)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.collection("password_resets").deleteMany({
      email: normalizedEmail,
    });

    await db.collection("password_resets").insertOne({
      email: normalizedEmail,
      otp: hashedOTP,
      expiresAt,
      createdAt: new Date(),
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: "ShopEase Password Reset OTP",
        text: `Your ShopEase password reset OTP is ${otp}. It is valid for 5 minutes. Do not share this OTP with anyone.`,
      });
    } catch (emailError) {
      await db.collection("password_resets").deleteMany({
        email: normalizedEmail,
      });
      throw emailError;
    }

    return NextResponse.json({
      message: "If the account exists, an OTP will be sent.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    return NextResponse.json(
      { message: "Unable to process request. Please try again." },
      { status: 500 }
    );
  }
}
