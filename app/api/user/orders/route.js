
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { ObjectId } from "mongodb";
import clientPromise from "../../../../lib/mongodb";

// Verify customer login session
async function getUserId(request) {
  try {
    const token = request.cookies.get("user_session")?.value;

    if (!token) return null;

    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payload, signature] = parts;
    const secret = process.env.JWT_SECRET;

    if (!secret) return null;

    const expectedSignature = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const receivedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      return null;
    }

    const user = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (
      user.role !== "user" ||
      !user.userId ||
      !user.exp ||
      user.exp < Date.now() ||
      !ObjectId.isValid(user.userId)
    ) {
      return null;
    }

    return user.userId;
  } catch {
    return null;
  }
}

// GET: Fetch logged-in customer's orders
export async function GET(request) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please login first." },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("shopease");

    const orders = await db
      .collection("orders")
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    const formattedOrders = orders.map((order) => ({
      ...order,
      _id: order._id.toString(),
      userId: order.userId.toString(),
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Customer Orders Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch your orders." },
      { status: 500 }
    );
  }
}

