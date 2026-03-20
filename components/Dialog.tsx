"use client";
import { useEffect, useState, ReactNode } from "react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Dialog({ isOpen, onClose, title, children, size = "md" }: DialogProps) {
  const [render, setRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setRender(true);
    else {
      const timer = setTimeout(() => setRender(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!render) return null;

  const sizeClass = size === "sm" ? "max-w-[380px]" : size === "lg" ? "max-w-[600px]" : "max-w-[480px]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-[16px]">
      <div 
        className={`absolute inset-0 bg-black/40 transition-opacity duration-150 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
      />
      <div className={`relative bg-white rounded-[10px] border border-[#e5e7eb] w-full ${sizeClass} max-w-full transition-all duration-200 ease-out flex flex-col overflow-hidden ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="p-[20px_24px] border-b border-[#f3f4f6] flex justify-between items-center bg-white">
          <h3 className="text-[15px] font-[600] text-[#0a0a0a]">{title}</h3>
          <div onClick={onClose} className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] hover:bg-[#f3f4f6] cursor-pointer text-[#9ca3af] hover:text-[#374151] text-[18px]">
            ×
          </div>
        </div>
        <div className="p-[20px_24px] bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
