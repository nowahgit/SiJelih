"use client";
import { useEffect } from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  useEffect(() => {
    if (!document.getElementById("shimmer-style")) {
      const style = document.createElement("style");
      style.id = "shimmer-style";
      style.innerHTML = `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-effect::after {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);
          animation: shimmer 1.5s infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return <div className={`relative bg-[#f3f4f6] overflow-hidden shimmer-effect ${className}`}></div>;
}
