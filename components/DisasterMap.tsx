"use client";
import { useEffect, useState, useRef } from "react";

interface Gempa {
  Tanggal: string;
  Jam: string;
  DateTime: string;
  Magnitude: string;
  Kedalaman: string;
  Lintang: string;
  Bujur: string;
  Wilayah: string;
  Potensi: string;
}

export default function DisasterMap({ height = 400, mapId = "disaster-map" }: { height?: number; mapId?: string }) {
  const [gempaList, setGempaList] = useState<Gempa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const fetchGempa = async () => {
      try {
        const res = await fetch("https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json");
        const data = await res.json();
        setGempaList(data.Infogempa.gempa);
      } catch (err) {
        setError("Gagal memuat data gempa");
      } finally {
        setLoading(false);
      }
    };

    const injectLeaflet = () => {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      const existingScript = document.getElementById("leaflet-js") as HTMLScriptElement;
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => setMapInitialized(true);
        document.head.appendChild(script);
      } else {
        if ((window as any).L) {
          setMapInitialized(true);
        } else {
          existingScript.addEventListener("load", () => setMapInitialized(true));
        }
      }
    };

    fetchGempa();
    if (typeof window !== "undefined") {
      injectLeaflet();
    }
  }, []);

  useEffect(() => {
    if (!mapInitialized || gempaList.length === 0 || typeof window === "undefined") return;
    if (!(window as any).L) return;

    const L = (window as any).L;
    const mapContainer = document.getElementById(mapId);
    if (!mapContainer || mapRef.current) return;

    const map = L.map(mapId).setView([-2.5, 118], 5);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "OpenStreetMap",
    }).addTo(map);

    gempaList.forEach((gempa) => {
      const latRaw = gempa.Lintang;
      const lonRaw = gempa.Bujur;
      const lat = parseFloat(latRaw.replace(/[^\d.-]/g, "")) * (latRaw.includes("LS") ? -1 : 1);
      const lon = parseFloat(lonRaw.replace(/[^\d.-]/g, ""));
      const mag = parseFloat(gempa.Magnitude);

      let radius = 6;
      let color = "#3b82f6";

      if (mag >= 7) {
        radius = 24;
        color = "#7c3aed";
      } else if (mag >= 6) {
        radius = 16;
        color = "#ef4444";
      } else if (mag >= 5) {
        radius = 10;
        color = "#f59e0b";
      }

      const marker = L.circleMarker([lat, lon], {
        radius,
        fillColor: color,
        color: "#ffffff",
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.7,
      }).addTo(map);

      const popupHtml = `
        <div class="flex flex-col gap-1">
          <div class="text-[16px] font-bold">M${gempa.Magnitude}</div>
          <div class="text-[13px] mt-1">${gempa.Wilayah}</div>
          <div class="text-[12px] text-[#6b7280]">${gempa.Kedalaman} • ${gempa.Tanggal} ${gempa.Jam}</div>
          ${gempa.Potensi.toLowerCase().includes("tsunami") ? `<div class="text-[11px] font-bold text-red-600 mt-1">BERPOTENSI TSUNAMI</div>` : ""}
        </div>
      `;

      marker.bindPopup(popupHtml);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapInitialized, gempaList, mapId]);

  if (typeof window === "undefined") {
    return <div className={`w-full bg-gray-100 animate-pulse rounded-lg ${height === 300 ? "h-[300px]" : "h-[400px]"}`}></div>;
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[11px] font-bold tracking-wider text-[#9ca3af] font-mono">PETA GEMPA REAL-TIME</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[11px] font-mono text-[#6b7280]">Live · BMKG M5.0+</span>
        </div>
      </div>

      <div className={`relative w-full rounded-lg overflow-hidden border border-[#e5e7eb] z-0 ${height === 300 ? "h-[300px]" : "h-[400px]"}`}>
        <div id={mapId} className="w-full h-full z-0"></div>
        {loading && (
          <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-10">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-[13px] text-[#6b7280] mt-3">Memuat data gempa BMKG...</span>
          </div>
        )}
      </div>

      <div className="flex gap-4 flex-wrap mt-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
          <span className="text-[11px] text-[#6b7280] font-mono">M &lt; 5</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
          <span className="text-[11px] text-[#6b7280] font-mono">M 5-6</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
          <span className="text-[11px] text-[#6b7280] font-mono">M 6-7</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#7c3aed]"></div>
          <span className="text-[11px] text-[#6b7280] font-mono">M &gt;= 7</span>
        </div>
      </div>

      <p className="text-[11px] text-[#9ca3af] font-mono">
        Data 15 gempa M5.0+ terkini · Diperbarui setiap ada peristiwa gempa · Sumber: BMKG
      </p>
    </div>
  );
}
