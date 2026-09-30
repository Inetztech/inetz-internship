import { NextRequest, NextResponse } from "next/server";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Program from "@/models/Program";
import { requireRole } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;
    await connectToDatabase();

    const formData = await req.formData();
    const file = formData.get("pdf") as File | null;
    const mainDataString = formData.get("mainData") as string | null;

    if (!file || !mainDataString) {
      return NextResponse.json(
        { success: false, error: "Missing PDF syllabus or program data payload." },
        { status: 400 }
      );
    }

    // 1. Safe JSON payload parsing
    let data: any;
    try {
      data = JSON.parse(mainDataString);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON format in mainData." },
        { status: 400 }
      );
    }

    if (!data.slug) {
      return NextResponse.json(
        { success: false, error: "Program slug is required." },
        { status: 400 }
      );
    }

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection instance is unavailable.");

    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "syllabuses" });

    // 2. Fetch existing program to clean up old syllabus PDF if it exists
    const existingProgram = await Program.findOne({ slug: data.slug })
      .select("pdfFileName")
      .lean();

    if (existingProgram?.pdfFileName) {
      try {
        const oldFiles = await bucket.find({ filename: existingProgram.pdfFileName }).toArray();
        if (oldFiles.length > 0) {
          await bucket.delete(oldFiles[0]._id);
        }
      } catch (err) {
        console.warn("Could not delete old syllabus file:", err);
      }
    }

    // 3. Upload new PDF stream to GridFS
    const pdfFileName = `${data.slug}-${Date.now()}.pdf`;
    const uploadStream = bucket.openUploadStream(pdfFileName, {
      metadata: { contentType: "application/pdf" },
    });

    // Native Web Stream -> Node Readable pipeline (Zero duplicate buffer copying)
    const nodeReadable = Readable.fromWeb(file.stream() as any);
    await pipeline(nodeReadable, uploadStream);

    // 4. Upsert Program Document
    const updatedProgram = await Program.findOneAndUpdate(
      { slug: data.slug },
      {
        $set: {
          slug: data.slug,
          title: data.variant?.title || data.title,
          subtitle: data.variant?.subtitle || data.subtitle,
          duration: data.durationKey || data.duration,
          price: data.variant?.price ?? data.price,
          originalPrice: data.variant?.originalPrice ?? data.originalPrice,
          heroImg: data.variant?.heroImg || data.heroImg,
          pdfFileName,
          syllabus: data.variant?.syllabus || data.syllabus || [],
          projects: data.variant?.projects || data.projects || [],
          reviews: data.reviews || [],
        },
      },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    return NextResponse.json(
      { success: true, data: updatedProgram },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PROGRAM_UPLOAD_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process program upload." },
      { status: 500 }
    );
  }
}
