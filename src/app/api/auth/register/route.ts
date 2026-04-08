import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "../../../../models/user";
import bcrypt from "bcryptjs"; // Import bcrypt

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // 1. Basic validation
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // 2. Connect to DB
    await connectToDatabase();

    // 3. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already registered" }, { status: 400 });
    }

    // 4. Hash the password
    // The "12" is the saltRounds (cost factor). Higher is more secure but slower.
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Create User with the Hashed Password
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword 
    });
    
    await newUser.save();

    return NextResponse.json(
      { 
        message: "Registration successful!", 
        user: { name: newUser.name, email: newUser.email } 
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}