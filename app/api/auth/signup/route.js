import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectToDB } from "@utils/database";
import User from "@models/user";

export async function POST(request) {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      image: `https://ui-avatars.com/api/?name=${username}&background=random`,
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: { email: user.email, username: user.username },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
