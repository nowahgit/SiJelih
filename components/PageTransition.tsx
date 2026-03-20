"use client";
import { useEffect, useState, ReactNode } from "react";

export default function PageTransition({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <div className={`transition-all duration-200 ease-out w-full flex-1 flex flex-col min-w-0 h-full ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[8px]'}`}>
      {children}
    </div>
  );
}
