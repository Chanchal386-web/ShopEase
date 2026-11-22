
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { ObjectId } from "mongodb";
import clientPromise from "../../../../lib/mongodb";

// Verify customer login session
async function getUserId(request) {
  try {
    const token = request.cookies.get("user_session")?.value;

    if (!token) return null;

    const [payload, signature] = token.split(".");

    if (!payload || !signature) return null;

    const secret = process.env.JWT_SECRET;

    if (!secret) return null;

    const expectedSignature = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length) {
      return null;
    }

    if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return null;
    }

    const decodedPayload = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (
      decodedPayload.role !== "user" ||
      !decodedPayload.userId ||
      !decodedPayload.exp ||
      decodedPayload.exp < Date.now() ||
      !ObjectId.isValid(decodedPayload.userId)
    ) {
      return null;
    }

    return decodedPayload.userId;
  } catch {
    return null;
  }
}

// GET customer profile
export async function GET(request) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please login first" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("shopease");

    const user = await db.collection("users").findOne(
      {
        _id: new ObjectId(userId),
        role: "user",
      },
      {
        projection: { password: 0 },
      }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Profile GET Error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// PATCH update customer name and email
export async function PATCH(request) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please login first" },
        { status: 401 }
      );
    }

    const { name, email } = await request.json();

    // Name validation
    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 50
    ) {
      return NextResponse.json(
        { success: false, message: "Name must be 2 to 50 characters" },
        { status: 400 }
      );
    }

    // Email validation
    if (typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Valid email is required" },
        { status: 400 }
      );
    }

    const updatedName = name.trim();
    const updatedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(updatedEmail)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("shopease");

    // Check whether email is already used by another user
    const existingUser = await db.collection("users").findOne({
      email: updatedEmail,
      _id: { $ne: new ObjectId(userId) },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    // Update customer profile
    const result = await db.collection("users").updateOne(
      {
        _id: new ObjectId(userId),
        role: "user",
      },
      {
        $set: {
          name: updatedName,
          email: updatedEmail,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: updatedName,
        email: updatedEmail,
      },
    });
  } catch (error) {
    console.error("Profile PATCH Error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}





