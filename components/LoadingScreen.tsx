"use client";
import { useEffect, useState } from "react";

export default function LoadingScreen({ isVisible }: { isVisible: boolean }) {
  const [render, setRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) setRender(true);
    else {
      const timer = setTimeout(() => setRender(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!render) return null;

  return (
    <div className={`fixed inset-0 z-[9999] bg-white flex items-center justify-center p-[24px] transition-all duration-150 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <div className="flex flex-col md:flex-row items-center gap-[24px] md:gap-[56px] max-w-sm md:max-w-4xl text-center md:text-left">
        <img 
          src="image/MASKOT_SIJELIH_WAITING.png" 
          alt="SiJelih" 
          className="w-[120px] h-[120px] md:w-[280px] md:h-[280px] object-contain animate-pulse"
        />
        <div className="flex flex-col gap-2 md:gap-4">
          <p className="text-[18px] md:text-[32px] font-[800] text-[#0a0a0a] tracking-tight">Tunggu sebentar ya..</p>
          <p className="text-[14px] md:text-[18px] text-[#6b7280] leading-relaxed max-w-[320px] md:max-w-none">Si Jelih sedang menyiapkannya untukmu.</p>
        </div>
      </div>
    </div>
  );
}
