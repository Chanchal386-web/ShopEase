
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function PATCH(request) {
  try {
    // 1. Get customer session
    const session = request.cookies.get("user_session")?.value;

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Please login first" },
        { status: 401 }
      );
    }

    // 2. Verify session signature
    const [payload, signature] = session.split(".");
    const secret = process.env.JWT_SECRET;

    if (!payload || !signature || !secret) {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    const expectedSignature = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    // 3. Read customer details from session
    const sessionData = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    );

    if (
      sessionData.role !== "user" ||
      !ObjectId.isValid(sessionData.userId) ||
      sessionData.exp < Date.now()
    ) {
      return NextResponse.json(
        { success: false, message: "Session expired. Please login again." },
        { status: 401 }
      );
    }

    // 4. Get passwords from request
    const { currentPassword, newPassword, confirmPassword } =
      await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: "All password fields are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "New passwords do not match" },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, message: "New password must be different" },
        { status: 400 }
      );
    }

    // 5. Find customer in MongoDB
    const client = await clientPromise;
    const db = client.db("shopease");

    const user = await db.collection("users").findOne({
      _id: new ObjectId(sessionData.userId),
      role: "user",
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 6. Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // 7. Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection("users").updateOne(
      { _id: user._id, role: "user" },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error("Change Password Error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

