"use client";
import { useState, useEffect, useRef } from "react";
import { getLatestBMKGData, getEarlyWarnings, getWeatherForecast } from "@/lib/bmkg";

export default function BencanaSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [warnings, setWarnings] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselLoading, setCarouselLoading] = useState(true);

  const carouselTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchInitial = async () => {
      setCarouselLoading(true);
      const w = await getEarlyWarnings();
      setWarnings(w || []);
      setCarouselLoading(false);
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    if (warnings.length > 0) {
      carouselTimer.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % warnings.length);
      }, 4000);
    }
    return () => {
      if (carouselTimer.current) clearInterval(carouselTimer.current);
    };
  }, [warnings]);

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

  const getVisibleItems = () => {
    if (warnings.length === 0) return [];
    const len = warnings.length;
    const prev = (activeIndex - 1 + len) % len;
    const next = (activeIndex + 1) % len;
    return [
      { item: warnings[prev], index: prev },
      { item: warnings[activeIndex], index: activeIndex },
      { item: warnings[next], index: next }
    ];
  };

  return (
    <section id="bencana" className="w-full bg-white border-t border-[#f3f4f6] px-6 py-[96px]">
      <div className="max-w-[1100px] mx-auto">
        <span className="block text-[11px] font-[600] tracking-[0.08em] text-[#9ca3af] font-mono mb-[12px]">PANTAU WILAYAH</span>
        <h2 className="text-[34px] font-[800] tracking-[-0.02em] text-[#0a0a0a] mb-[48px]">Cek kondisi bencana di wilayahmu.</h2>
        
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
                  {/* CARD 1 - WEATHER */}
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

                  {/* CARD 2 - QUAKE */}
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

                  {/* CARD 3 - WARNING */}
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
                  <p className="text-[11px] text-[#9ca3af] font-mono mt-[8px]">
                    Data bersumber dari BMKG — Badan Meteorologi, Klimatologi, dan Geofisika
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-[13px] font-[500] text-[#374151] mb-[8px]">Peringatan aktif BMKG</h3>
            <div className="relative overflow-hidden min-h-[180px]">
              {carouselLoading ? (
                <div className="flex gap-[12px]">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex-1 bg-[#f3f4f6] animate-pulse h-[160px] rounded-[8px]"></div>
                  ))}
                </div>
              ) : warnings.length === 0 ? (
                <div className="bg-[#fafafa] border border-[#e5e7eb] rounded-[8px] p-[32px] text-center flex flex-col items-center justify-center h-full">
                  <div className="flex items-center gap-2">
                    <div className="w-[8px] h-[8px] rounded-full bg-[#22c55e]"></div>
                    <span className="text-[13px] text-[#374151]">Tidak ada peringatan dini aktif saat ini</span>
                  </div>
                  <span className="text-[11px] text-[#9ca3af] font-mono mt-[4px]">Data diperbarui setiap saat oleh BMKG</span>
                </div>
              ) : (
                <div className="flex items-center gap-[12px]">
                  {getVisibleItems().map((v, i) => {
                    const isCenter = i === 1;
                    return (
                      <div
                        key={`${v.index}-${i}`}
                        onClick={() => setActiveIndex(v.index)}
                        className={`transition-all duration-300 cursor-pointer flex-shrink-0 ${
                          isCenter 
                          ? "w-[calc(40%-12px)] bg-white border-[#d1d5db] scale-100 opacity-100 shadow-[0_4px_12px_rgba(0,0,0,0.06)]" 
                          : "w-[calc(30%-6px)] bg-[#fafafa] border-[#e5e7eb] scale-95 opacity-60"
                        } border rounded-[10px] p-[16px] lg:p-[20px]`}
                      >
                        <span className="block text-[10px] font-[700] font-mono text-[#9ca3af] mb-[8px]">PERINGATAN DINI</span>
                        <h4 className="text-[13px] lg:text-[14px] font-[600] text-[#0a0a0a] line-clamp-2 leading-snug">{v.item.judul}</h4>
                        <p className="text-[11px] lg:text-[12px] text-[#6b7280] line-clamp-2 mt-[6px]">{v.item.deskripsi}</p>
                        <div className="text-[10px] lg:text-[11px] text-[#9ca3af] font-mono mt-[8px] uppercase">{v.item.waktu}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {warnings.length > 0 && (
              <div className="flex gap-[8px] justify-center mt-[16px]">
                <button 
                  onClick={() => setActiveIndex((activeIndex - 1 + warnings.length) % warnings.length)}
                  className="w-[32px] h-[32px] rounded-full border border-[#e5e7eb] bg-white hover:bg-[#f9fafb] flex items-center justify-center transition-colors"
                >
                  <svg className="w-[14px] h-[14px] text-[#374151]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button 
                  onClick={() => setActiveIndex((activeIndex + 1) % warnings.length)}
                  className="w-[32px] h-[32px] rounded-full border border-[#e5e7eb] bg-white hover:bg-[#f9fafb] flex items-center justify-center transition-colors"
                >
                  <svg className="w-[14px] h-[14px] text-[#374151]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            )}
            
            <p className="text-[11px] text-[#9ca3af] font-mono mt-[12px]">
              Peringatan dini dari BMKG Nowcast — diperbarui setiap saat
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
