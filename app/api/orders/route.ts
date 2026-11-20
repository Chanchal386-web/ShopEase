
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/mongodb";

// Customer session verification
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

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const user = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    );

    if (
      user.role !== "user" ||
      !user.userId ||
      !ObjectId.isValid(user.userId) ||
      !user.exp ||
      user.exp < Date.now()
    ) {
      return null;
    }

    return user.userId;
  } catch {
    return null;
  }
}

// Admin session verification
async function isAdmin(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_session")?.value;

    if (!token) return false;

    const [payload, signature] = token.split(".");

    if (!payload || !signature) return false;

    const secret = process.env.JWT_SECRET;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!secret || !adminEmail) return false;

    const expectedSignature = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return false;
    }

    const admin = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    );

    if (
      admin.email !== adminEmail ||
      !admin.exp ||
      admin.exp < Date.now()
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// GET: Fetch all orders (Admin only)
export async function GET(request: NextRequest) {
  try {
    const adminVerified = await isAdmin(request);

    if (!adminVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Admin login required.",
        },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("shopease");

    const orders = await db
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formattedOrders = orders.map((order) => ({
      ...order,
      _id: order._id.toString(),
      userId: order.userId?.toString(),
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Fetch Orders Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders.",
      },
      { status: 500 }
    );
  }
}

// POST: Create customer order
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or empty request body.",
        },
        { status: 400 }
      );
    }

    const { name, email, mobile, address, items } = body;

    // Name validation
    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 50
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Name must be 2-50 characters.",
        },
        { status: 400 }
      );
    }

    // Email validation
    const cleanEmail =
      typeof email === "string"
        ? email.trim().toLowerCase()
        : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // Mobile validation
    if (
      typeof mobile !== "string" ||
      !/^[6-9]\d{9}$/.test(mobile.trim())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid 10-digit mobile number.",
        },
        { status: 400 }
      );
    }

    // Address validation
    if (
      typeof address !== "string" ||
      address.trim().length < 10 ||
      address.trim().length > 300
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Address must be 10-300 characters.",
        },
        { status: 400 }
      );
    }

    // Items validation
    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 50
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order items.",
        },
        { status: 400 }
      );
    }

    const cleanItems: {
      id: number;
      name: string;
      price: number;
      quantity: number;
    }[] = [];

    for (const item of items) {
      if (
        !item ||
        typeof item !== "object" ||
        Array.isArray(item) ||
        !Number.isSafeInteger(item.id) ||
        typeof item.name !== "string" ||
        !item.name.trim() ||
        !Number.isSafeInteger(item.price) ||
        item.price <= 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid product details.",
          },
          { status: 400 }
        );
      }

      cleanItems.push({
        id: item.id,
        name: item.name.trim(),
        price: item.price,
        quantity: item.quantity,
      });
    }

    // Calculate total on server
    const totalAmount = cleanItems.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );

    if (
      !Number.isSafeInteger(totalAmount) ||
      totalAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order amount.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("shopease");

    const result = await db.collection("orders").insertOne({
      userId: new ObjectId(userId),
      name: name.trim(),
      email: cleanEmail,
      mobile: mobile.trim(),
      address: address.trim(),
      items: cleanItems,
      totalAmount,
      status: "Placed",
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully.",
        orderId: result.insertedId.toString(),
        totalAmount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Order Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to place order.",
      },
      { status: 500 }
    );
  }
}

// PATCH: Update order status (Admin only)
export async function PATCH(request: NextRequest) {
  try {
    // Admin authentication
    const adminVerified = await isAdmin(request);

    if (!adminVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Admin login required.",
        },
        { status: 401 }
      );
    }

    // Read request body
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const { orderId, status } = body;

    // Validate order ID
    if (
      typeof orderId !== "string" ||
      !ObjectId.isValid(orderId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID.",
        },
        { status: 400 }
      );
    }

    // Allowed statuses
    const allowedStatuses = [
      "Placed",
      "Shipped",
      "Delivered",
    ];

    if (
      typeof status !== "string" ||
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order status.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("shopease");

    // Update only non-final orders
    const result = await db.collection("orders").updateOne(
      {
        _id: new ObjectId(orderId),
        status: {
          $nin: ["Cancelled", "Delivered"],
        },
      },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      const existingOrder = await db
        .collection("orders")
        .findOne(
          { _id: new ObjectId(orderId) },
          { projection: { status: 1 } }
        );

      if (!existingOrder) {
        return NextResponse.json(
          {
            success: false,
            message: "Order not found.",
          },
          { status: 404 }
        );
      }

      if (
        existingOrder.status === "Cancelled" ||
        existingOrder.status === "Delivered"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `This order is already ${existingOrder.status} and cannot be changed.`,
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Order status could not be updated.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully!",
    });
  } catch (error) {
    console.error("Update Order Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update order status.",
      },
      { status: 500 }
    );
  }
}











