"use client";

export default function TypewriterInput() {
  const staticText = "Cari wilayah atau verifikasi berita bencana...";

  return (
    <div className="w-full max-w-[540px] mx-auto lg:mx-0 bg-white border border-[#e5e7eb] rounded-[8px] px-3 min-[400px]:px-4 h-[52px] flex flex-row flex-nowrap items-center gap-[8px] md:gap-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden box-border min-w-0">
      <svg className="w-[14px] h-[14px] text-[#9ca3af] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <div className="font-mono text-[12px] md:text-[14px] leading-none text-[#9ca3af] flex-1 text-left flex items-center overflow-hidden min-w-0 h-full">
        <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis flex-1 block">{staticText}</span>
      </div>
      <div className="border border-[#e5e7eb] rounded-[4px] px-[8px] py-[2px] font-[600] text-[10px] text-[#6b7280] font-mono flex-shrink-0 bg-white whitespace-nowrap">
        BMKG Live
      </div>
    </div>
  );
}
