import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db"; // Ensure this matches your DB connection path
import User from "@/models/user";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { name, email, password, companyName, companyWebsite, phone } = body;

    // 1. Basic Field Validation
    if (!name || !email || !password || !companyName || !phone) {
      return NextResponse.json(
        { success: false, error: "Please provide all required fields." },
        { status: 400 }
      );
    }

    // Email Format Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Password Length Check
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // 2. Check If User Already Exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists." },
        { status: 400 }
      );
    }

    // 3. Create New Employer Account
    // (Note: The pre-save hook in User.ts will automatically hash the password)
    const newEmployer = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "employer",
      companyName: companyName.trim(),
      companyWebsite: companyWebsite ? companyWebsite.trim() : "",
      phone: phone.trim(),
      provider: "credentials",
      isApproved: true,
    });

    // Remove password from response payload
    const employerData = {
      _id: newEmployer._id,
      name: newEmployer.name,
      email: newEmployer.email,
      role: newEmployer.role,
      companyName: newEmployer.companyName,
      companyWebsite: newEmployer.companyWebsite,
      phone: newEmployer.phone,
      isApproved: newEmployer.isApproved,
      createdAt: newEmployer.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Employer registered successfully.",
        user: employerData,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("EMPLOYER_REGISTER_ERROR:", error.message);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
