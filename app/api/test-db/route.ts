
import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;

    await client.db("shopease").command({
      ping: 1,
    });

    return NextResponse.json({
      success: true,
      message: "MongoDB Connected Successfully!",
    });
  } catch (error) {
    console.error("MongoDB Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "MongoDB Connection Failed",
      },
      { status: 500 }
    );
  }
}
