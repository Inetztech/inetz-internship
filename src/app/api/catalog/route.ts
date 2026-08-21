import { NextResponse } from "next/server";
import Program from "@/models/Program";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    await connectToDatabase();

    // ⚡ Fast Aggregation: Excludes heavy nested arrays; counts modules in DB engine
    const programs = await Program.aggregate([
      {
        $project: {
          _id: 1,
          title: 1,
          subtitle: 1,
          heroImg: 1,
          slug: 1,
          price: 1,
          originalPrice: 1,
          modulesCount: { $size: { $ifNull: ["$syllabus", []] } },
        },
      },
    ]);

    const formattedPrograms = programs.map((p) => {
      let stackKey = "Python";
      const lowerTitle = (p.title || "").toLowerCase();
      if (lowerTitle.includes("mern") || lowerTitle.includes("react")) stackKey = "MERN";
      else if (lowerTitle.includes("java")) stackKey = "Java";

      return {
        _id: p._id,
        stack: stackKey,
        title: p.title,
        image: p.heroImg,
        subtitle: p.subtitle,
        description: p.subtitle,
        modules: p.modulesCount,
        slug: p.slug,
      };
    });

    return NextResponse.json(formattedPrograms, {
      status: 200,
      headers: {
        // Cache at edge for 1 hour; serve stale for 1 day while revalidating
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 });
  }
}