"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageLightbox({ images, initialIndex = 0, isOpen, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = "hidden"; // Prevent scrolling behind modal
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, initialIndex]);

  if (!isOpen) return null;

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8 transition-opacity" onClick={onClose}>
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 p-2.5 rounded-full z-10 transition-all shadow-lg"
      >
        <X size={24} />
      </button>

      {images.length > 1 && (
        <button 
          onClick={handlePrevious}
          className="absolute left-4 sm:left-10 text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 p-3.5 rounded-full z-10 transition-all shadow-lg"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      <div className="relative w-full h-full max-w-6xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <Image 
          src={images[currentIndex]} 
          alt={`Gallery Image ${currentIndex + 1}`} 
          fill 
          className="object-contain drop-shadow-2xl" 
          quality={100}
        />
      </div>

      {images.length > 1 && (
        <button 
          onClick={handleNext}
          className="absolute right-4 sm:right-10 text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 p-3.5 rounded-full z-10 transition-all shadow-lg"
        >
          <ChevronRight size={32} />
        </button>
      )}
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-sm font-semibold tracking-widest bg-black/60 backdrop-blur-sm px-5 py-2 rounded-full border border-white/10 shadow-lg">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
