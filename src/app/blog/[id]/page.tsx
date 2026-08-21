import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, PlayCircle, BookOpen, Link2, ImageIcon, Mail, Cpu, Briefcase, Folder, Megaphone } from "lucide-react";
import { FaFacebook, FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";
import ShareButtons from "@/components/ShareButtons";
import GalleryViewer from "@/components/GalleryViewer";
import SubscribeForm from "@/components/SubscribeForm";
import { connectToDatabase } from "@/lib/db";
import { Blog } from "@/models/Blog";
import mongoose from "mongoose";

// Generate SEO Metadata for individual posts
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  await connectToDatabase();

  const decodedId = decodeURIComponent(resolvedParams.id);

  let post = await Blog.findOne({ slug: decodedId }).lean() as any;
  if (!post && mongoose.Types.ObjectId.isValid(decodedId)) {
    post = await Blog.findById(decodedId).lean() as any;
  }

  if (!post) {
    return {
      title: "Post Not Found | Inetz Technologies",
    };
  }

  return {
    title: `${post.title} | Inetz Technologies Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: [post.mediaUrl || post.image],
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  await connectToDatabase();

  const decodedId = decodeURIComponent(resolvedParams.id);

  let post = await Blog.findOne({ slug: decodedId }).lean() as any;
  if (!post && mongoose.Types.ObjectId.isValid(decodedId)) {
    post = await Blog.findById(decodedId).lean() as any;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FDFDFE] font-sans flex flex-col items-center justify-center text-center px-6 pb-20 pt-24">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">Post Not Found</h1>
        <p className="text-base text-gray-500 mb-8 max-w-md leading-relaxed">
          The article you are looking for doesn't exist, has been removed, or the link is incorrect.
        </p>
        <Link href="/blog" className="inline-flex items-center justify-center px-6 py-3 bg-[#1C51F9] text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blogs
        </Link>
      </div>
    );
  }

  // Fetch recent posts
  let recentPosts: any[] = [];
  try {
    const query = mongoose.Types.ObjectId.isValid(post._id) ? { _id: { $ne: post._id } } : {};
    recentPosts = await Blog.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(4)
      .lean();
  } catch (error) {
    console.error("Error fetching recent posts:", error);
  }

  return (
    <div className="min-h-screen bg-[#FDFDFE] font-sans text-gray-900 ">


      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">

        {/* Left Column - Main Content */}
        <div className="lg:col-span-8">

          <Link href="/blog" className="inline-flex items-center text-[#1C51F9] font-bold text-[13px] hover:text-blue-800 transition-colors mb-5 mt-2">
            <ArrowLeft size={14} className="mr-1.5" /> Back to Blogs
          </Link>

          {/* Author and Share - Now at Top */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-[#1C51F9] font-bold text-xl shadow-sm shrink-0">
                {(post.author || "I").charAt(0)}
              </div>
              <div>
                <p className="font-bold text-[15px] text-[#0B1A30]">{post.author || "Inetz Admin"}</p>
                <p className="text-[12px] text-gray-500 font-medium">Last updated on {new Date(post.date || post.createdAt).toLocaleDateString('en-GB')}</p>
              </div>
            </div>

            <ShareButtons title={post.title} />
          </div>

          {(post.mediaUrl || post.image) && (
            <div className="relative w-full aspect-video md:aspect-[2/1] rounded-xl overflow-hidden mb-10 shadow-sm">
              <Image src={post.mediaUrl || post.image} alt={post.title} fill className="object-cover" />
            </div>
          )}

          <article
            className="prose max-w-none text-gray-700
              prose-headings:font-black prose-headings:text-[#0B1A30] prose-headings:tracking-tight
              prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
              prose-p:leading-relaxed prose-p:mb-5 prose-p:text-[15px]
              prose-a:text-[#1C51F9] hover:prose-a:text-blue-800
              prose-strong:text-gray-900 prose-ul:list-disc prose-ul:pl-4
              prose-li:mb-2 prose-img:rounded-xl prose-img:shadow-sm prose-img:max-w-full prose-img:mx-auto"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Left Column Gallery */}
          {post.galleryImages && post.galleryImages.length > 0 && (
            <GalleryViewer images={post.galleryImages} />
          )}

          {/* Left Column You may also like */}
          {recentPosts.length > 0 && (
            <div className="mt-16">
              <div className="border-b-2 border-[#F97316] pb-1.5 mb-8 inline-block">
                <h2 className="text-[17px] font-bold text-[#0B1A30]">You may also like</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentPosts.map((rp) => (
                  <div key={rp._id.toString()} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col group">
                    <Link href={`/blog/${rp.slug || rp._id.toString()}`} className="relative h-28 w-full overflow-hidden bg-gray-50 block shrink-0">
                      {rp.image || rp.mediaUrl ? (
                        <Image src={rp.image || rp.mediaUrl} alt={rp.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="text-gray-300 w-6 h-6" />
                        </div>
                      )}
                      {rp.videoUrl && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <PlayCircle className="text-white w-6 h-6" />
                        </div>
                      )}
                    </Link>
                    <div className="p-3 flex flex-col flex-1">
                      <span className="inline-block px-1.5 py-0.5 bg-orange-50 text-[#F97316] text-[8px] font-bold uppercase tracking-wider rounded mb-2 w-fit">
                        {rp.category || "ARTICLE"}
                      </span>
                      <h3 className="font-bold text-[13px] text-gray-900 mb-1.5 line-clamp-2 group-hover:text-[#F97316] transition-colors leading-snug">
                        <Link href={`/blog/${rp.slug || rp._id.toString()}`}>{rp.title}</Link>
                      </h3>
                      {rp.excerpt && (
                        <p className="text-[10px] text-gray-500 line-clamp-2 mb-2 leading-relaxed">
                          {rp.excerpt}
                        </p>
                      )}
                      <div className="mt-auto flex items-center gap-2 text-[9px] text-gray-400 font-medium pt-1">
                        <span className="flex items-center gap-1">
                          <Clock size={9} /> {new Date(rp.date || rp.createdAt).toLocaleDateString('en-GB')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={9} /> {rp.readTime || "5 min read"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link href="/blog" className="inline-block px-8 py-2.5 border border-[#F97316] text-[#F97316] text-[13px] font-bold rounded-lg hover:bg-orange-50 transition-colors">
                  View All Articles -{'>'}
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">

            {/* About Author */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-[15px] mb-4 text-[#0B1A30]">About Author</h3>
              <div className="w-[50px] h-[50px] rounded-full bg-blue-100 flex items-center justify-center text-[#1C51F9] font-bold text-xl mb-3">
                {(post.author || "I").charAt(0)}
              </div>
              <h4 className="font-bold text-[14px] text-gray-900 mb-1.5">{post.author || "Inetz Admin"}</h4>
              <p className="text-gray-600 text-[12px] mb-6 leading-relaxed">
                Admin of Inetz Technologies. Passionate about learning, innovation and helping students grow.
              </p>
              <Link href="/blog" className="block w-full py-2.5 text-center text-[#F97316] text-[13px] font-bold border border-[#F97316] rounded-lg hover:bg-orange-50 transition-colors">
                View All Posts
              </Link>
            </div>



            {/* Categories */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="border-b-2 border-[#F97316] pb-1.5 mb-5 inline-block">
                <h3 className="font-bold text-[15px] text-[#0B1A30]">Categories</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { name: 'Projects', icon: <BookOpen size={16} />, count: 12 },
                  { name: 'Technology', icon: <Cpu size={16} />, count: '08' },
                  { name: 'Careers', icon: <Briefcase size={16} />, count: '07' },
                  { name: 'Learning', icon: <Folder size={16} />, count: '06' },
                  { name: 'Announcements', icon: <Megaphone size={16} />, count: '04' },
                ].map((cat, i) => (
                  <li key={i}>
                    <Link href={`/blog?category=${cat.name}`} className="flex items-center justify-between group cursor-pointer">
                      <span className="flex items-center gap-3 text-[13px] font-bold text-gray-700 group-hover:text-[#F97316] transition-colors">
                        <span className="text-[#F97316]">{cat.icon}</span> {cat.name}
                      </span>
                      <span className="bg-gray-50 text-gray-500 text-[11px] font-bold py-1 px-2.5 rounded-full">{cat.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 text-center">
                <Link href="/blog" className="text-[#F97316] text-[12px] font-bold hover:underline">View All Categories -{'>'}</Link>
              </div>
            </div>

            {/* Stay Updated */}
            <div className="bg-[#0B1A30] rounded-xl p-6 shadow-sm text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-[#F97316]" />
                </div>
                <h3 className="font-bold text-[16px]">Stay Updated</h3>
              </div>
              <p className="text-[12px] text-gray-300 mb-5 leading-relaxed">Subscribe to get the latest updates and new articles.</p>
              <SubscribeForm />
              <div className="flex items-center justify-center gap-3">
                <a href="https://facebook.com/inetz" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center text-white"><FaFacebook size={13} /></a>
                <a href="https://linkedin.com/company/inetz" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-[#0A66C2] flex items-center justify-center text-white"><FaLinkedin size={13} /></a>
                <a href="https://twitter.com/inetz" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white"><FaTwitter size={13} /></a>
                <a href="https://instagram.com/inetz" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-[#E4405F] flex items-center justify-center text-white"><FaInstagram size={13} /></a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
