"use client";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export function Toast({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(item.id), 200);
    }, 3000);
    return () => clearTimeout(timer);
  }, [item.id, onRemove]);

  const dotColor = item.type === "success" ? "bg-[#22c55e]" : item.type === "error" ? "bg-[#ef4444]" : "bg-[#3b82f6]";

  return (
    <div className={`bg-[#0a0a0a] text-white text-[13px] p-[10px_16px] rounded-[8px] max-w-[280px] flex items-center gap-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-200 ease-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${dotColor}`}></div>
      <span>{item.message}</span>
    </div>
  );
}
