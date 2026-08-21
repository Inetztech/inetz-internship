"use client";

import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";
import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function ShareButtons({ url, title }: { url?: string, title: string }) {
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (url) {
      setCurrentUrl(url);
    } else if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, [url]);

  const handleShare = (platform: string) => {
    if (!currentUrl) return;
    let shareUrl = "";
    if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`;
    if (platform === 'linkedin') shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(title)}`;
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const copyLink = async () => {
    if (!currentUrl) return;
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy", err);
      toast.error("Failed to copy link.");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] font-medium text-gray-500 mr-1">Share:</span>
      <button onClick={() => handleShare('facebook')} className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-[#1C51F9] transition-colors" aria-label="Share on Facebook"><FaFacebook size={13} /></button>
      <button onClick={() => handleShare('linkedin')} className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-[#1C51F9] transition-colors" aria-label="Share on LinkedIn"><FaLinkedin size={13} /></button>
      <button onClick={() => handleShare('twitter')} className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-[#1C51F9] transition-colors" aria-label="Share on Twitter"><FaTwitter size={13} /></button>
      <button onClick={copyLink} className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors" aria-label="Copy link"><Link2 size={13} /></button>
    </div>
  );
}
