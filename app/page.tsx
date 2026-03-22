import Link from "next/link";
import { Suspense } from "react";
import BencanaSectionWrapper from "@/components/BencanaSectionWrapper";
import TypewriterInput from "@/components/TypewriterInput";
import TickerBar from "@/components/TickerBar";
import LandingNavbar from "@/components/LandingNavbar";
import { Nunito } from "next/font/google";
import PageTransition from "@/components/PageTransition";

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
    <div className={`min-h-screen bg-white text-[#0a0a0a] ${nunito.className}`}>
      <LandingNavbar />

      <PageTransition>
        <TickerBar />

        <section className="bg-white max-w-[1100px] mx-auto pt-[100px] pb-[80px] px-[24px]">
        <div className="flex flex-col lg:flex-row gap-[64px] items-center">
          
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-[6px] border border-[#e5e7eb] bg-[#f9fafb] rounded-full px-[12px] py-[3px] mb-[28px]">
              <div className="w-[5px] h-[5px] bg-[#2563eb] rounded-full"></div>
              <span className="font-[500] text-[11px] text-[#6b7280] font-mono">
                Didukung data resmi BMKG
              </span>
            </div>
            
            <h1 className="font-[800] text-[36px] md:text-[54px] leading-[1.1] tracking-[-0.03em] text-[#0a0a0a] mb-[20px]">
              Jeli sebelum percaya.
            </h1>
            
            <p className="font-[400] text-[17px] text-[#6b7280] leading-[1.7] max-w-[480px] mx-auto md:mx-0 mb-[40px]">
              Verifikasi informasi bencana alam dalam hitungan detik menggunakan tiga sumber data resmi BMKG.
            </p>

            <div className="w-full md:[&>div]:!max-w-full md:[&>div]:!mx-0 [&>div]:mx-auto min-h-[52px] h-[52px] overflow-hidden">
              <TypewriterInput />
            </div>
            
            <div className="mt-[36px] flex flex-wrap justify-center md:justify-start gap-[12px]">
              <Link href="/dashboard" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[14px] font-[600] px-[22px] py-[10px] rounded-[7px] transition-colors shadow-none border border-transparent">
                Verifikasi Sekarang
              </Link>
              <Link href="#cara-kerja" className="bg-white border border-[#d1d5db] text-[#374151] text-[14px] font-[500] px-[22px] py-[10px] rounded-[7px] hover:bg-[#f9fafb] transition-colors">
                Pelajari Cara Kerja
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-[420px] flex-shrink-0 max-w-[540px] lg:max-w-none mx-auto lg:mx-0">
            <div className="font-mono text-[11px] text-[#9ca3af] mb-[10px] text-center md:text-left">
              Contoh hasil verifikasi
            </div>
            <div className="bg-white border border-[#e5e7eb] rounded-[10px] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.06)] text-left">
              <div className="p-[16px_20px] border-b border-[#f3f4f6] flex justify-between items-start">
                <span className="bg-[#dcfce7] text-[#166534] border border-[#bbf7d0] font-mono text-[11px] font-[700] px-[10px] py-[3px] rounded-[4px]">TERKONFIRMASI</span>
                <span className="font-mono text-[12px] text-[#6b7280]">Confidence: 94%</span>
              </div>
              <div className="p-[16px_20px] border-b border-[#f3f4f6]">
                <div className="font-mono text-[10px] font-[700] text-[#9ca3af] mb-[6px]">INPUT</div>
                <p className="text-[13px] text-[#374151] leading-[1.5]">Gempa M6.2 mengguncang Cianjur pagi ini, BMKG keluarkan peringatan tsunami.</p>
                
                <div className="font-mono text-[10px] font-[700] text-[#9ca3af] mb-[6px] mt-[12px]">ANALISIS</div>
                <p className="text-[13px] text-[#374151] leading-[1.5]">Data BMKG autogempa.json mengonfirmasi gempa M6.2 di wilayah Cianjur pada waktu yang sesuai. Tidak ada peringatan tsunami aktif dari sistem nowcast.</p>
              </div>
              <div className="p-[12px_20px] bg-[#fafafa] flex justify-between items-center">
                <span className="font-mono text-[11px] text-[#9ca3af]">Sumber: BMKG autogempa.json · nowcast CAP</span>
                <span className="font-mono text-[11px] text-[#9ca3af]">20 Mar 2026 · 09.14 WIB</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[72px] pt-[48px] border-t border-[#f3f4f6] max-w-[1100px] mx-auto px-[24px] flex flex-col lg:flex-row justify-between items-center gap-[48px]">
          
          <div className="flex items-center gap-[32px] md:gap-[48px] grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-[10px] font-[700] tracking-widest text-[#9ca3af] uppercase mb-[12px] font-mono">MITRA DATA</span>
              <div className="flex items-center gap-[32px]">
                <img 
                  src="https://ntt.bmkg.go.id/assets/images/LogoBMKG.png" 
                  alt="BMKG" 
                  className="h-[32px] w-auto object-contain"
                />
                <img 
                  src="https://dicoding-web-img.sgp1.cdn.digitaloceanspaces.com/original/commons/new-ui-logo.png" 
                  alt="Dicoding" 
                  className="h-[22px] w-auto object-contain"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end items-center gap-[16px] md:gap-[40px] w-full lg:w-auto">
            <div className="flex flex-col items-center md:items-end">
              <div className="font-[700] text-[22px] md:text-[26px] text-[#0a0a0a] font-mono tracking-tighter">3x</div>
              <div className="font-[600] text-[10px] text-[#9ca3af] mt-[2px] uppercase tracking-[0.1em]">Sumber Data</div>
            </div>
            
            <div className="h-[24px] w-[1px] bg-[#e5e7eb] hidden sm:block"></div>

            <div className="flex flex-col items-center md:items-end">
              <div className="font-[700] text-[22px] md:text-[26px] text-[#0a0a0a] font-mono tracking-tighter">24/7</div>
              <div className="font-[600] text-[10px] text-[#9ca3af] mt-[2px] uppercase tracking-[0.1em]">Real-time</div>
            </div>

            <div className="h-[24px] w-[1px] bg-[#e5e7eb] hidden sm:block"></div>

            <div className="flex flex-col items-center md:items-end">
              <div className="font-[700] text-[22px] md:text-[26px] text-[#0a0a0a] font-mono tracking-tighter">Vision</div>
              <div className="font-[600] text-[10px] text-[#9ca3af] mt-[2px] uppercase tracking-[0.1em]">AI Powered</div>
            </div>
          </div>
        </div>
      </section>

      <section id="cara-kerja" className="pt-[96px] pb-[96px] px-[24px] bg-white border-t border-[#f3f4f6]">
        <div className="max-w-[1000px] mx-auto">
          <div className="font-[600] text-[11px] tracking-[0.08em] text-[#9ca3af] font-mono mb-[12px] uppercase">
            CARA KERJA
          </div>
          <h2 className="font-[800] text-[34px] tracking-[-0.02em] text-[#0a0a0a] mb-[52px]">
            Tiga langkah, satu jawaban.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#e5e7eb]">
            <div className="p-[32px_0] md:p-[0_28px_0_0]">
              <div className="font-[700] text-[11px] font-mono text-[#9ca3af] mb-[16px]">(01)</div>
              <h3 className="font-[700] text-[16px] text-[#0a0a0a] mb-[8px]">Paste informasi</h3>
              <p className="text-[14px] text-[#6b7280] leading-[1.65]">
                Salin teks berita atau pesan bencana yang kamu terima dari WhatsApp atau media sosial ke dalam SiJelih.
              </p>
            </div>
            <div className="p-[32px_0] md:p-[0_28px]">
              <div className="font-[700] text-[11px] font-mono text-[#9ca3af] mb-[16px]">(02)</div>
              <h3 className="font-[700] text-[16px] text-[#0a0a0a] mb-[8px]">AI cross-check BMKG</h3>
              <p className="text-[14px] text-[#6b7280] leading-[1.65]">
                SiJelih mencocokkan klaim dengan data gempa, peringatan dini, dan cuaca BMKG secara paralel dan real-time.
              </p>
            </div>
            <div className="p-[32px_0] md:p-[0_0_0_28px]">
              <div className="font-[700] text-[11px] font-mono text-[#9ca3af] mb-[16px]">(03)</div>
              <h3 className="font-[700] text-[16px] text-[#0a0a0a] mb-[8px]">Dapat verdict</h3>
              <p className="text-[14px] text-[#6b7280] leading-[1.65]">
                Terima verdict lengkap — TERKONFIRMASI, BELUM TERVERIFIKASI, atau HOAKS — disertai alasan dan saran tindakan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-[80px] px-[24px] bg-[#fafafa] border-t border-[#f3f4f6]">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-[64px] items-center">
          <div>
            <div className="font-[600] text-[11px] tracking-[0.08em] text-[#9ca3af] font-mono mb-[12px] uppercase">
              RESPONSE API
            </div>
            <h2 className="font-[800] text-[28px] tracking-[-0.02em] text-[#0a0a0a] mb-[16px]">
              Output yang actionable, bukan sekadar label.
            </h2>
            <p className="text-[14px] text-[#6b7280] leading-[1.7]">
              Setiap verifikasi menghasilkan structured JSON dengan verdict, confidence score, alasan berbasis data BMKG, sumber yang digunakan, dan saran tindakan konkret — bukan hanya benar atau salah.
            </p>
          </div>
          <div className="bg-[#0a0a0a] rounded-[8px] overflow-hidden border border-[#1f1f1f]">
            <div className="p-[10px_16px] border-b border-[#1f1f1f] flex items-center gap-[6px]">
              <div className="w-[10px] h-[10px] rounded-full bg-[#ef4444]"></div>
              <div className="w-[10px] h-[10px] rounded-full bg-[#f59e0b]"></div>
              <div className="w-[10px] h-[10px] rounded-full bg-[#22c55e]"></div>
              <span className="font-mono text-[11px] text-[#4b5563] ml-[8px]">response.json</span>
            </div>
            <div className="p-[20px] font-mono text-[12px] leading-[1.8] overflow-x-auto text-left whitespace-pre">
              <span className="text-[#4b5563]">{`{\n`}</span>
              <span className="text-[#4b5563]">  </span><span className="text-[#60a5fa]">"verdict"</span><span className="text-[#4b5563]">: </span><span className="text-[#34d399]">"TERKONFIRMASI"</span><span className="text-[#4b5563]">{`,\n`}</span>
              <span className="text-[#4b5563]">  </span><span className="text-[#60a5fa]">"confidence"</span><span className="text-[#4b5563]">: </span><span className="text-[#f59e0b]">94</span><span className="text-[#4b5563]">{`,\n`}</span>
              <span className="text-[#4b5563]">  </span><span className="text-[#60a5fa]">"alasan"</span><span className="text-[#4b5563]">: </span><span className="text-[#34d399]">"Data BMKG mengonfirmasi gempa M6.2 di Cianjur."</span><span className="text-[#4b5563]">{`,\n`}</span>
              <span className="text-[#4b5563]">  </span><span className="text-[#60a5fa]">"sumber"</span><span className="text-[#4b5563]">: </span><span className="text-[#34d399]">"BMKG autogempa.json · nowcast CAP"</span><span className="text-[#4b5563]">{`,\n`}</span>
              <span className="text-[#4b5563]">  </span><span className="text-[#60a5fa]">"saran"</span><span className="text-[#4b5563]">: </span><span className="text-[#34d399]">"Ikuti arahan BPBD setempat dan hindari bangunan retak."</span><span className="text-[#4b5563]">{`\n`}</span>
              <span className="text-[#4b5563]">{`}`}</span>
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="py-[96px] px-[24px] bg-[#fafafa] border-y border-[#f3f4f6]">
        <div className="max-w-[1000px] mx-auto">
          <div className="font-[600] text-[11px] tracking-[0.08em] text-[#9ca3af] font-mono mb-[12px] uppercase">
            FITUR
          </div>
          <h2 className="font-[800] text-[34px] tracking-[-0.02em] text-[#0a0a0a] mb-[52px]">
            Bukan fact-checker biasa.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
            <div className="bg-white border border-[#e5e7eb] rounded-[8px] p-[28px_24px]">
              <div className="font-[700] text-[10px] font-mono text-[#2563eb] mb-[12px] uppercase">DATA</div>
              <h3 className="font-[700] text-[15px] text-[#0a0a0a] mb-[8px]">Real-time dari BMKG</h3>
              <p className="text-[13px] text-[#6b7280] leading-[1.65]">
                Setiap verifikasi fetch langsung dari tiga endpoint BMKG — gempa, peringatan dini CAP, dan prakiraan cuaca per kelurahan.
              </p>
            </div>
            <div className="bg-white border border-[#e5e7eb] rounded-[8px] p-[28px_24px]">
              <div className="font-[700] text-[10px] font-mono text-[#2563eb] mb-[12px] uppercase">STORAGE</div>
              <h3 className="font-[700] text-[15px] text-[#0a0a0a] mb-[8px]">Histori tersimpan</h3>
              <p className="text-[13px] text-[#6b7280] leading-[1.65]">
                Setiap hasil verifikasi tersimpan di akun kamu dan bisa dijadikan bukti saat berdebat di grup atau komunitas.
              </p>
            </div>
            <div className="bg-white border border-[#e5e7eb] rounded-[8px] p-[28px_24px]">
              <div className="font-[700] text-[10px] font-mono text-[#2563eb] mb-[12px] uppercase">VISION</div>
              <h3 className="font-[700] text-[15px] text-[#0a0a0a] mb-[8px]">Verifikasi via foto</h3>
              <p className="text-[13px] text-[#6b7280] leading-[1.65]">
                Upload screenshot WhatsApp atau berita langsung. AI ekstrak teksnya dan langsung verifikasi tanpa perlu copy-paste.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-[80px] px-[24px] bg-white border-t border-[#f3f4f6]">
        <div className="max-w-[1050px] mx-auto flex flex-col md:flex-row items-center gap-[64px]">
          
          <div className="w-full md:w-[400px] flex-shrink-0">
            <img 
              src="image/MASKOT_SIJELIH_WARNING.png" 
              alt="Maskot SiJelih" 
              className="w-full h-auto aspect-square object-contain"
            />
          </div>

          <div className="flex-1">
            <div className="font-[600] text-[11px] tracking-[0.08em] text-[#9ca3af] font-mono mb-[12px] uppercase">
              PERBANDINGAN
            </div>
            <h2 className="font-[800] text-[34px] tracking-[-0.02em] text-[#0a0a0a] mb-[48px]">
              SiJelih vs cara lama.
            </h2>
            
            <div className="w-full relative">
              <div className="grid grid-cols-[1fr_repeat(2,120px)] md:grid-cols-[1fr_repeat(2,140px)] items-stretch">
                <div className="p-[20px_0] border-b border-[#f3f4f6]"></div>
                <div className="relative bg-[#f0f7ff]/50 border-x border-[#dbeafe] border-t border-[#dbeafe] rounded-t-[12px] p-[24px_16px] flex flex-col items-center justify-end">
                  <div className="absolute top-0 -translate-y-1/2 bg-[#2563eb] text-white text-[10px] font-[800] tracking-wider px-[10px] py-[3px] rounded-full uppercase shadow-sm">Terjeli</div>
                  <span className="font-[800] text-[13px] text-[#1d4ed8]">SiJelih</span>
                </div>
                <div className="p-[24px_12px] border-b border-[#f3f4f6] flex items-end justify-center text-center">
                  <span className="font-[600] text-[12px] text-[#9ca3af]">Cara Lama</span>
                </div>

                <div className="p-[16px_0] border-b border-[#f3f4f6] flex flex-col justify-center">
                  <span className="text-[13px] font-[600] text-[#0a0a0a]">Kecepatan</span>
                </div>
                <div className="bg-[#f0f7ff]/50 border-x border-[#dbeafe] border-b border-[#f3f4f6]/10 p-[16px_12px] flex flex-col items-center justify-center">
                  <div className="flex items-center gap-[4px] text-[#1d4ed8] font-[700] text-[13px]">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    Detik
                  </div>
                </div>
                <div className="p-[16px_12px] border-b border-[#f3f4f6] flex items-center justify-center text-[12px] text-[#9ca3af] text-center">
                  Menit/Jam
                </div>

                <div className="p-[16px_0] border-b border-[#f3f4f6] flex flex-col justify-center">
                  <span className="text-[13px] font-[600] text-[#0a0a0a]">Data BMKG</span>
                </div>
                <div className="bg-[#f0f7ff]/50 border-x border-[#dbeafe] border-b border-[#f3f4f6]/10 p-[16px_12px] flex flex-col items-center justify-center">
                  <div className="flex items-center gap-[4px] text-[#1d4ed8] font-[700] text-[13px]">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    Real-time
                  </div>
                </div>
                <div className="p-[16px_12px] border-b border-[#f3f4f6] flex items-center justify-center text-[12px] text-[#9ca3af] text-center">
                  Arsip
                </div>

                <div className="p-[16px_0] border-b border-[#f3f4f6] flex flex-col justify-center">
                  <span className="text-[13px] font-[600] text-[#0a0a0a]">Konteks</span>
                </div>
                <div className="bg-[#f0f7ff]/50 border-x border-[#dbeafe] border-b border-[#f3f4f6]/10 p-[16px_12px] flex flex-col items-center justify-center">
                  <div className="flex items-center gap-[4px] text-[#1d4ed8] font-[700] text-[13px]">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    Kelurahan
                  </div>
                </div>
                <div className="p-[16px_12px] border-b border-[#f3f4f6] flex items-center justify-center text-[12px] text-[#9ca3af] text-center">
                  Nasional
                </div>

                <div className="p-[16px_0] border-b border-[#f3f4f6] flex flex-col justify-center">
                  <span className="text-[13px] font-[600] text-[#0a0a0a]">Histori</span>
                </div>
                <div className="bg-[#f0f7ff]/50 border-x border-[#dbeafe] border-b border-[#f3f4f6]/10 p-[16px_12px] flex flex-col items-center justify-center">
                  <div className="flex items-center gap-[4px] text-[#1d4ed8] font-[700] text-[13px]">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    Otomatis
                  </div>
                </div>
                <div className="p-[16px_12px] border-b border-[#f3f4f6] flex items-center justify-center text-[12px] text-[#9ca3af] text-center">
                  Manual
                </div>

                <div className="p-[16px_0] flex flex-col justify-center">
                  <span className="text-[13px] font-[600] text-[#0a0a0a]">Foto</span>
                </div>
                <div className="bg-[#f0f7ff]/50 border-x border-[#dbeafe] border-b border-[#dbeafe] rounded-b-[12px] p-[16px_12px] flex flex-col items-center justify-center">
                  <div className="flex items-center gap-[4px] text-[#1d4ed8] font-[700] text-[13px]">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    Bisa
                  </div>
                </div>
                <div className="p-[16px_12px] flex items-center justify-center text-[12px] text-[#9ca3af] text-center">
                  Tidak bisa
                </div>
              </div>
            </div>
            <p className="mt-[24px] text-[#9ca3af] font-mono text-[10px] tracking-wider uppercase">
              SiJelih menggunakan data langsung dari BMKG, bukan database pihak ketiga.
            </p>
          </div>
        </div>
      </section>

      <BencanaSectionWrapper />

      <section className="bg-[#0a0a0a] py-[100px] px-[24px] text-center">
        <h2 className="font-[800] text-[40px] tracking-[-0.02em] text-white">
          Mulai verifikasi sekarang.
        </h2>
        <p className="text-[15px] text-[#6b7280] mt-[12px] mb-[36px]">
          Gratis. Tidak perlu install. Data langsung dari BMKG.
        </p>
        <Link href="/dashboard" className="inline-block bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-[600] text-[14px] px-[26px] py-[11px] rounded-[7px] transition-colors">
          Masuk ke Dashboard
        </Link>
      </section>

      </PageTransition>

      <footer className="bg-[#0a0a0a] border-t border-[#1a1a1a] py-[28px] px-[24px]">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-[12px] flex-wrap">
          <img src="/image/LOGO_WHITE.png" alt="SiJelih" className="h-[40px] w-auto" />
          <div className="text-[12px] text-[#4b5563] text-center">
            Sumber data: BMKG — Badan Meteorologi, Klimatologi, dan Geofisika
          </div>
          <div className="text-[12px] text-[#4b5563]">
            © {new Date().getFullYear()} SiJelih
          </div>
        </div>
      </footer>
    </div>
    </Suspense>
  );
}
