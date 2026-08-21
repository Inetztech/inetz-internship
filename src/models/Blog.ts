import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  excerpt: { type: String },
  content: { type: String, required: true },
  category: { type: String },
  author: { type: String, default: "Admin" },
  readTime: { type: String },
  date: { type: Date, default: Date.now },
  image: { type: String },
  mediaUrl: { type: String }, 
  isFeatured: { type: Boolean, default: false },
  videoUrl: { type: String },
  galleryImages: [{ type: String }], 
}, { collection: 'blogs', timestamps: true });

export const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
