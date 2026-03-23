"use client";
export const dynamic = "force-dynamic";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import VerifyCard from "@/components/VerifyCard";
import GempaAlert from "@/components/GempaAlert";
import DisasterMap from "@/components/DisasterMap";
import { collection, doc, setDoc, query, orderBy, getDocs } from "firebase/firestore";
import { getLatestBMKGData } from "@/lib/bmkg";
import { signOut } from "firebase/auth";
import LoadingScreen from "@/components/LoadingScreen";
import { useToast } from "@/hooks/useToast";
import Dialog from "@/components/Dialog";
import PageTransition from "@/components/PageTransition";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { SkeletonVerifyResult } from "@/components/ui/SkeletonVerifyResult";
import { SkeletonDashboardPanel } from "@/components/ui/SkeletonDashboardPanel";
import { SkeletonProfile } from "@/components/ui/SkeletonProfile";

export default function DashboardPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const { toast } = useToast();
  const router = useRouter();

  const [activeMenu, setActiveMenu] = useState<"verifikasi" | "histori" | "profil">("verifikasi");
  const [histori, setHistori] = useState<any[]>([]);
  const [loadingHistori, setLoadingHistori] = useState(true);

  const [activeTab, setActiveTab] = useState<"text" | "photo">("text");
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isMicSupported, setIsMicSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const [kodeWilayah, setKodeWilayah] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingObj, setSavingObj] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logoutConfirmCtx, setLogoutConfirmCtx] = useState(false);
  const [extractedTextOpen, setExtractedTextOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [geoResult, setGeoResult] = useState<any>(null);

  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [hasNewHistory, setHasNewHistory] = useState(false);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [emergencyResult, setEmergencyResult] = useState<any>(null);
  const emergencyTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!loadingAuth && !user) router.push("/login");
  }, [user, loadingAuth, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsMicSupported(false);
        return;
      }
      if (!document.getElementById("mic-pulse-style")) {
        const style = document.createElement("style");
        style.id = "mic-pulse-style";
        style.textContent = `
          @keyframes pulse-mic {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          .animate-pulse-mic {
            animation: pulse-mic 1.2s infinite;
          }
        `;
        document.head.appendChild(style);
      }
      if (!document.getElementById("safe-area-style")) {
        const style = document.createElement("style");
        style.id = "safe-area-style";
        style.textContent = `
          .bottom-nav-safe-padding {
            padding-bottom: env(safe-area-inset-bottom);
          }
        `;
        document.head.appendChild(style);
      }
      const recognition = new SpeechRecognition();
      recognition.lang = "id-ID";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
          else interim += event.results[i][0].transcript;
        }
        if (final) setText((prev) => prev + (prev ? " " : "") + final);
        setInterimTranscript(interim);
      };
      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
      };
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
      return () => { if (recognitionRef.current) recognitionRef.current.abort(); };
    }
  }, []);

  useEffect(() => {
    async function fetchHistori() {
      if (!user) return;
      try {
        const historyRef = collection(db, "verifications", user.uid, "history");
        const q = query(historyRef, orderBy("savedAt", "desc"));
        const snapshot = await getDocs(q);
        const data: any[] = [];
        snapshot.forEach((d) => data.push({ id: d.id, ...d.data() }));
        setHistori(data);
      } catch {
      } finally {
        setLoadingHistori(false);
      }
    }
    fetchHistori();
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isEmergencyMode) setIsEmergencyMode(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEmergencyMode]);

  useEffect(() => {
    if (isEmergencyMode) {
      handleGeolocation();
      if (!isListening) {
        recognitionRef.current?.start();
        setIsListening(true);
      }
      setTimeout(() => emergencyTextareaRef.current?.focus(), 100);
    }
  }, [isEmergencyMode]);

  if (loadingAuth || !user) return <LoadingScreen isVisible={true} />;

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGeolocation = () => {
    setGeoLoading(true); setGeoError(""); setGeoResult(null);
    if (!navigator.geolocation) {
      setGeoError("Geolocation tidak didukung oleh browser Anda.");
      setGeoLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          const nomData = await nomRes.json();
          const loc = nomData?.address?.suburb || nomData?.address?.city_district || "";
          if (loc) setKodeWilayah(loc);
          const bmkgData = await getLatestBMKGData();
          const lastQuake = bmkgData?.autoGempa;
          let distanceKm = 0;
          if (lastQuake?.Coordinates) {
            const [qLat, qLon] = lastQuake.Coordinates.split(",").map(Number);
            distanceKm = calculateDistance(lat, lon, qLat, qLon);
          }
          let weather = null;
          try {
            const wRes = await fetch(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${loc}`);
            const wData = await wRes.json();
            weather = wData?.data?.[0]?.cuaca?.[0]?.[0] || null;
          } catch {}
          setGeoResult({ location: loc || "Lokasi Anda", weather, lastQuake, distanceKm });
        } catch {
          setGeoError("Gagal mengambil data lokasi.");
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        setGeoError("Izin lokasi ditolak. Masukkan kode wilayah secara manual.");
        setGeoLoading(false);
      }
    );
  };

  const handleVerify = async () => {
    if (activeTab === "text" && text.length < 10) return;
    if (activeTab === "photo" && !imageFile) return;
    setLoading(true); setResult(null);
    try {
      let data;
      if (activeTab === "text") {
        const res = await fetch("/api/verify", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, kodeWilayah }),
        });
        data = await res.json();
      } else {
        const res = await fetch("/api/verify-image", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: imagePreview?.split(",")[1], mimeType: imageFile?.type, kodeWilayah }),
        });
        data = await res.json();
      }
      setResult(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHistori = async () => {
    if (!result || !user) return;
    setSavingObj(true);
    try {
      const historyRef = collection(db, "verifications", user.uid, "history");
      const docRef = doc(historyRef);
      const newEntry = { ...result, savedAt: new Date().toISOString(), id: docRef.id };
      await setDoc(docRef, newEntry);
      setHistori([newEntry, ...histori]);
      if (!isPanelOpen) setHasNewHistory(true);
      toast("Berhasil disimpan ke histori", "success");
    } catch {
      toast("Gagal menyimpan histori", "error");
    } finally {
      setSavingObj(false);
    }
  };

  const getRelativeTime = (isoString: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(isoString).getTime()) / 60000);
    if (diff < 1) return "Baru saja";
    if (diff < 60) return `${diff} menit lalu`;
    if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
    return `${Math.floor(diff / 1440)} hari lalu`;
  };

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
    if (conf >= 95) return "w-full"; if (conf >= 85) return "w-11/12"; if (conf >= 75) return "w-4/5";
    if (conf >= 65) return "w-2/3"; if (conf >= 55) return "w-7/12"; if (conf >= 45) return "w-1/2";
    if (conf >= 35) return "w-5/12"; if (conf >= 25) return "w-1/3"; if (conf >= 15) return "w-1/4";
    if (conf >= 5) return "w-2/12"; return "w-1/12";
  };

  return (
    <div className="flex h-screen bg-[#f9fafb] flex-col lg:flex-row overflow-x-hidden font-sans text-[#111827] gap-0">
      <aside className="hidden lg:flex flex-col w-[256px] bg-[#111827] text-[#9ca3af] flex-shrink-0 relative h-full overflow-hidden border-none shrink-0">
        <div className="p-[20px_16px] border-b border-[#1f2937] flex items-center justify-between">
          <img src="/image/LOGO_WHITE.png" alt="SiJelih" className="h-[44px] w-auto" />
        </div>
        <nav className="flex-1 flex flex-col gap-1 p-[12px] overflow-y-auto">
          <div className="text-[11px] font-[500] tracking-wider text-[#4b5563] uppercase px-[12px] mb-1 mt-2">Menu</div>
          <button onClick={() => setActiveMenu("verifikasi")} className={`flex items-center gap-3 px-[12px] py-[8px] rounded-[6px] transition-colors duration-150 text-[13px] font-[500] ${activeMenu === "verifikasi" ? "bg-[#1d4ed8] text-white" : "hover:bg-[#1f2937] hover:text-white"}`}>
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span>Verifikasi</span>
          </button>
          <button onClick={() => setActiveMenu("histori")} className={`flex items-center gap-3 px-[12px] py-[8px] rounded-[6px] transition-colors duration-150 text-[13px] font-[500] ${activeMenu === "histori" ? "bg-[#1d4ed8] text-white" : "hover:bg-[#1f2937] hover:text-white"}`}>
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
            <span>Histori</span>
          </button>
          <button onClick={() => router.push("/dashboard/simulasi")} className="flex items-center gap-3 px-[12px] py-[8px] rounded-[6px] transition-colors duration-150 text-[13px] font-[500] hover:bg-[#1f2937] hover:text-white">
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Simulasi</span>
          </button>
          <button onClick={() => router.push("/dashboard/massal")} className="flex items-center gap-3 px-[12px] py-[8px] rounded-[6px] transition-colors duration-150 text-[13px] font-[500] hover:bg-[#1f2937] hover:text-white">
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 12H3"/><path d="M16 6H3"/><path d="M16 18H3"/><path d="M19 10v6"/><path d="M16 13h6"/></svg>
            <span>Massal</span>
          </button>
          <div className="text-[11px] font-[500] tracking-wider text-[#4b5563] uppercase px-[12px] mb-1 mt-6">Akun</div>
          <button onClick={() => setActiveMenu("profil")} className={`flex items-center gap-3 px-[12px] py-[8px] rounded-[6px] transition-colors duration-150 text-[13px] font-[500] ${activeMenu === "profil" ? "bg-[#1d4ed8] text-white" : "hover:bg-[#1f2937] hover:text-white"}`}>
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Profil</span>
          </button>
        </nav>
        <div className="p-4 border-t border-[#1f2937]">
          <button onClick={() => setLogoutConfirmCtx(true)} className="w-full flex items-center gap-3 px-[12px] py-[8px] text-[13px] font-[500] text-[#ef4444] hover:bg-[#1f2937] hover:text-[#f87171] rounded-[6px] transition-colors duration-150">
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <Dialog isOpen={logoutConfirmCtx} onClose={() => setLogoutConfirmCtx(false)} title="Konfirmasi Keluar" size="sm">
        <p className="text-[14px] text-[#4b5563] mb-[20px]">Apakah Anda yakin ingin keluar dari SiJelih?</p>
        <div className="flex justify-end gap-[10px]">
          <button onClick={() => setLogoutConfirmCtx(false)} className="bg-white border border-[#d1d5db] text-[#374151] px-[16px] py-[8px] rounded-[6px] text-[13px] font-[600] hover:bg-[#f9fafb] transition-colors">Batal</button>
          <button onClick={() => { setLogoutConfirmCtx(false); signOut(auth); }} className="bg-[#ef4444] text-white px-[16px] py-[8px] rounded-[6px] text-[13px] font-[600] hover:bg-[#dc2626] transition-colors">Keluar</button>
        </div>
      </Dialog>

      <div className="flex-1 flex flex-col min-w-0 bg-[#f9fafb]">
        <header className="h-[56px] min-h-[56px] bg-white border-b border-[#e5e7eb] px-[24px] flex items-center justify-between flex-shrink-0 z-10 transition-colors duration-150">
          <div className="hidden lg:flex text-[13px] text-[#6b7280]">
            Dashboard <span className="mx-1">/</span> <span className="capitalize">{activeMenu}</span>
          </div>
          <button onClick={() => setIsEmergencyMode(!isEmergencyMode)} className={`${isEmergencyMode ? "bg-[#374151]" : "bg-[#dc2626] hover:bg-[#b91c1c]"} text-white text-[11px] lg:text-[12px] font-[700] px-3 py-1.5 lg:px-[14px] lg:py-[6px] rounded-[6px] font-mono tracking-wider transition-colors`}>
            {isEmergencyMode ? "KELUAR DARURAT" : "DARURAT"}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-[500] text-[#374151] hidden sm:block">{user.displayName}</span>
            <img src={user.photoURL || ""} alt="Avatar" referrerPolicy="no-referrer" className="w-[32px] h-[32px] rounded-full object-cover shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#e5e7eb]" />
          </div>
        </header>

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto scroll-smooth">
          <PageTransition>
            {activeMenu === "verifikasi" && <GempaAlert />}
            <div className="p-4 lg:p-[24px] flex flex-col w-full max-w-5xl mx-auto pb-28 lg:pb-8">

              {activeMenu === "verifikasi" && (
                <div className="flex flex-col gap-4 lg:gap-6 w-full">
                  <div className="bg-white p-4 lg:p-[20px] rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#e5e7eb] flex flex-col gap-5">
                    <h1 className="text-[18px] font-[600] text-[#111827] mb-4">Verifikasi Informasi</h1>
                    <div className="flex border-b border-[#e5e7eb] gap-4">
                      <button onClick={() => setActiveTab("text")} className={`py-2 px-3 lg:pb-2 lg:px-0 text-[13px] font-[500] transition-colors duration-150 ${activeTab === "text" ? "border-b-2 border-[#1d4ed8] text-[#1d4ed8]" : "text-[#6b7280] hover:text-[#374151]"}`}>Pesan Teks</button>
                      <button onClick={() => setActiveTab("photo")} className={`py-2 px-3 lg:pb-2 lg:px-0 text-[13px] font-[500] transition-colors duration-150 ${activeTab === "photo" ? "border-b-2 border-[#1d4ed8] text-[#1d4ed8]" : "text-[#6b7280] hover:text-[#374151]"}`}>Gambar & Foto</button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-[500] text-[#374151]">{activeTab === "text" ? "Teks Verifikasi" : "Unggah Gambar"}</label>
                      {activeTab === "text" && (
                        <div className="relative">
                          <div className={`relative bg-white border rounded-[6px] transition-all duration-150 overflow-hidden ${isListening ? "border-[#fca5a5] ring-[2px] ring-[#fee2e2]" : "border-[#d1d5db] focus-within:ring-[2px] focus-within:ring-[#3b82f6] focus-within:border-transparent"}`}>
                            <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full bg-transparent p-[8px_12px] h-40 lg:h-32 resize-none focus:outline-none transition-colors duration-150 text-[14px] placeholder-[#9ca3af] relative z-20 leading-[1.6]" placeholder="Paste informasi atau berita bencana yang ingin kamu verifikasi..." />
                            {isListening && interimTranscript && (
                              <div className="absolute top-0 left-0 w-full h-32 p-[8px_12px] text-[14px] pointer-events-none whitespace-pre-wrap leading-[1.6] z-10">
                                <span className="text-transparent">{text}</span>
                                <span className="text-[#9ca3af] italic">{interimTranscript}</span>
                              </div>
                            )}
                            {isMicSupported && (
                              <div className="absolute bottom-3 right-3 z-30">
                                <div className="relative">
                                  {isListening && <div className="absolute inset-0 rounded-full border-[1.5px] border-[#fca5a5] animate-pulse-mic"></div>}
                                  <button onClick={() => { if (isListening) recognitionRef.current?.stop(); else { recognitionRef.current?.start(); setIsListening(true); } }} title={isListening ? "Klik untuk berhenti" : "Verifikasi dengan suara"} className={`w-[32px] h-[32px] rounded-full border flex items-center justify-center cursor-pointer transition-colors relative z-10 ${isListening ? "bg-[#fee2e2] border-[#fecaca] hover:bg-[#fecaca]" : "bg-[#f3f4f6] border-[#e5e7eb] hover:bg-[#e5e7eb]"}`}>
                                    <svg className={`w-[14px] h-[14px] ${isListening ? "text-[#dc2626]" : "text-[#6b7280]"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                      <line x1="12" x2="12" y1="19" y2="22"></line>
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          {isListening && <div className="absolute -bottom-5 left-0 text-[11px] font-mono text-[#dc2626] animate-pulse">Mendengarkan...</div>}
                        </div>
                      )}
                      {activeTab === "photo" && (
                        <div className="flex flex-col gap-3">
                          <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                          {!imagePreview ? (
                            <div onClick={() => fileInputRef.current?.click()} className="border-[1.5px] border-dashed border-[#d1d5db] rounded-[6px] p-[32px] text-center text-[#6b7280] text-[13px] font-[500] cursor-pointer hover:bg-[#f9fafb] transition-colors duration-150">Ambil foto atau pilih gambar file</div>
                          ) : (
                            <div className="flex flex-col items-start gap-3">
                              <img src={imagePreview} alt="Preview" className="w-full max-w-sm max-h-[240px] object-contain rounded-[6px] border border-[#d1d5db] bg-[#f9fafb]" />
                              <button onClick={() => { setImagePreview(null); setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-[13px] font-[500] text-[#374151] bg-white border border-[#d1d5db] hover:bg-[#f9fafb] px-[12px] py-[6px] rounded-[6px] transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">Ganti Foto</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-[500] text-[#374151]">Kode Wilayah Administratif</label>
                      <input value={kodeWilayah} onChange={(e) => setKodeWilayah(e.target.value)} type="text" className="w-full bg-white border border-[#d1d5db] rounded-[6px] p-[8px_12px] h-11 lg:h-auto focus:outline-none focus:ring-[2px] focus:ring-[#3b82f6] focus:border-transparent transition-colors duration-150 text-[14px] placeholder-[#9ca3af]" placeholder="Opsional (contoh: 33.72.01.1001)" />
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="bg-white border border-[#d1d5db] rounded-[6px] p-[16px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <span className="text-[13px] font-[500] text-[#374151]">Cek status bahaya di lokasi saya sekarang</span>
                        <button onClick={handleGeolocation} disabled={geoLoading} className="bg-white border border-[#d1d5db] text-[#374151] hover:bg-[#f9fafb] px-[16px] py-[8px] rounded-[6px] font-[500] text-[14px] transition-colors duration-150 disabled:opacity-50 whitespace-nowrap shadow-[0_1px_2px_rgba(0,0,0,0.05)] w-full md:w-auto">
                          {geoLoading ? "Mendeteksi lokasi..." : "Gunakan Lokasi Saya"}
                        </button>
                      </div>
                      {geoError && <span className="text-[#ef4444] text-[13px] mt-1">{geoError}</span>}
                      {geoResult && (
                        <div className="bg-[#f9fafb] border border-[#d1d5db] rounded-[6px] p-[12px] text-[13px] text-[#374151] flex flex-col gap-1.5">
                          <div className="font-[600] text-[#111827]">Lokasi: {geoResult.location}</div>
                          {geoResult.weather && <div>Cuaca saat ini: {geoResult.weather.weather_desc}, {geoResult.weather.t}°C</div>}
                          {geoResult.lastQuake && <div className="text-[#991b1b] font-[500]">Gempa terakhir: M{geoResult.lastQuake.Magnitude} di {geoResult.lastQuake.Wilayah} ({geoResult.distanceKm} km dari lokasi)</div>}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-start md:justify-end mt-2 pt-5 border-t border-[#e5e7eb]">
                      <button onClick={handleVerify} disabled={loading || (activeTab === "text" ? text.length < 10 : !imageFile)} className="bg-[#1d4ed8] hover:bg-[#1e40af] disabled:bg-[#d1d5db] disabled:hover:bg-[#d1d5db] text-white px-[16px] py-3 lg:py-[8px] rounded-[6px] font-[500] text-[14px] transition-colors duration-150 flex items-center justify-center w-full lg:min-w-[200px] lg:w-auto shadow-[0_1px_2px_rgba(0,0,0,0.05)] disabled:opacity-75 disabled:cursor-not-allowed">
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-[14px] h-[14px] border-[1.5px] border-white border-t-transparent rounded-full animate-spin"></div>
                            Memverifikasi...
                          </div>
                        ) : "Verifikasi Sekarang"}
                      </button>
                    </div>
                  </div>

                  {loading && <SkeletonVerifyResult />}

                  {result && !result.error && !loading && (
                    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <VerifyCard result={result} />
                      {activeTab === "photo" && result.extractedText && (
                        <div className="bg-white border border-[#e5e7eb] rounded-[8px] p-[16px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                          <button onClick={() => setExtractedTextOpen(!extractedTextOpen)} className="w-full flex justify-between items-center font-[500] text-[#374151] text-[13px] hover:text-[#111827] transition-colors duration-150">
                            Teks terdeteksi dari gambar <span className="text-[#6b7280] font-normal">{extractedTextOpen ? "Sembunyikan" : "Tampilkan"}</span>
                          </button>
                          {extractedTextOpen && <div className="mt-3 text-[13px] text-[#4b5563] border-t border-[#e5e7eb] pt-3 whitespace-pre-wrap leading-relaxed">{result.extractedText}</div>}
                        </div>
                      )}
                      <button onClick={handleSaveHistori} disabled={savingObj} className="bg-white flex justify-center border border-[#d1d5db] hover:bg-[#f9fafb] text-[#374151] px-[16px] py-3 lg:py-[8px] rounded-[6px] font-[500] text-[14px] transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.05)] w-full disabled:opacity-75 disabled:cursor-not-allowed">
                        {savingObj ? (
                          <div className="flex items-center gap-2">
                            <div className="w-[14px] h-[14px] border-[1.5px] border-current border-t-transparent rounded-full animate-spin"></div>
                            Menyimpan...
                          </div>
                        ) : "Simpan ke Histori"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeMenu === "histori" && (
                <div className="flex flex-col gap-4 lg:gap-6 w-full">
                  <h1 className="text-[18px] font-[600] text-[#111827] mb-4">Histori Verifikasi</h1>
                  <div className="mb-6 border-b border-[#e5e7eb] pb-8">
                    <DisasterMap height={300} mapId="disaster-map-dashboard" />
                  </div>
                  {loadingHistori ? (
                    <div className="flex flex-col gap-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
                  ) : histori.length === 0 ? (
                    <div className="bg-white p-[32px] rounded-[8px] border border-[#e5e7eb] text-center text-[#6b7280] text-[13px] font-[500] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">Belum ada riwayat verifikasi</div>
                  ) : (
                    <div className="flex flex-col gap-3 lg:gap-4">
                      {histori.map((item) => {
                        const txt = item.inputText || item.extractedText || "Verifikasi via foto";
                        return (
                          <div key={item.id} className="bg-white p-4 lg:p-[20px] rounded-[8px] border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col gap-3 active:scale-[0.99] transition-transform duration-75">
                            <div className="flex justify-between items-start">
                              <span className={`px-[8px] py-[2px] rounded-[4px] text-xs lg:text-[11px] font-[600] border overflow-hidden text-ellipsis max-w-[160px] ${getBadgeClass(item.verdict)}`}>{item.verdict}</span>
                              <span className="text-[12px] text-[#6b7280]">{new Date(item.savedAt).toLocaleString("id-ID")}</span>
                            </div>
                            <p className="text-[14px] text-[#374151] italic leading-relaxed">"{txt.length > 120 ? txt.substring(0, 120) + "..." : txt}"</p>
                            <p className="text-[13px] text-[#6b7280] mt-1 line-clamp-2">{item.alasan}</p>
                            <div className="flex flex-col gap-1 mt-3">
                              <div className="flex justify-between text-[11px] font-[600] text-[#6b7280]"><span>Tingkat Kepercayaan</span><span>{item.confidence}%</span></div>
                              <div className="w-full bg-[#f3f4f6] rounded-[4px] h-[6px]"><div className={`h-[6px] rounded-[4px] ${getProgressColor(item.verdict)} ${getProgressWidthClass(item.confidence)}`}></div></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeMenu === "profil" && (
                <div className="flex flex-col gap-4 lg:gap-6 w-full">
                  <h1 className="text-[18px] font-[600] text-[#111827] mb-4">Profil & Statistik Akun</h1>
                  {loadingHistori ? (
                    <SkeletonProfile />
                  ) : (
                    <>
                      <div className="bg-white p-[20px] rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#e5e7eb] flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                        <img src={user.photoURL || ""} alt="Avatar" referrerPolicy="no-referrer" className="w-[80px] h-[80px] rounded-full bg-[#f3f4f6] object-cover border border-[#e5e7eb]" />
                        <div className="flex flex-col gap-1 items-center sm:items-start flex-1 w-full justify-center h-full pt-2">
                          <h2 className="text-[16px] font-[600] text-[#111827]">{user.displayName}</h2>
                          <p className="text-[#6b7280] text-[13px]">{user.email}</p>
                          <p className="text-[#9ca3af] text-[12px] mt-1">Bergabung: {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString("id-ID") : "-"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        <div className="bg-white p-[16px_20px] rounded-[8px] border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"><p className="text-[24px] font-[700] text-[#111827]">{histori.length}</p><p className="text-[12px] text-[#6b7280] mt-1 font-[500]">VERIFIKASI TOTAL</p></div>
                        <div className="bg-white p-[16px_20px] rounded-[8px] border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"><p className="text-[24px] font-[700] text-[#166534]">{histori.filter((i) => i.verdict === "TERKONFIRMASI").length}</p><p className="text-[12px] text-[#6b7280] mt-1 font-[500]">TERKONFIRMASI</p></div>
                        <div className="bg-white p-[16px_20px] rounded-[8px] border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"><p className="text-[24px] font-[700] text-[#991b1b]">{histori.filter((i) => i.verdict === "HOAKS").length}</p><p className="text-[12px] text-[#6b7280] mt-1 font-[500]">HOAKS</p></div>
                        <div className="bg-white p-[16px_20px] rounded-[8px] border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"><p className="text-[24px] font-[700] text-[#854d0e]">{histori.filter((i) => i.verdict === "BELUM_TERVERIFIKASI").length}</p><p className="text-[12px] text-[#6b7280] mt-1 font-[500]">BELUM TERVERIFIKASI</p></div>
                      </div>
                      <div className="lg:hidden mt-4">
                        <button onClick={() => { signOut(auth); router.push("/"); }} className="w-full bg-white border border-[#fecaca] rounded-[8px] p-[16px] flex items-center justify-between hover:bg-[#fff5f5] transition-colors group">
                          <span className="text-[14px] font-[500] text-[#dc2626]">Keluar dari akun</span>
                          <svg className="w-[16px] h-[16px] text-[#fca5a5] group-hover:text-[#dc2626] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </PageTransition>
        </main>
      </div>

      {activeMenu === "verifikasi" && (
        <aside className={`hidden lg:flex flex-col ${isPanelOpen ? "w-[280px]" : "w-[40px]"} bg-white border-l border-[#e5e7eb] flex-shrink-0 h-full overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05)] z-20 transition-all duration-200 ease-in-out`}>
          <div className={`p-[16px] border-b border-[#e5e7eb] flex items-center ${isPanelOpen ? "justify-between" : "justify-center"}`}>
            {isPanelOpen && <span className="font-[500] text-[13px] text-[#374151]">Riwayat Terakhir</span>}
            <button onClick={() => { setIsPanelOpen(!isPanelOpen); if (!isPanelOpen) setHasNewHistory(false); }} className="w-[28px] h-[28px] rounded-[6px] hover:bg-[#f3f4f6] flex items-center justify-center border border-[#e5e7eb] transition-colors relative">
              <svg className="w-[12px] h-[12px] text-[#9ca3af]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                {isPanelOpen ? <path d="m9 18 6-6-6-6"/> : <path d="m15 18-6-6 6-6"/>}
              </svg>
              {!isPanelOpen && hasNewHistory && <div className="absolute top-0 right-0 w-[6px] h-[6px] bg-[#dc2626] rounded-full"></div>}
            </button>
          </div>
          {isPanelOpen && (
            <div className="flex-1 overflow-y-auto flex flex-col">
              {loadingHistori ? (
                <SkeletonDashboardPanel />
              ) : histori.map((item) => {
                const txt = item.inputText || item.extractedText || "Verifikasi via foto";
                return (
                  <div key={item.id} className="p-[12px_16px] border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors duration-150 flex flex-col gap-1.5 cursor-default">
                    <div className="flex justify-between items-center">
                      <span className={`px-[6px] py-[2px] rounded-[4px] text-xs lg:text-[10px] font-[600] border overflow-hidden text-ellipsis max-w-[160px] ${getBadgeClass(item.verdict)}`}>{item.verdict}</span>
                      <span className="text-[11px] text-[#9ca3af]">{getRelativeTime(item.savedAt)}</span>
                    </div>
                    <p className="text-[12px] text-[#374151] leading-tight line-clamp-2 mt-1">"{txt}"</p>
                    <div className="items-center gap-2 mt-1 hidden sm:flex">
                      <span className="text-[10px] text-[#6b7280] font-[500] whitespace-nowrap">AI Trust {item.confidence}%</span>
                      <div className="flex-1 bg-[#f3f4f6] rounded-[4px] h-[4px]"><div className={`h-[4px] rounded-[4px] ${getProgressColor(item.verdict)} ${getProgressWidthClass(item.confidence)}`}></div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      )}

      {isEmergencyMode && (
        <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col font-sans overflow-y-auto">
          <header className="p-[16px_24px] flex justify-between items-center border-b border-[#1f1f1f] bg-[#0a0a0a] sticky top-0 z-10">
            <div className="text-[13px] font-[700] font-mono text-[#dc2626] tracking-[0.05em]">MODE DARURAT</div>
            <button onClick={() => setIsEmergencyMode(false)} className="bg-transparent border border-[#374151] text-[#9ca3af] hover:border-[#6b7280] hover:text-white text-[12px] px-[12px] py-[6px] rounded-[6px] transition-colors">Keluar dari Mode Darurat</button>
          </header>
          <div className="w-full max-w-[600px] mx-auto px-[24px] py-[32px] flex flex-col gap-[24px]">
            <GempaAlert />
            <div className="flex flex-col gap-[16px]">
              <h2 className="text-[16px] font-[600] text-white text-center">Paste atau ucapkan informasi bencana yang kamu terima</h2>
              <div className="relative">
                <textarea ref={emergencyTextareaRef} value={text} onChange={(e) => setText(e.target.value)} className="w-full min-h-[160px] bg-[#111111] border-2 border-[#374151] rounded-[10px] p-[20px] text-[18px] text-white placeholder-[#4b5563] focus:border-[#dc2626] outline-none transition-colors resize-none relative z-10" placeholder="Ketik atau bicara..." />
                <div className="absolute bottom-3 right-3 z-30">
                  <div className="relative">
                    {isListening && <div className="absolute inset-0 rounded-full border-[2px] border-[#dc2626] animate-pulse-mic"></div>}
                    <button onClick={() => { if (isListening) recognitionRef.current?.stop(); else { recognitionRef.current?.start(); setIsListening(true); } }} className={`w-[44px] h-[44px] rounded-full border flex items-center justify-center transition-colors relative z-10 ${isListening ? "bg-[#dc2626] border-[#dc2626]" : "bg-[#1f2937] border-[#374151]"}`}>
                      <svg className="w-[18px] h-[18px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                    </button>
                  </div>
                </div>
                {isListening && interimTranscript && (
                  <div className="absolute top-0 left-0 w-full h-[160px] p-[20px] text-[18px] pointer-events-none whitespace-pre-wrap leading-tight z-0">
                    <span className="text-transparent">{text}</span>
                    <span className="text-[#9ca3af] italic">{interimTranscript}</span>
                  </div>
                )}
              </div>
              <input value={kodeWilayah} onChange={(e) => setKodeWilayah(e.target.value)} placeholder="Kode wilayah BMKG (opsional)" className="w-full bg-[#111111] border border-[#374151] rounded-[8px] p-[14px] text-[15px] text-white placeholder-[#4b5563] focus:border-[#dc2626] outline-none transition-colors" type="text" />
              <button onClick={async () => {
                setEmergencyLoading(true); setEmergencyResult(null);
                try {
                  const res = await fetch("/api/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, kodeWilayah }) });
                  const data = await res.json();
                  setEmergencyResult(data);
                } finally { setEmergencyLoading(false); }
              }} disabled={emergencyLoading || text.length < 5} className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[18px] font-[700] p-[18px] rounded-[10px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                {emergencyLoading ? (<><div className="w-[20px] h-[20px] border-[2px] border-white border-t-transparent rounded-full animate-spin"></div>Memverifikasi...</>) : "Verifikasi Sekarang"}
              </button>
            </div>
            {emergencyResult && (
              <div className="bg-[#111111] border border-[#1f1f1f] rounded-[10px] p-[20px] flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className={`px-[12px] py-[4px] rounded-[6px] text-[16px] font-[700] border ${getBadgeClass(emergencyResult.verdict)}`}>{emergencyResult.verdict}</span>
                  <span className="text-[14px] font-mono text-[#9ca3af]">{emergencyResult.confidence}% Confidence</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[12px] font-[700] text-[#4b5563] uppercase">Alasan</h3>
                  <p className="text-[15px] text-white leading-relaxed">{emergencyResult.alasan}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[12px] font-[700] text-[#4b5563] uppercase">Saran</h3>
                  <p className="text-[15px] text-[#22c55e] font-[600] leading-relaxed">{emergencyResult.saran}</p>
                </div>
                <button onClick={() => {
                  const msg = `*[SiJelih DARURAT]*\nStatus: ${emergencyResult.verdict}\nKeyakinan: ${emergencyResult.confidence}%\n\nInformasi:\n"${emergencyResult.inputText}"\n\nAnalisis:\n${emergencyResult.alasan}\n\nSaran:\n${emergencyResult.saran}`;
                  window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");
                }} className="bg-[#25d366] hover:bg-[#1ebe57] text-white text-[16px] font-[700] p-[14px] rounded-[8px] transition-colors mt-[12px] w-full">
                  Bagikan ke WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-white border-t border-[#e5e7eb] flex items-center justify-around z-[100] bottom-nav-safe-padding">
        <button onClick={() => setActiveMenu("verifikasi")} className="relative w-1/3 h-full flex flex-col items-center justify-center gap-1 transition-colors duration-200">
          {activeMenu === "verifikasi" && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-[#1d4ed8] rounded-b-[2px]"></div>}
          <svg className={`w-5 h-5 transition-colors duration-200 ${activeMenu === "verifikasi" ? "text-[#1d4ed8]" : "text-[#6b7280]"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <span className={`text-[11px] font-[600] transition-colors duration-200 ${activeMenu === "verifikasi" ? "text-[#1d4ed8]" : "text-[#6b7280]"}`}>Cek</span>
        </button>
        <button onClick={() => setActiveMenu("histori")} className="relative w-1/3 h-full flex flex-col items-center justify-center gap-1 transition-colors duration-200">
          {activeMenu === "histori" && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-[#1d4ed8] rounded-b-[2px]"></div>}
          <svg className={`w-5 h-5 transition-colors duration-200 ${activeMenu === "histori" ? "text-[#1d4ed8]" : "text-[#6b7280]"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
          <span className={`text-[11px] font-[600] transition-colors duration-200 ${activeMenu === "histori" ? "text-[#1d4ed8]" : "text-[#6b7280]"}`}>Histori</span>
        </button>
        <button onClick={() => setActiveMenu("profil")} className="relative w-1/3 h-full flex flex-col items-center justify-center gap-1 transition-colors duration-200">
          {activeMenu === "profil" && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-[#1d4ed8] rounded-b-[2px]"></div>}
          <svg className={`w-5 h-5 transition-colors duration-200 ${activeMenu === "profil" ? "text-[#1d4ed8]" : "text-[#6b7280]"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span className={`text-[11px] font-[600] transition-colors duration-200 ${activeMenu === "profil" ? "text-[#1d4ed8]" : "text-[#6b7280]"}`}>Profil</span>
        </button>
      </nav>
    </div>
  );
}