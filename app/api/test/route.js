import { connectToDB } from "../../../utils/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDB();

    return NextResponse.json({
      message: "MongoDB connection successful! ObjectId error resolved.",
      status: "success",
    });
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json(
      {
        message: "Connection failed",
        error: error.message,
        status: "error",
      },
      { status: 500 }
    );
  }
}
