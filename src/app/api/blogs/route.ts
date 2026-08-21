import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Blog } from "@/models/Blog";
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Sort by date descending
    const blogs = await Blog.find({}).sort({ date: -1 }).lean();
    return NextResponse.json(blogs);
  } catch (error: any) {
    console.error("GET /api/blogs Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    let imageUrl = body.image || "";
    
    // If the image is a base64 string, upload to Cloudinary if configured
    if (imageUrl && imageUrl.startsWith('data:image')) {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
          folder: "inetz_journals",
        });
        imageUrl = uploadResponse.secure_url;
      }
    }

    // Process gallery images if they are base64
    let galleryImages = body.galleryImages || [];
    if (galleryImages.length > 0) {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const processedGallery = await Promise.all(
          galleryImages.map(async (img: string) => {
            if (img.startsWith('data:image')) {
              const res = await cloudinary.uploader.upload(img, { folder: "inetz_journals" });
              return res.secure_url;
            }
            return img;
          })
        );
        galleryImages = processedGallery;
      }
    }

    const newBlog = await Blog.create({
      slug: body.slug,
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      category: body.category,
      author: body.author || "Admin",
      readTime: body.readTime || "5 min read",
      date: body.date ? new Date(body.date) : new Date(),
      image: imageUrl,
      mediaUrl: body.mediaUrl || imageUrl,
      isFeatured: body.isFeatured || false,
      videoUrl: body.videoUrl || "",
      galleryImages: galleryImages,
    });

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/blogs Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
