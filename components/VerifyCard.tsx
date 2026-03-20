"use client";
import { useState } from "react";

export default function VerifyCard({ result }: { result: any }) {
  const [isSharing, setIsSharing] = useState(false);

  const getBadgeClass = (verdict: string) => {
    switch (verdict) {
      case "TERKONFIRMASI": return "bg-[#dcfce7] text-[#166534] border-[#bbf7d0]";
      case "BELUM_TERVERIFIKASI": return "bg-[#fef9c3] text-[#854d0e] border-[#fef08a]";
      case "HOAKS": return "bg-[#fee2e2] text-[#991b1b] border-[#fecaca]";
      default: return "bg-[#f3f4f6] text-[#374151] border-[#e5e7eb]";
    }
  };

  const getProgressColor = (verdict: string) => {
    switch (verdict) {
      case "TERKONFIRMASI": return "bg-[#166534]";
      case "BELUM_TERVERIFIKASI": return "bg-[#ca8a04]";
      case "HOAKS": return "bg-[#b91c1c]";
      default: return "bg-[#6b7280]";
    }
  };

  const getProgressWidthClass = (conf: number) => {
    if (conf >= 95) return "w-full";
    if (conf >= 85) return "w-11/12";
    if (conf >= 75) return "w-4/5";
    if (conf >= 65) return "w-2/3";
    if (conf >= 55) return "w-7/12";
    if (conf >= 45) return "w-1/2";
    if (conf >= 35) return "w-5/12";
    if (conf >= 25) return "w-1/3";
    if (conf >= 15) return "w-1/4";
    if (conf >= 5) return "w-2/12";
    return "w-1/12";
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div id="share-card" className="bg-white border border-[#e5e7eb] rounded-[8px] p-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className={`px-[8px] py-[2px] rounded-[4px] text-[11px] font-[600] border ${getBadgeClass(result.verdict)}`}>
            {result.verdict}
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-[13px] font-[600] text-[#111827]">SiJelih</span>
            <span className="text-[11px] text-[#6b7280]">
              {new Date(result.checkedAt).toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-[12px] font-[500] text-[#374151]">
            <span>Tingkat Kepercayaan AI</span>
            <span>{result.confidence}%</span>
          </div>
          <div className="w-full bg-[#f3f4f6] rounded-[4px] h-[6px]">
            <div className={`h-[6px] rounded-[4px] ${getProgressColor(result.verdict)} ${getProgressWidthClass(result.confidence)}`}></div>
          </div>
        </div>
        
        <div className="text-[11px] text-[#9ca3af] font-[500]">
          Data: BMKG
        </div>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-[8px] p-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h3 className="text-[13px] font-[600] text-[#111827]">Alasan</h3>
          <p className="text-[#374151] text-[14px] leading-relaxed">{result.alasan}</p>
        </div>
        
        <div className="flex flex-col gap-1">
          <h3 className="text-[13px] font-[600] text-[#111827]">Sumber Data Basis</h3>
          <p className="text-[#374151] text-[14px] leading-relaxed">{result.sumber}</p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-[13px] font-[600] text-[#111827]">Saran Tindakan</h3>
          <p className="text-[#374151] text-[14px] leading-relaxed">{result.saran}</p>
        </div>
        
        <button disabled={isSharing} onClick={() => {
          setIsSharing(true);
          setTimeout(() => {
            const checkedAtFormatted = new Date(result.checkedAt).toLocaleString("id-ID");
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sijelih.vercel.app";
            const text = `*[SiJelih] Hasil Verifikasi Informasi Bencana*\n\nStatus: ${result.verdict}\nTingkat Keyakinan: ${result.confidence}%\n\nInformasi yang dicek:\n"${result.inputText || result.extractedText || "Verifikasi via foto"}"\n\nAnalisis:\n${result.alasan}\n\nSumber Data: ${result.sumber}\n\nSaran: ${result.saran}\n\nDiverifikasi pada: ${checkedAtFormatted}\n\n_Data bersumber dari BMKG — Badan Meteorologi, Klimatologi, dan Geofisika_\n_Verifikasi menggunakan SiJelih · ${appUrl}_`;
            window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
            setIsSharing(false);
          }, 300);
        }} className="bg-[#25d366] hover:bg-[#1ebe57] text-white text-[13px] font-[600] px-[18px] py-[9px] rounded-[6px] transition-colors w-full text-center cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed">
          {isSharing ? (
            <div className="flex items-center gap-2 justify-center">
              <div className="w-[14px] h-[14px] rounded-full border-[1.5px] border-current border-t-transparent animate-spin"></div>
              Memproses...
            </div>
          ) : "Bagikan ke WhatsApp"}
        </button>
      </div>
    </div>
  );
}
