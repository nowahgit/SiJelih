"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import LoadingScreen from "@/components/LoadingScreen";
import Dialog from "@/components/Dialog";
import { useToast } from "@/hooks/useToast";
import PageTransition from "@/components/PageTransition";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

export default function MassalPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();

  const [text, setText] = useState("");
  const [kodeWilayah, setKodeWilayah] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState("");
  const [logoutConfirmCtx, setLogoutConfirmCtx] = useState(false);
  
  const [results, setResults] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeClaims, setActiveClaims] = useState<string[]>([]);

  useEffect(() => {
    if (!loadingAuth && !user) router.push("/login");
  }, [user, loadingAuth, router]);

  if (loadingAuth || !user) {
    return <LoadingScreen isVisible={true} />;
  }

  const handleVerifyAll = async () => {
    const claims = text.split("\n\n").map(c => c.trim()).filter(c => c.length > 0);
    if (claims.length === 0) return;
    if (claims.length > 5) {
      setErrorMsg("Maksimal 5 klaim sekaligus");
      return;
    }
    
    setErrorMsg("");
    setLoading(true);
    setResults([]);
    setActiveClaims(claims);
    setProgress({ current: 0, total: claims.length });
    setSavedSuccess(false);

    const tempResults = [];

    for (let i = 0; i < claims.length; i++) {
      setProgress({ current: i + 1, total: claims.length });
      const claim = claims[i];
      try {
        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: claim, kodeWilayah })
        });
        const data = await res.json();
        
        if (res.ok && !data.error) {
           tempResults.push({ originalText: claim, ...data });
        } else {
           tempResults.push({ originalText: claim, error: true });
        }
      } catch (err) {
        tempResults.push({ originalText: claim, error: true });
      }
      setResults([...tempResults]);
    }

    setLoading(false);
    toast("Semua verifikasi klaim selesai", "info");
  };

  const handleSaveAll = async () => {
    if (!user || results.length === 0) return;
    setSaving(true);
    try {
      const historyRef = collection(db, "verifications", user.uid, "history");
      for (const res of results) {
        if (res.error) continue;
        const newEntry = { ...res, savedAt: new Date().toISOString() };
        delete newEntry.originalText;
        if (!newEntry.inputText) newEntry.inputText = res.originalText;
        await addDoc(historyRef, newEntry);
      }
      toast("Semua hasil berhasil disimpan ke histori", "success");
    } catch {
      toast("Gagal menyimpan histori", "error");
    } finally {
      setSaving(false);
    }
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
    <div className="flex h-screen bg-[#f9fafb] flex-col lg:flex-row overflow-hidden font-sans text-[#111827]">
      
      <aside className="hidden lg:flex flex-col w-[256px] bg-[#111827] text-[#9ca3af] flex-shrink-0 relative h-full">
        <div className="p-[20px_16px] border-b border-[#1f2937] flex items-center justify-between">
          <img src="/image/LOGO_WHITE.png" alt="SiJelih" className="h-[44px] w-auto" />
        </div>
        <nav className="flex-1 flex flex-col gap-1 p-[12px] overflow-y-auto">
          <div className="text-[11px] font-[500] tracking-wider text-[#4b5563] uppercase px-[12px] mb-1 mt-2">Menu</div>
          
          <button onClick={() => router.push("/dashboard?menu=verifikasi")} className="flex items-center gap-3 px-[12px] py-[8px] rounded-[6px] transition-colors duration-150 text-[13px] font-[500] hover:bg-[#1f2937] hover:text-white">
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span>Verifikasi</span>
          </button>
          <button onClick={() => router.push("/dashboard?menu=histori")} className="flex items-center gap-3 px-[12px] py-[8px] rounded-[6px] transition-colors duration-150 text-[13px] font-[500] hover:bg-[#1f2937] hover:text-white">
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
            <span>Histori</span>
          </button>
          
          <button onClick={() => router.push("/dashboard/simulasi")} className={`flex items-center gap-3 px-[12px] py-[8px] rounded-[6px] transition-colors duration-150 text-[13px] font-[500] hover:bg-[#1f2937] hover:text-white`}>
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Simulasi</span>
          </button>
          <button className="flex items-center gap-3 px-[12px] py-[8px] rounded-[6px] transition-colors duration-150 text-[13px] font-[500] bg-[#1d4ed8] text-white">
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 12H3"/><path d="M16 6H3"/><path d="M16 18H3"/><path d="M19 10v6"/><path d="M16 13h6"/></svg>
            <span>Massal</span>
          </button>

          <div className="text-[11px] font-[500] tracking-wider text-[#4b5563] uppercase px-[12px] mb-1 mt-6">Akun</div>
          
          <button onClick={() => router.push("/dashboard?menu=profil")} className="flex items-center gap-3 px-[12px] py-[8px] rounded-[6px] transition-colors duration-150 text-[13px] font-[500] hover:bg-[#1f2937] hover:text-white">
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[56px] bg-white border-b border-[#e5e7eb] px-[24px] flex items-center justify-between flex-shrink-0 z-10 transition-colors duration-150">
          <div className="text-[13px] text-[#6b7280]">
            Dashboard <span className="mx-1">/</span> <span className="capitalize">Massal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-[500] text-[#374151] hidden sm:block">{user?.displayName}</span>
            <img src={user?.photoURL || ""} alt="Avatar" className="w-[32px] h-[32px] rounded-full object-cover shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#e5e7eb]" />
          </div>
        </header>

        <main className="flex-1 flex flex-col min-w-0 p-[24px]">
          <PageTransition>
            <div className="max-w-4xl mx-auto pb-24 lg:pb-8 flex flex-col gap-6 w-full">
              
              <h1 className="text-[18px] font-[600] text-[#111827]">Verifikasi Massal</h1>
              
              <div className="bg-white border border-[#e5e7eb] rounded-[8px] p-[24px]">
                <label className="block text-[13px] font-[500] text-[#374151] mb-[8px]">Masukkan beberapa klaim</label>
                <div className="text-[12px] text-[#9ca3af] mb-[12px]">Pisahkan tiap klaim dengan baris kosong. Maksimal 5 klaim sekaligus.</div>
                
                <textarea 
                  rows={10} 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full bg-[#fafafa] border border-[#e5e7eb] rounded-[6px] p-[12px] text-[14px] resize-none focus:outline-none focus:ring-[2px] focus:ring-[#2563eb]"
                  placeholder={"Klaim pertama...\n\nKlaim kedua..."}
                ></textarea>
                
                <input 
                  type="text" 
                  value={kodeWilayah}
                  onChange={(e) => setKodeWilayah(e.target.value)}
                  className="w-full bg-[#fafafa] border border-[#e5e7eb] rounded-[6px] p-[12px] text-[14px] mt-[12px] focus:outline-none focus:ring-[2px] focus:ring-[#2563eb]"
                  placeholder="Kode wilayah BMKG opsional"
                />

                <button 
                  onClick={handleVerifyAll}
                  disabled={loading || text.trim().length === 0}
                  className="mt-[16px] bg-[#0a0a0a] text-white px-[20px] py-[9px] rounded-[6px] text-[13px] font-[600] flex justify-center hover:bg-[#1f1f1f] disabled:opacity-75 transition-colors disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-[14px] h-[14px] rounded-full border-[1.5px] border-current border-t-transparent animate-spin"></div>
                      Memverifikasi {progress.total} klaim...
                    </div>
                  ) : "Verifikasi Semua"}
                </button>
              </div>

            {results.length > 0 && !loading && (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-[#fafafa] border border-[#e5e7eb] rounded-[6px] p-[12px_16px] flex gap-[24px] flex-wrap mb-[16px]">
                  <div className="flex items-center gap-[8px]">
                    <div className="w-[8px] h-[8px] rounded-full bg-[#16a34a]"></div>
                    <span className="font-[700] text-[14px]">{results.filter(r => r.verdict === "TERKONFIRMASI").length}</span>
                    <span className="text-[12px] text-[#6b7280]">TERKONFIRMASI</span>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <div className="w-[8px] h-[8px] rounded-full bg-[#ca8a04]"></div>
                    <span className="font-[700] text-[14px]">{results.filter(r => r.verdict === "BELUM_TERVERIFIKASI").length}</span>
                    <span className="text-[12px] text-[#6b7280]">BELUM TERVERIFIKASI</span>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <div className="w-[8px] h-[8px] rounded-full bg-[#dc2626]"></div>
                    <span className="font-[700] text-[14px]">{results.filter(r => r.verdict === "HOAKS").length}</span>
                    <span className="text-[12px] text-[#6b7280]">HOAKS</span>
                  </div>
                </div>

                {results.map((res, i) => {
                  if (res.error) {
                    return (
                      <div key={i} className="bg-[#fef2f2] border border-[#fecaca] rounded-[8px] p-[16px_20px] mb-[12px]">
                        <span className="text-[#dc2626] text-[13px]">Gagal memverifikasi klaim ini. Coba lagi.</span>
                      </div>
                    );
                  }

                  const handleShareWa = () => {
                    const checkedAtFormatted = new Date(res.checkedAt).toLocaleString("id-ID");
                    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sijelih.vercel.app";
                    const textContent = `*[SiJelih] Hasil Verifikasi Informasi Bencana*\n\nStatus: ${res.verdict}\nTingkat Keyakinan: ${res.confidence}%\n\nInformasi yang dicek:\n"${res.originalText}"\n\nAnalisis:\n${res.alasan}\n\nSumber Data: ${res.sumber}\n\nSaran: ${res.saran}\n\nDiverifikasi pada: ${checkedAtFormatted}\n\n_Data bersumber dari BMKG — Badan Meteorologi, Klimatologi, dan Geofisika_\n_Verifikasi menggunakan SiJelih · ${appUrl}_`;
                    window.open('https://wa.me/?text=' + encodeURIComponent(textContent), '_blank');
                  };

                  return (
                    <div key={i} className="bg-white border border-[#e5e7eb] rounded-[8px] p-[16px_20px] mb-[12px]">
                      <div className="flex justify-between items-start gap-[12px]">
                        <div>
                          <div className="font-mono text-[11px] font-[700] text-[#9ca3af] mb-[6px]">Klaim {i + 1}</div>
                          <div className="text-[13px] text-[#374151]">
                            {res.originalText.length > 100 ? res.originalText.substring(0, 100) + '...' : res.originalText}
                          </div>
                        </div>
                        <div className={`px-[8px] py-[2px] rounded-[4px] text-[11px] font-[600] border flex-shrink-0 ${getBadgeClass(res.verdict)}`}>
                          {res.verdict}
                        </div>
                      </div>
                      
                      <div className="w-full bg-[#f3f4f6] rounded-full h-[4px] mt-[12px]">
                        <div className={`h-[4px] rounded-full ${getProgressColor(res.verdict)} ${getProgressWidthClass(res.confidence)}`}></div>
                      </div>
                      
                      <p className="text-[13px] text-[#6b7280] leading-[1.6] mt-[10px]">{res.alasan}</p>
                      
                      <button onClick={handleShareWa} className="mt-[10px] bg-[#25d366] hover:bg-[#1ebe57] text-white text-[12px] font-[600] px-[14px] py-[6px] rounded-[6px] transition-colors w-auto">
                        Bagikan ke WhatsApp
                      </button>
                    </div>
                  );
                })}

                <button 
                  onClick={handleSaveAll}
                  disabled={saving || savedSuccess}
                  className="mt-[4px] bg-white border border-[#0a0a0a] text-[#0a0a0a] px-[20px] py-[9px] rounded-[6px] text-[13px] font-[600] flex justify-center hover:bg-[#f9fafb] transition-colors disabled:opacity-75 w-max disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-[14px] h-[14px] rounded-full border-[1.5px] border-current border-t-transparent animate-spin"></div>
                      Menyimpan...
                    </div>
                  ) : "Simpan Semua ke Histori"}
                </button>
              </div>
            )}

            {loading && activeClaims.length > 0 && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-500">
                {activeClaims.map((_, i) => (
                  <div key={`skel-${i}`} className={i < progress.current - 1 ? "hidden" : i === progress.current - 1 ? "" : "opacity-50"}>
                    <SkeletonCard />
                  </div>
                ))}
              </div>
            )}
            </div>
          </PageTransition>
        </main>
      </div>

      <nav className="lg:hidden fixed bottom-0 w-full bg-white flex justify-around p-3 z-50 pb-safe border-t border-[#e5e7eb] shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
        <button onClick={() => router.push("/dashboard?menu=verifikasi")} className="p-3 rounded-[6px] transition-colors duration-150 text-[#6b7280]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
        <button onClick={() => router.push("/dashboard?menu=histori")} className="p-3 rounded-[6px] transition-colors duration-150 text-[#6b7280]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
        </button>
        <button className="p-3 rounded-[6px] transition-colors duration-150 bg-[#1d4ed8] text-white">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 12H3"/><path d="M16 6H3"/><path d="M16 18H3"/><path d="M19 10v6"/><path d="M16 13h6"/></svg>
        </button>
        <button onClick={() => router.push("/dashboard?menu=profil")} className="p-3 rounded-[6px] transition-colors duration-150 text-[#6b7280]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </nav>

      {errorMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-[16px]">
          <div className="absolute inset-0 bg-black/40 transition-opacity duration-150 animate-in fade-in" onClick={() => setErrorMsg("")} />
          <div className="relative bg-white rounded-[10px] border border-[#e5e7eb] w-full max-w-[400px] overflow-hidden flex flex-col animate-in slide-in-from-bottom-2 duration-200">
            <div className="p-[20px] pb-0">
              <h3 className="text-[16px] font-[600] text-[#111827] mb-[8px]">Validasi</h3>
              <p className="text-[14px] text-[#4b5563] leading-relaxed">{errorMsg}</p>
            </div>
            <div className="p-[20px] flex justify-end">
              <button 
                onClick={() => setErrorMsg("")} 
                className="bg-[#0a0a0a] text-white px-[20px] py-[9px] rounded-[6px] text-[13px] font-[600] hover:bg-[#1f1f1f] transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
