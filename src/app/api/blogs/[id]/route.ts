import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Blog } from "@/models/Blog";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await connectToDatabase();
    const blog = await Blog.findById(resolvedParams.id).lean();
    if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(blog);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await connectToDatabase();
    
    const body = await req.json();
    let imageUrl = body.image || "";
    
    if (imageUrl && imageUrl.startsWith('data:image')) {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const uploadResponse = await cloudinary.uploader.upload(imageUrl, { folder: "inetz_journals" });
        imageUrl = uploadResponse.secure_url;
      }
    }

    let galleryImages = body.galleryImages || [];
    if (galleryImages.length > 0) {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        galleryImages = await Promise.all(
          galleryImages.map(async (img: string) => {
            if (img.startsWith('data:image')) {
              const res = await cloudinary.uploader.upload(img, { folder: "inetz_journals" });
              return res.secure_url;
            }
            return img;
          })
        );
      }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      resolvedParams.id,
      {
        slug: body.slug,
        title: body.title,
        excerpt: body.excerpt,
        content: body.content,
        category: body.category,
        author: body.author,
        readTime: body.readTime,
        date: body.date ? new Date(body.date) : new Date(),
        image: imageUrl,
        mediaUrl: body.mediaUrl || imageUrl,
        isFeatured: body.isFeatured || false,
        videoUrl: body.videoUrl || "",
        galleryImages: galleryImages,
      },
      { new: true }
    );

    if (!updatedBlog) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updatedBlog);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await connectToDatabase();
    const deleted = await Blog.findByIdAndDelete(resolvedParams.id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
