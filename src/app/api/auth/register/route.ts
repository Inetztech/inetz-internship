import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/user"; // Fixed path to match your layout standard

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // 1. Basic validation
    if (!name?.trim() || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required fields." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // 2. Connect to DB
    await connectToDatabase();

    // 3. Check if user exists (using case-insensitive lowercase matching)
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email is already registered." }, 
        { status: 400 }
      );
    }

    // The User model hashes the password once in its pre-save hook.
    const newUser = await User.create({ 
      name: name.trim(),
      email: normalizedEmail, 
      password,
      role: "student", // Matches standard fallback roles expected by UI layouts
      provider: "credentials", // Tagged to separate from Google sign-ups safely
    });

    return NextResponse.json(
      { 
        message: "Registration successful!", 
        user: { name: newUser.name, email: newUser.email } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("STUDENT_REGISTER_ERROR:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
