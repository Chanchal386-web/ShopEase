
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { ObjectId } from "mongodb";
import clientPromise from "../../../../../lib/mongodb";

// Verify customer login session
async function getUserId(request: NextRequest) {
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
  } catch (error) {
    console.error("Session Verification Error:", error);
    return null;
  }
}

// GET: Fetch individual customer order
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please login first." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("shopease");

    const order = await db.collection("orders").findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        _id: order._id.toString(),
        userId: order.userId?.toString() || null,
      },
    });
  } catch (error) {
    console.error("Get Order Details Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch order details." },
      { status: 500 }
    );
  }
}

// PATCH: Cancel customer order
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please login first." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("shopease");

    // Find order belonging to logged-in customer
    const order = await db.collection("orders").findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    // Only Placed orders can be cancelled
    if (order.status !== "Placed") {
      return NextResponse.json(
        {
          success: false,
          message: "Only placed orders can be cancelled.",
        },
        { status: 400 }
      );
    }

    // Update order status safely
    const result = await db.collection("orders").updateOne(
      {
        _id: new ObjectId(id),
        userId: new ObjectId(userId),
        status: "Placed",
      },
      {
        $set: {
          status: "Cancelled",
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Order could not be cancelled.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully.",
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to cancel order." },
      { status: 500 }
    );
  }
}

