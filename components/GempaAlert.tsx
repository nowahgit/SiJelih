"use client";

import { useEffect, useState } from "react";

export default function GempaAlert() {
  const [gempa, setGempa] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [lastDismissedId, setLastDismissedId] = useState("");

  const fetchGempa = async () => {
    try {
      const res = await fetch("https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json", {
        cache: "no-store",
      });
      const data = await res.json();
      const info = data?.Infogempa?.gempa;
      if (info && parseFloat(info.Magnitude) >= 5.0) {
        setGempa(info);
      } else {
        setGempa(null);
      }
    } catch {
    }
  };

  useEffect(() => {
    fetchGempa();
    const interval = setInterval(fetchGempa, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (gempa) {
      const gempaId = `${gempa.Tanggal}-${gempa.Jam}`;
      if (isDismissed && lastDismissedId !== gempaId) {
        setIsDismissed(false);
      }
    }
  }, [gempa, isDismissed, lastDismissedId]);

  if (!gempa || isDismissed) return null;

  const isTsunami = gempa.Potensi?.toLowerCase().includes("tsunami");

  return (
    <div className="sticky top-0 w-full z-[100] flex items-center bg-[#7f1d1d] text-white text-[13px] py-[10px] px-[24px]">
      <div className="flex-1 pr-4 whitespace-normal font-medium">
        PERINGATAN GEMPA BUMI — M{gempa.Magnitude} · {gempa.Wilayah} · {gempa.Tanggal}, {gempa.Jam} WIB · Kedalaman {gempa.Kedalaman}
        {isTsunami && (
          <span className="ml-2 bg-[#991b1b] px-2 py-0.5 whitespace-nowrap">· BERPOTENSI TSUNAMI</span>
        )}
      </div>
      <button 
        onClick={() => {
          setIsDismissed(true);
          setLastDismissedId(`${gempa.Tanggal}-${gempa.Jam}`);
        }} 
        className="p-1 hover:bg-[#991b1b] transition-colors duration-150"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 6-12 12M6 6l12 12"/></svg>
      </button>
    </div>
  );
}
