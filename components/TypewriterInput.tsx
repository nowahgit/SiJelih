"use client";

import { useState, useEffect } from "react";

export default function TypewriterInput() {
  const sentences = [
    "Ada hoaks gempa bumi di Cianjur...",
    "Banjir bandang Garut 3 hari lagi...",
    "BMKG keluarkan peringatan tsunami Selat Sunda...",
    "Gempa M7.2 guncang Sulawesi tadi malam..."
  ];

  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(42);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleType = () => {
      const i = loopNum % sentences.length;
      const fullText = sentences[i];

      if (isDeleting) {
        setText(fullText.substring(0, text.length - 1));
        setTypingSpeed(22);
      } else {
        setText(fullText.substring(0, text.length + 1));
        setTypingSpeed(42);
      }

      if (!isDeleting && text === fullText) {
        timer = setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        timer = setTimeout(() => {}, 500); // small delay before next sentence
      } else {
        timer = setTimeout(handleType, typingSpeed);
      }
    };

    timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(cursorTimer);
  }, []);

  return (
    <div className="max-w-[540px] mx-auto bg-white border border-[#e5e7eb] rounded-[8px] px-[18px] py-[13px] flex items-center gap-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <svg className="w-[14px] h-[14px] text-[#9ca3af] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <div className="font-mono text-[14px] text-[#374151] flex-1 text-left flex items-center truncate min-w-0">
        <span className="truncate">{text}</span>
        <span className={`text-[#2563eb] transition-opacity duration-100 ${cursorVisible ? "opacity-100" : "opacity-0"}`}>|</span>
      </div>
      <div className="border border-[#e5e7eb] rounded-[4px] px-[8px] py-[2px] font-[600] text-[10px] text-[#6b7280] font-mono flex-shrink-0 bg-white">
        BMKG Live
      </div>
    </div>
  );
}
