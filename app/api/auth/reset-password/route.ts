
import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import clientPromise from "../../../../lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { newPassword, confirmPassword } = await request.json();

    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      );
    }

    const resetToken = request.cookies.get(
      "password_reset_token"
    )?.value;

    if (!resetToken) {
      return NextResponse.json(
        { message: "Please verify OTP first" },
        { status: 401 }
      );
    }

    const resetTokenHash = createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const client = await clientPromise;
    const db = client.db("shopease");

    const resetRecord = await db.collection("password_resets").findOne({
      resetTokenHash,
      verified: true,
      resetExpiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      const response = NextResponse.json(
        { message: "Reset session expired. Verify OTP again." },
        { status: 401 }
      );

      response.cookies.delete("password_reset_token");
      return response;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await db.collection("users").updateOne(
      {
        email: resetRecord.email,
        role: "user",
      },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    await db.collection("password_resets").deleteOne({
      _id: resetRecord._id,
    });

    const response = NextResponse.json({
      message: "Password reset successfully!",
    });

    response.cookies.delete("password_reset_token");

    return response;

  } catch (error) {
    console.error("Reset Password Error:", error);

    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 }
    );
  }
}
