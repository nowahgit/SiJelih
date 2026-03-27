"use client";
export const dynamic = "force-dynamic";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { signOut } from "firebase/auth";
import LoadingScreen from "@/components/LoadingScreen";
import PageTransition from "@/components/PageTransition";
import Dialog from "@/components/Dialog";


export default function SimulasiPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const router = useRouter();

  const [step, setStep] = useState<"setup" | "playing" | "result">("setup");
  const [selectedDisaster, setSelectedDisaster] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [logoutConfirmCtx, setLogoutConfirmCtx] = useState(false);

  useEffect(() => {
    if (!loadingAuth && !user) router.push("/login");
  }, [user, loadingAuth, router]);

  if (loadingAuth || !user) return <LoadingScreen isVisible={true} />;

  const handleStartSimulasi = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/simulasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disasterType: selectedDisaster, location: selectedLocation })
      });
      const data = await res.json();
      setQuestions(data.questions);
      setSessionToken(data.sessionToken);
      setStep("playing");
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async () => {
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer("");
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setLoading(true);
      try {
        const res = await fetch("/api/simulasi-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            disasterType: selectedDisaster, 
            location: selectedLocation, 
            questions, 
            answers: newAnswers,
            sessionToken
          })
        });
        const data = await res.json();
        setScore(data.score);
        setFeedback(data.feedback);
        setStep("result");
      } catch {
      } finally {
        setLoading(false);
      }
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <span className="text-[11px] font-[700] font-mono bg-[#dcfce7] text-[#166534] px-[12px] py-[4px] rounded-full inline-block mt-3 uppercase">Siap Siaga</span>;
    if (score >= 60) return <span className="text-[11px] font-[700] font-mono bg-[#fef9c3] text-[#854d0e] px-[12px] py-[4px] rounded-full inline-block mt-3 uppercase">Cukup Siap</span>;
    return <span className="text-[11px] font-[700] font-mono bg-[#fee2e2] text-[#991b1b] px-[12px] py-[4px] rounded-full inline-block mt-3 uppercase">Perlu Belajar</span>;
  };

  const Sidebar = () => (
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
        <button className="flex items-center gap-3 px-[12px] py-[8px] rounded-[6px] transition-colors duration-150 text-[13px] font-[500] bg-[#1d4ed8] text-white">
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>Simulasi</span>
        </button>
        <button onClick={() => router.push("/dashboard/massal")} className="flex items-center gap-3 px-[12px] py-[8px] rounded-[6px] transition-colors duration-150 text-[13px] font-[500] hover:bg-[#1f2937] hover:text-white">
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
  );

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f9fafb]" />}>
    <div className="flex h-screen bg-[#f9fafb] flex-col lg:flex-row overflow-hidden font-sans text-[#111827]">
      <Sidebar />
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
            Dashboard <span className="mx-1">/</span> <span>Simulasi</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-[500] text-[#374151] hidden sm:block">{user?.displayName}</span>
            <img src={user?.photoURL || ""} alt="Avatar" referrerPolicy="no-referrer" className="w-[32px] h-[32px] rounded-full object-cover shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#e5e7eb]" />
          </div>
        </header>

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <PageTransition>
            <div className="p-[24px] flex flex-col w-full max-w-2xl mx-auto pb-24">
              {step === "setup" && (
                <div className="flex flex-col gap-6 w-full">
                  <div className="flex flex-col gap-1">
                    <h1 className="text-[18px] font-[600] text-[#111827]">Simulasi Bencana</h1>
                    <p className="text-[13px] text-[#6b7280]">Uji kesiapsiagaan kamu menghadapi bencana alam</p>
                  </div>
                  <div className="bg-white p-[24px] rounded-[8px] border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col gap-5">
                    <div className="flex flex-col gap-3">
                      <label className="text-[13px] font-[500] text-[#374151]">Jenis Bencana</label>
                      <div className="grid grid-cols-2 gap-[10px]">
                        {["Gempa Bumi", "Banjir", "Tsunami", "Tanah Longsor"].map((d) => (
                          <div 
                            key={d} 
                            onClick={() => setSelectedDisaster(d)}
                            className={`p-[12px_16px] border rounded-[6px] cursor-pointer text-center text-[13px] font-[500] transition-all ${selectedDisaster === d ? "border-[#0a0a0a] border-2 bg-[#f9fafb]" : "border-[#e5e7eb] hover:bg-[#f9fafb]"}`}
                          >
                            {d}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-[13px] font-[500] text-[#374151]">Lokasi Simulasi</label>
                      <input 
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        placeholder="Contoh: Cianjur, Jawa Barat"
                        className="w-full bg-white border border-[#d1d5db] rounded-[6px] p-[8px_12px] focus:outline-none focus:ring-[2px] focus:ring-[#3b82f6] text-[14px]"
                        type="text"
                      />
                    </div>
                    <button 
                      onClick={handleStartSimulasi}
                      disabled={loading || !selectedDisaster || selectedLocation.length < 3}
                      className="bg-[#0a0a0a] text-white p-[10px_20px] rounded-[6px] text-[13px] font-[600] border-none hover:bg-[#1f1f1f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2 flex justify-center items-center gap-2"
                    >
                      {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Mulai Simulasi"}
                    </button>
                  </div>
                </div>
              )}

              {step === "playing" && questions.length > 0 && (
                <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
                  <div className="flex flex-col gap-2">
                    <div className="text-[12px] font-mono text-[#6b7280]">Pertanyaan {currentQuestion + 1} dari {questions.length}</div>
                    <div className="w-full h-[3px] bg-[#f3f4f6] rounded-full overflow-hidden">
                      <div className="h-full bg-[#0a0a0a] transition-all duration-300" style={{ width: `${(currentQuestion / questions.length) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="bg-white p-[24px] rounded-[8px] border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                    <div className="text-[11px] font-[700] font-mono text-[#9ca3af] mb-2 uppercase">Skenario Lapangan</div>
                    <h2 className="text-[16px] font-[600] text-[#0a0a0a] leading-[1.6] mb-5">{questions[currentQuestion].question}</h2>
                    <div className="flex flex-col gap-2">
                      {questions[currentQuestion].options.map((opt: string) => (
                        <div 
                          key={opt}
                          onClick={() => setSelectedAnswer(opt)}
                          className={`p-[12px_16px] border rounded-[6px] cursor-pointer text-[14px] text-[#374151] transition-all ${selectedAnswer === opt ? "border-[#0a0a0a] border-2 bg-[#f9fafb]" : "border-[#e5e7eb] hover:border-[#d1d5db] hover:bg-[#f9fafb]"}`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                    {selectedAnswer && (
                      <button 
                        onClick={handleAnswer}
                        disabled={loading}
                        className="w-full md:w-auto bg-[#0a0a0a] text-white p-[9px_20px] rounded-[6px] text-[13px] font-[600] transition-colors hover:bg-[#1f1f1f] mt-4 flex justify-center items-center gap-2"
                      >
                        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Jawab"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {step === "result" && (
                <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white p-[32px] rounded-[8px] border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-center">
                    <div className="text-[48px] font-[800] text-[#0a0a0a] font-mono leading-none">{score}</div>
                    <div className="text-[13px] text-[#9ca3af] mt-1">dari 100 poin</div>
                    {getScoreBadge(score)}
                  </div>
                  <div className="bg-[#fafafa] p-[20px] rounded-[8px] border border-[#e5e7eb]">
                    <div className="text-[11px] font-[700] font-mono text-[#9ca3af] mb-2.5 uppercase text-left">Evaluasi SiJelih</div>
                    <div className="text-[14px] text-[#374151] leading-[1.7] text-left whitespace-pre-wrap">{feedback}</div>
                  </div>
                  <div className="flex gap-3 justify-center mt-2 flex-col sm:flex-row">
                    <button onClick={() => { setStep("setup"); setAnswers([]); setCurrentQuestion(0); setScore(0); }} className="bg-white border border-[#e5e7eb] text-[#374151] p-[9px_20px] rounded-[6px] text-[13px] font-[600] hover:bg-[#f9fafb] transition-colors">Coba Lagi</button>
                    <button 
                      onClick={() => {
                        const txt = `Saya baru menyelesaikan simulasi bencana ${selectedDisaster} di SiJelih dan mendapat skor ${score}/100! Coba kamu juga di https://sijelih.vercel.app`;
                        window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
                      }}
                      className="bg-[#25d366] text-white p-[9px_20px] rounded-[6px] text-[13px] font-[600] transition-colors hover:bg-[#1ebe57]"
                    >
                      Bagikan ke WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </div>
          </PageTransition>
        </main>
      </div>

      <nav className="lg:hidden fixed bottom-0 w-full bg-white flex justify-around p-3 z-50 pb-safe border-t border-[#e5e7eb] shadow-[0_-1px_3px_rgba(0,0,0,0.05)] text-[#6b7280]">
        <button onClick={() => router.push("/dashboard?menu=verifikasi")} className="p-3 rounded-[6px] transition-colors duration-150">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
        <button onClick={() => router.push("/dashboard?menu=histori")} className="p-3 rounded-[6px] transition-colors duration-150">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
        </button>
        <button className="p-3 rounded-[6px] transition-colors duration-150 bg-[#1d4ed8] text-white">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </button>
        <button onClick={() => router.push("/dashboard?menu=profil")} className="p-3 rounded-[6px] transition-colors duration-150">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </nav>
    </div>
    </Suspense>
  );
}
