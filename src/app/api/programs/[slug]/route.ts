import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Program from "@/models/Program";

// Enable Vercel Edge caching rules
export const revalidate = 3600;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // 1. Await database connection promise concurrently with params resolution
    const [_, { slug }] = await Promise.all([
      connectToDatabase(),
      params,
    ]);

    const { searchParams } = new URL(req.url);
    const duration = searchParams.get("duration");
    const decodedSlug = decodeURIComponent(slug).trim();

    // 2. Build Exact Equality Query (avoids slow unindexed regex scans)
    const query: Record<string, any> = { slug: decodedSlug };

    if (duration) {
      const formattedDuration = duration.replace(/-/g, " ").trim();
      // Use exact match or case-insensitive collation instead of regex full scans
      query.duration = formattedDuration;
    }

    // 3. Lean projection with selected fields only
    let program = await Program.findOne(query)
      .collation({ locale: "en", strength: 2 }) // Case-insensitive exact match without regex penalty
      .select("-__v")
      .lean();

    // Fallback: If duration exact match failed, match by slug only
    if (!program && duration) {
      program = await Program.findOne({ slug: decodedSlug })
        .select("-__v")
        .lean();
    }

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(program, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
        "CDN-Cache-Control": "public, s-maxage=3600",
        "Vercel-CDN-Cache-Control": "public, s-maxage=3600",
      },
    });
  } catch (error: any) {
    console.error("Fetch Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug).trim();

    const deleted = await Program.findOneAndDelete({ slug: decodedSlug });

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}