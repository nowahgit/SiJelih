"use client";

export default function TickerBar() {
  const tickerText = "BMKG: Gempa M4.2 Maluku Utara · Peringatan Dini Hujan Lebat Jawa Barat · Gempa M3.8 Bengkulu · Peringatan Banjir Bandang Kalimantan Selatan · Gempa M5.1 Sulawesi Tengah · Peringatan Angin Kencang NTT";
  
  return (
    <div className="w-full h-[36px] bg-[#fafafa] border-b border-[#e5e7eb] overflow-hidden flex relative">
      <div className="z-10 bg-[#0a0a0a] text-white px-[12px] h-full flex items-center flex-shrink-0 font-mono text-[10px] font-[700]">
        BMKG LIVE
      </div>
      <div className="flex-1 overflow-hidden relative flex items-center group">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-ticker {
            animation: ticker 35s linear infinite;
            display: inline-flex;
            white-space: nowrap;
          }
          .group:hover .animate-ticker {
            animation-play-state: paused;
          }
        `}} />
        <div className="animate-ticker font-mono text-[11px] font-[500] text-[#6b7280]">
          <span className="pr-4">{tickerText}</span>
          <span className="pr-4">·</span>
          <span className="pr-4">{tickerText}</span>
          <span className="pr-4">·</span>
          <span className="pr-4">{tickerText}</span>
          <span className="pr-4">·</span>
          <span className="pr-4">{tickerText}</span>
        </div>
      </div>
    </div>
  );
}
