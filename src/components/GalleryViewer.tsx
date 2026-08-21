"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import ImageLightbox from "./ImageLightbox";

export default function GalleryViewer({ images }: { images: string[] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className="mt-12 bg-[#FAFBFF] p-8 rounded-2xl border border-gray-100">
      <h2 className="text-[17px] font-black text-[#0B1A30] mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#0B1A30] flex items-center justify-center text-white shadow-sm">
          <ImageIcon size={20} />
        </div>
        Gallery
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, i) => (
          <div 
            key={i} 
            onClick={() => {
              setSelectedIndex(i);
              setLightboxOpen(true);
            }}
            className="relative aspect-video rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer group"
          >
            <Image 
              src={img} 
              alt={`Gallery ${i}`} 
              fill 
              className="object-cover group-hover:scale-110 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
               <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-bold text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-lg">
                 Tap to View
               </div>
            </div>
          </div>
        ))}
      </div>
      
      <ImageLightbox 
        images={images} 
        isOpen={lightboxOpen} 
        initialIndex={selectedIndex} 
        onClose={() => setLightboxOpen(false)} 
      />
    </div>
  );
}
