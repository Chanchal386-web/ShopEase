
import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual, randomBytes } from "crypto";
import clientPromise from "../../../../lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("shopease");

    const resetRecord = await db.collection("password_resets").findOne({
      email: normalizedEmail,
    });

    if (!resetRecord) {
      return NextResponse.json(
        { message: "OTP not found. Request a new OTP." },
        { status: 400 }
      );
    }

    if (resetRecord.expiresAt < new Date()) {
      await db.collection("password_resets").deleteOne({
        _id: resetRecord._id,
      });

      return NextResponse.json(
        { message: "OTP expired. Request a new OTP." },
        { status: 400 }
      );
    }

    const hashedOTP = createHash("sha256")
      .update(otp)
      .digest("hex");

    const savedHash = Buffer.from(resetRecord.otp, "hex");
    const enteredHash = Buffer.from(hashedOTP, "hex");

    if (
      savedHash.length !== enteredHash.length ||
      !timingSafeEqual(savedHash, enteredHash)
    ) {
      return NextResponse.json(
        { message: "Incorrect OTP" },
        { status: 400 }
      );
    }

    const resetToken = randomBytes(32).toString("hex");

    const resetTokenHash = createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await db.collection("password_resets").updateOne(
      { _id: resetRecord._id },
      {
        $set: {
          verified: true,
          resetTokenHash,
          verifiedAt: new Date(),
          resetExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      }
    );

    const response = NextResponse.json({
      message: "OTP verified successfully!",
    });

    response.cookies.set("password_reset_token", resetToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 10 * 60,
    });

    return response;

  } catch (error) {
    console.error("Verify OTP Error:", error);

    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 }
    );
  }
}

