"use client";
import { useState, useEffect, useRef } from "react";
import { getLatestBMKGData, getEarlyWarnings, getWeatherForecast } from "@/lib/bmkg";
import DisasterMap from "./DisasterMap";

export default function BencanaSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [warnings, setWarnings] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselLoading, setCarouselLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  const carouselTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const infiniteWarnings = warnings.length > 0 ? [...warnings, ...warnings, ...warnings] : [];

  useEffect(() => {
    const fetchInitial = async () => {
      setCarouselLoading(true);
      const w = await getEarlyWarnings();
      if (w && w.length > 0) {
        setWarnings(w);
        setActiveIndex(w.length);
      }
      setCarouselLoading(false);
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    if (warnings.length > 0) {
      carouselTimer.current = setInterval(() => {
        if (!isPaused) {
          handleNext();
        }
      }, 4000);
    }
    return () => {
      if (carouselTimer.current) clearInterval(carouselTimer.current);
    };
  }, [warnings, isPaused, activeIndex]);

  const handleNext = () => {
    setActiveIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => prev - 1);
  };

  useEffect(() => {
    const n = warnings.length;
    if (n === 0) return;

    if (activeIndex >= n * 2) {
      setTimeout(() => {
        setTransitionEnabled(false);
        setActiveIndex(activeIndex - n);
        setTimeout(() => setTransitionEnabled(true), 10);
      }, 300);
    } else if (activeIndex < n) {
      setTimeout(() => {
        setTransitionEnabled(false);
        setActiveIndex(activeIndex + n);
        setTimeout(() => setTransitionEnabled(true), 10);
      }, 300);
    }
  }, [activeIndex, warnings.length]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError("");
    
    try {
      const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&countrycodes=id&format=json&addressdetails=1&limit=1`);
      const nomData = await nomRes.json();

      if (nomData.length === 0) {
        setSearchError("Wilayah tidak ditemukan");
        setSearchLoading(false);
        return;
      }

      const location = nomData[0];
      const displayName = location.display_name;
      
      const bmkgBase = await getLatestBMKGData();
      
      let weather = null;
      const kodeWilayah = location.address?.postcode || ""; 
      
      if (kodeWilayah) {
        weather = await getWeatherForecast(kodeWilayah);
      }

      setSearchResult({
        wilayah: displayName.split(",")[0],
        displayName: displayName,
        weather: weather,
        bmkg: bmkgBase
      });

    } catch (err) {
      setSearchError("Gagal mengambil data");
    } finally {
      setSearchLoading(false);
    }
  };


  return (
    <section id="bencana" className="w-full bg-white border-t border-[#f3f4f6] px-6 py-[96px]">
      <div className="max-w-[1100px] mx-auto">
        <span className="block text-[11px] font-[600] tracking-[0.08em] text-[#9ca3af] font-mono mb-[12px]">PANTAU WILAYAH</span>
        <h2 className="text-[34px] font-[800] tracking-[-0.02em] text-[#0a0a0a] mb-[48px]">Cek kondisi bencana di wilayahmu.</h2>

        <div className="mb-10">
          <DisasterMap height={380} />
        </div>

        <div className="border-t border-[#f3f4f6] my-10"></div>
        
        <div className="flex flex-col lg:flex-row gap-[32px]">
          <div className="flex-1">
            <h3 className="text-[13px] font-[500] text-[#374151] mb-[8px]">Cari lokasi</h3>
            <form onSubmit={handleSearch} className="relative mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#e5e7eb] rounded-[8px] p-[10px_16px] pl-[40px] text-[14px] placeholder-[#9ca3af] focus:ring-2 focus:ring-[#0a0a0a] focus:outline-none"
                  placeholder="Cari nama kecamatan atau kota..."
                />
                <svg className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button
                  type="submit"
                  className="absolute right-[3px] top-1/2 -translate-y-1/2 bg-[#0a0a0a] text-white text-[12px] font-[600] px-[14px] py-[6px] rounded-[6px] hover:bg-[#1f1f1f] transition-colors"
                >
                  Cari
                </button>
              </div>
            </form>

            <div className="min-h-[400px]">
              {searchLoading ? (
                <div className="bg-[#fafafa] border border-[#e5e7eb] rounded-[8px] p-[40px] text-center flex flex-col items-center justify-center">
                  <div className="w-[24px] h-[24px] border-[2px] border-[#e5e7eb] border-top-[#0a0a0a] rounded-full animate-spin"></div>
                  <span className="text-[13px] text-[#9ca3af] mt-[12px]">Mengambil data BMKG...</span>
                </div>
              ) : !searchResult ? (
                <div className="bg-[#fafafa] border border-[#e5e7eb] rounded-[8px] p-[40px] text-center flex flex-col items-center gap-[12px]">
                  <svg className="w-[32px] h-[32px] text-[#d1d5db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-[14px] text-[#9ca3af] font-[500] uppercase tracking-wider">Belum ada wilayah yang dicari</span>
                  <span className="text-[12px] text-[#d1d5db]">Cari nama kecamatan, kota, atau kabupaten di Indonesia</span>
                </div>
              ) : (
                <div className="flex flex-col gap-[12px]">
                  <div className="bg-white border border-[#e5e7eb] rounded-[8px] p-[16px_20px]">
                    <div className="flex justify-between items-center mb-[12px]">
                      <span className="text-[10px] font-[700] font-mono text-[#9ca3af]">PRAKIRAAN CUACA BESOK</span>
                      <span className="text-[10px] font-[600] font-mono bg-[#f3f4f6] text-[#6b7280] px-[8px] py-[2px] rounded-[4px]">BMKG</span>
                    </div>
                    {searchResult.weather && searchResult.weather.length > 3 ? (
                      <div>
                        <div className="text-[15px] font-[600] text-[#0a0a0a]">{searchResult.wilayah}</div>
                        <div className="text-[14px] text-[#374151] mt-0.5">{searchResult.weather[3].cuaca}</div>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-[24px] font-[800] text-[#0a0a0a] tracking-tight">{searchResult.weather[3].suhu}</span>
                          <span className="text-[14px] font-[600] text-[#0a0a0a]">°C</span>
                        </div>
                        <div className="text-[12px] text-[#6b7280] font-mono mt-2">
                          RH: {searchResult.weather[3].kelembapan}% | WIND: {searchResult.weather[3].angin_kmh} KM/H
                        </div>
                      </div>
                    ) : (
                      <div className="text-[13px] text-[#9ca3af] py-2">Data prakiraan tidak tersedia untuk wilayah ini</div>
                    )}
                  </div>

                  <div className="bg-white border border-[#e5e7eb] rounded-[8px] p-[16px_20px]">
                    <div className="flex justify-between items-center mb-[12px]">
                      <span className="text-[10px] font-[700] font-mono text-[#9ca3af]">GEMPA BUMI TERAKHIR</span>
                      <span className="text-[10px] font-[600] font-mono bg-[#f3f4f6] text-[#6b7280] px-[8px] py-[2px] rounded-[4px]">BMKG</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-[28px] font-[800] text-[#0a0a0a] tracking-tight">M{searchResult.bmkg?.autoGempa?.Magnitude}</div>
                      <div className="flex gap-2">
                        {parseFloat(searchResult.bmkg?.autoGempa?.Magnitude) >= 5.0 && (
                          <span className="bg-[#fee2e2] text-[#991b1b] border border-[#fecaca] text-[10px] font-[700] font-mono px-[8px] py-[2px] rounded-[4px]">SIGNIFIKAN</span>
                        )}
                        {searchResult.bmkg?.autoGempa?.Potensi?.includes("Potensi tsunami") && (
                          <span className="bg-[#fef9c3] text-[#854d0e] border border-[#fef08a] text-[10px] font-[700] font-mono px-[8px] py-[2px] rounded-[4px]">POTENSI TSUNAMI</span>
                        )}
                      </div>
                    </div>
                    <div className="text-[13px] text-[#374151] mt-1 line-clamp-1">{searchResult.bmkg?.autoGempa?.Wilayah}</div>
                    <div className="text-[12px] text-[#6b7280] font-mono mt-2 uppercase">
                      {searchResult.bmkg?.autoGempa?.Kedalaman} | {searchResult.bmkg?.autoGempa?.Tanggal} {searchResult.bmkg?.autoGempa?.Jam}
                    </div>
                  </div>

                  <div className="bg-white border border-[#e5e7eb] rounded-[8px] p-[16px_20px]">
                    <div className="flex justify-between items-center mb-[12px]">
                      <span className="text-[10px] font-[700] font-mono text-[#9ca3af]">STATUS PERINGATAN DINI</span>
                    </div>
                    {warnings.length > 0 ? (
                      <div>
                        <h4 className="text-[14px] font-[600] text-[#0a0a0a] line-clamp-1">{warnings[0].judul}</h4>
                        <p className="text-[13px] text-[#374151] line-clamp-2 mt-1">{warnings[0].deskripsi}</p>
                        <div className="text-[11px] text-[#9ca3af] font-mono mt-2 uppercase">{warnings[0].waktu}</div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="w-[8px] h-[8px] rounded-full bg-[#22c55e] mr-[6px]"></div>
                        <span className="text-[13px] text-[#374151]">Tidak ada peringatan aktif</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">            <h3 className="text-[13px] font-[600] tracking-wider text-[#374151] uppercase mb-[16px]">Peringatan aktif BMKG</h3>
            <div 
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={(e) => { touchStartX.current = e.touches[0].clientY; }}
              onTouchEnd={(e) => {
                if (touchStartX.current === null) return;
                const delta = e.changedTouches[0].clientY - touchStartX.current;
                if (delta < -30) handleNext();
                else if (delta > 30) handlePrev();
                touchStartX.current = null;
              }}
              className="relative overflow-hidden w-full h-[320px] group border-l border-gray-100 pl-4"
            >
              {carouselLoading ? (
                <div className="flex flex-col gap-[12px]">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex-1 bg-gray-50 animate-pulse h-[90px] rounded-[12px]"></div>
                  ))}
                </div>
              ) : warnings.length === 0 ? (
                <div className="bg-[#fafafa] border border-[#e5e7eb] rounded-[16px] p-[40px] text-center flex flex-col items-center justify-center h-full">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-[8px] h-[8px] rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[14px] font-[600] text-[#0a0a0a]">Aman</span>
                  </div>
                  <span className="text-[11px] text-[#9ca3af] font-mono tracking-tight uppercase">Tidak ada peringatan dini aktif</span>
                </div>
              ) : (
                <>
                  <button 
                    onClick={handlePrev}
                    className="absolute left-1/2 -translate-x-1/2 top-1 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-md flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-[16px] h-[16px] text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button 
                    onClick={handleNext}
                    className="absolute left-1/2 -translate-x-1/2 bottom-1 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-md flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-[16px] h-[16px] text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  
                    <div 
                      ref={trackRef}
                      className={`flex flex-col items-stretch w-full ${transitionEnabled ? "transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)" : ""}`}
                      style={{ 
                        transform: `translateY(-${(activeIndex - 1) * (100 / (warnings.length * 3))}%)`,
                        height: `${(warnings.length * 3) * 100}px` 
                      }}
                    >
                    {infiniteWarnings.map((w, idx) => {
                      const isActive = idx === activeIndex;
                      return (
                        <div
                          key={`${idx}`}
                          onClick={() => setActiveIndex(idx)}
                          className={`flex-shrink-0 transition-all duration-500`}
                          style={{ height: `${100 / (warnings.length * 3)}%` }}
                        >
                          <div className={`mx-2 my-1 border rounded-[12px] p-[16px] bg-white transition-all duration-500 overflow-hidden ${
                            isActive 
                            ? "border-[#0a0a0a]/10 shadow-[0_8px_16px_rgba(0,0,0,0.05)] scale-100 z-10 opacity-100" 
                            : "border-gray-50 shadow-none bg-gray-50/10 scale-95 opacity-40 blur-[0.2px] cursor-pointer"
                          }`}>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className={`text-[8px] font-[800] font-mono px-1.5 py-0.5 rounded-full ${isActive ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                                ALERT
                              </span>
                              <span className="text-[9px] text-gray-400 font-mono tracking-tighter uppercase font-bold">{w.waktu.split(" ")[0]}</span>
                            </div>
                            <h4 className={`text-[13px] font-[700] text-[#0a0a0a] line-clamp-1 leading-tight mb-1`}>
                              {w.judul}
                            </h4>
                            <p className="text-[11px] text-[#6b7280] line-clamp-1 leading-tight opacity-80">
                              {w.deskripsi}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <p className="text-[11px] text-[#9ca3af] font-mono mt-8 text-center uppercase tracking-widest opacity-60">
              Live BMKG Nowcast — Auto Pulse every 4s
            </p>
          </div>
        </div>

        <p className="text-[11px] text-[#9ca3af] font-mono mt-12 text-center">
          Data bersumber dari BMKG — Badan Meteorologi, Klimatologi, dan Geofisika & Nowcast
        </p>
      </div>
    </section>
  );
}
