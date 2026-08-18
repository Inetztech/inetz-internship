import { connectToDatabase } from "@/lib/db";
import Program from "@/models/Program";
import { NextResponse } from "next/server";

// Cache on Vercel Edge CDN for 1 hour with background revalidation
export const revalidate = 3600;

// 1. GET: High-speed cached fetch with lean execution & selective projection
export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const full = searchParams.get("full") === "true";

    // Strip heavy syllabus subdocuments for listing cards unless explicitly requested
    const projection = full
      ? "-__v"
      : "title slug subtitle duration price originalPrice heroImg badges isPopular createdAt updatedAt";

    const programs = await Program.find({})
      .select(projection)
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json(programs, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
        "CDN-Cache-Control": "public, s-maxage=3600",
        "Vercel-CDN-Cache-Control": "public, s-maxage=3600",
      },
    });
  } catch (error: any) {
    console.error("Database Fetch Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}

// 2. POST: Saves or updates structured tracks with slug normalization
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    const slug = (body.slug || body.title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const program = await Program.findOneAndUpdate(
      { slug },
      { ...body, slug, updatedAt: new Date() },
      { upsert: true, new: true, runValidators: true, lean: true }
    );

    return NextResponse.json(
      { success: true, data: program },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Database Save Error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save program" },
      { status: 500 }
    );
  }
}

// 3. DELETE: Removes a program by ID or URL Query ID
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();

    let targetId: string | null = null;

    // Handle both JSON body ({ id }) and query parameter (?id=...)
    try {
      const body = await req.json();
      targetId = body.id || body._id;
    } catch {
      const { searchParams } = new URL(req.url);
      targetId = searchParams.get("id");
    }

    if (!targetId) {
      return NextResponse.json(
        { success: false, error: "Program ID is required for deletion" },
        { status: 400 }
      );
    }

    const deleted = await Program.findByIdAndDelete(targetId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Program record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Database Deletion Error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete program" },
      { status: 500 }
    );
  }
}