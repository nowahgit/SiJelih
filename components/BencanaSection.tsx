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

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const provinceToAdm4: Record<string, string> = {
    "Aceh": "11.71.01.1001",
    "Sumatera Utara": "12.71.01.1001",
    "Sumatera Barat": "13.71.01.1001",
    "Riau": "14.71.01.1001",
    "Jambi": "15.71.01.1001",
    "Sumatera Selatan": "16.71.01.1001",
    "Bengkulu": "17.71.01.1001",
    "Lampung": "18.71.01.1001",
    "Kepulauan Bangka Belitung": "19.71.01.1001",
    "Kepulauan Riau": "21.71.01.1001",
    "DKI Jakarta": "31.71.01.1001",
    "Daerah Khusus Ibukota Jakarta": "31.71.01.1001",
    "Jawa Barat": "32.73.08.1001",
    "Jawa Tengah": "33.74.07.1001",
    "DI Yogyakarta": "34.71.04.1001",
    "Daerah Istimewa Yogyakarta": "34.71.04.1001",
    "Jawa Timur": "35.78.15.1001",
    "Banten": "36.73.01.1001",
    "Bali": "51.71.01.1001",
    "Nusa Tenggara Barat": "52.71.01.1001",
    "Nusa Tenggara Timur": "53.71.01.1001",
    "Kalimantan Barat": "61.71.01.1001",
    "Kalimantan Tengah": "62.71.01.1001",
    "Kalimantan Selatan": "63.71.01.1001",
    "Kalimantan Timur": "64.72.01.1001",
    "Kalimantan Utara": "65.71.01.1001",
    "Sulawesi Utara": "71.71.01.1001",
    "Sulawesi Tengah": "72.71.01.1001",
    "Sulawesi Selatan": "73.71.01.1001",
    "Sulawesi Tenggara": "74.71.01.1001",
    "Gorontalo": "75.71.01.1001",
    "Sulawesi Barat": "76.02.01.1001",
    "Maluku": "81.71.01.1001",
    "Maluku Utara": "82.71.01.1001",
    "Papua": "91.71.01.1001",
    "Papua Barat": "92.71.01.1001",
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError("");
    
    try {
      const { geoSearch, searchAdm4Code } = await import("@/lib/bmkg");
      
      const nomData = await geoSearch(searchQuery);

      if (!nomData || nomData.length === 0) {
        setSearchError("Wilayah tidak ditemukan");
        setSearchLoading(false);
        return;
      }

      const location = nomData[0];
      const lat = parseFloat(location.lat);
      const lon = parseFloat(location.lon);
      const displayName = location.display_name;
      const isIndonesia = location.address?.country_code === "id";
      const province = location.address?.state || "";
      
      const bmkgBase = await getLatestBMKGData();
      
      let weather = null;
      let closestGempa = bmkgBase?.autoGempa;
      let distance = null;
      let weatherFallback = false;
      let aiFoundCode = false;

      if (isIndonesia) {
        if (bmkgBase?.gempaDirasakan?.length > 0) {
          let minDistance = Infinity;
          bmkgBase.gempaDirasakan.forEach((g: any) => {
            const [gLat, gLon] = g.Coordinates.split(",").map(parseFloat);
            const dist = getDistance(lat, lon, gLat, gLon);
            if (dist < minDistance) {
              minDistance = dist;
              closestGempa = g;
              distance = dist;
            }
          });
        }

        // Mencari kode ADM4 (Kelurahan) secara presisi menggunakan AI
      const adm4Code = await searchAdm4Code({
        address: {
          village: location.address?.village || location.address?.suburb || location.address?.neighbourhood || "",
          city_district: location.address?.city_district || location.address?.town || "",
          city: location.address?.city || location.address?.county || "",
          state: location.address?.state || ""
        }
      });
      
      if (adm4Code) {
        weather = await getWeatherForecast(adm4Code);
        if (weather && weather.length > 0) aiFoundCode = true;
      }

      if (!weather || weather.length === 0) {
        const fallbackCode = provinceToAdm4[province];
        if (fallbackCode) {
          weather = await getWeatherForecast(fallbackCode);
          weatherFallback = true;
        }
      }
  }

      setSearchResult({
        wilayah: displayName.split(",")[0],
        displayName: displayName,
        isIndonesia,
        lat,
        lon,
        weather: weather,
        weatherFallback,
        aiFoundCode,
        bmkg: {
          ...bmkgBase,
          closestGempa,
          distance
        }
      });

    } catch (err) {
      console.error(err);
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
                  <span className="text-[13px] text-[#9ca3af] mt-[12px]">Menganalisis wilayah & cuaca...</span>
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
                      <span className="text-[10px] font-[700] font-mono text-[#9ca3af]">LOKASI PENCARIAN</span>
                      <span className="text-[10px] font-[600] font-mono bg-[#f3f4f6] text-[#6b7280] px-[8px] py-[2px] rounded-[4px] uppercase">{searchResult.isIndonesia ? "Indonesia" : "International"}</span>
                    </div>
                    <div>
                      <div className="text-[15px] font-[600] text-[#0a0a0a] line-clamp-1">{searchResult.wilayah}</div>
                      <div className="text-[12px] text-[#6b7280] line-clamp-1 mt-0.5">{searchResult.displayName}</div>
                      <div className="text-[11px] text-[#9ca3af] font-mono mt-2 uppercase">
                        LAT: {searchResult.lat.toFixed(4)} | LON: {searchResult.lon.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-[#e5e7eb] rounded-[8px] p-[16px_20px]">
                    <div className="flex justify-between items-center mb-[12px]">
                      <span className="text-[10px] font-[700] font-mono text-[#9ca3af]">PRAKIRAAN CUACA BESOK</span>
                      <div className="flex gap-2">
                        {searchResult.aiFoundCode && (
                          <span className="text-[9px] font-[700] font-mono bg-blue-50 text-blue-600 border border-blue-100 px-[8px] py-[2px] rounded-[4px]">PRECISE AI</span>
                        )}
                        <span className="text-[10px] font-[600] font-mono bg-[#f3f4f6] text-[#6b7280] px-[8px] py-[2px] rounded-[4px]">BMKG</span>
                      </div>
                    </div>
                    {searchResult.isIndonesia ? (
                      searchResult.weather && searchResult.weather.length > 3 ? (
                        <div>
                          {searchResult.weatherFallback && (
                            <div className="text-[9px] font-[700] text-[#f59e0b] bg-[#fffbeb] border border-[#fef3c7] px-2 py-0.5 rounded-full mb-2 inline-block">
                              DATA DARI IBU KOTA PROVINSI (FALLBACK)
                            </div>
                          )}
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
                        <div className="text-[13px] text-[#9ca3af] py-2 italic font-mono uppercase tracking-tighter">
                          CUACA TIDAK TERSEDIA (ADM4 ERR)
                        </div>
                      )
                    ) : (
                      <div className="text-[13px] text-[#9ca3af] py-2">
                        Prakiraan cuaca BMKG hanya tersedia untuk wilayah Indonesia.
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-[#e5e7eb] rounded-[8px] p-[16px_20px]">
                    <div className="flex justify-between items-center mb-[12px]">
                      <span className="text-[10px] font-[700] font-mono text-[#9ca3af]">GEMPA TERDEKAT DARI LOKASI</span>
                      <span className="text-[10px] font-[600] font-mono bg-[#f3f4f6] text-[#6b7280] px-[8px] py-[2px] rounded-[4px]">BMKG</span>
                    </div>

                    {searchResult.bmkg?.closestGempa ? (
                      <div>
                        {searchResult.bmkg.distance !== null && (
                        <div className="text-[11px] font-[700] text-[#2563eb] font-mono mb-2">
                          JARAK: {Math.round(searchResult.bmkg.distance)} KM DARI TITIK CARI
                        </div>
                        )}
                        <div className="flex items-center gap-3">
                          <div className="text-[28px] font-[800] text-[#0a0a0a] tracking-tight">M{searchResult.bmkg?.closestGempa?.Magnitude}</div>
                          <div className="flex gap-2">
                            {parseFloat(searchResult.bmkg?.closestGempa?.Magnitude) >= 5.0 && (
                              <span className="bg-[#fee2e2] text-[#991b1b] border border-[#fecaca] text-[10px] font-[700] font-mono px-[8px] py-[2px] rounded-[4px]">SIGNIFIKAN</span>
                            )}
                          </div>
                        </div>
                        <div className="text-[13px] text-[#374151] mt-1 line-clamp-1">{searchResult.bmkg?.closestGempa?.Wilayah}</div>
                        <div className="text-[12px] text-[#6b7280] font-mono mt-2 uppercase">
                          {searchResult.bmkg?.closestGempa?.Kedalaman} | {searchResult.bmkg?.closestGempa?.Tanggal} {searchResult.bmkg?.closestGempa?.Jam}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[13px] text-[#9ca3af] py-2">Data gempa tidak tersedia</div>
                    )}
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
          </div>
        </div>

        <p className="text-[11px] text-[#9ca3af] font-mono mt-12 text-center">
          Data bersumber dari BMKG — Badan Meteorologi, Klimatologi, dan Geofisika & Nowcast
        </p>
      </div>
    </section>
  );
}
