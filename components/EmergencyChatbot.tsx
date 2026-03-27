"use client";
import { useState, useRef, useEffect } from "react";
import { Nunito } from "next/font/google";

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export default function EmergencyChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "assistant" | "user"; content: string }[]>([
    { role: "assistant", content: "Halo, saya Asisten Darurat SiJelih. Apa yang bisa saya bantu? Saya bisa memberikan panduan pertolongan pertama atau informasi evakuasi mendesak." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsTyping(true);

    try {
      // Menggunakan Proxy API yang sudah ada agar aman
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!response.ok) throw new Error("Gagal menghubungi asisten");

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Maaf, saya sedang mengalami kendala teknis. Harap hubungi nomor darurat 112 jika dalam bahaya." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`fixed bottom-[24px] right-[24px] z-[9999] ${nunito.className}`}>
      {/* Tombol Mengambang */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-[56px] h-[56px] rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 ${
          isOpen ? "bg-[#0a0a0a] scale-90" : "bg-[#2563eb] hover:bg-[#1d4ed8] scale-100"
        }`}
      >
        {isOpen ? (
          <svg className="w-[20px] h-[20px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-[24px] h-[24px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Jendela Chat */}
      <div
        className={`absolute bottom-[72px] right-0 w-[360px] max-w-[calc(100vw-48px)] bg-white border border-[#e5e7eb] rounded-[16px] shadow-[0_12px_48px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-300 transform origin-bottom-right ${
          isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-[#0a0a0a] p-[16px_20px] flex justify-between items-center text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-[8px] h-[8px] rounded-full bg-green-500"></div>
            <div>
              <div className="text-[13px] font-[700] leading-none mb-1">Asisten Darurat SiJelih</div>
              <div className="text-[10px] text-[#9ca3af] font-mono leading-none uppercase tracking-wider">Online · Berbasis NLP</div>
            </div>
          </div>
        </div>

        {/* Messages Space */}
        <div 
          ref={scrollRef}
          className="h-[380px] overflow-y-auto p-5 pb-2 bg-[#fafafa] flex flex-col gap-4 scroll-smooth"
        >
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-[10px_14px] rounded-[12px] text-[13px] leading-[1.6] ${
                msg.role === "user" 
                ? "bg-[#2563eb] text-white rounded-br-none" 
                : "bg-white border border-[#e5e7eb] text-[#374151] shadow-sm rounded-bl-none"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#e5e7eb] p-[10px_14px] rounded-[12px] rounded-bl-none shadow-sm flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-[#9ca3af] rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-[#9ca3af] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-[#9ca3af] rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 border-t border-[#f3f4f6] bg-white">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan panduan pertolongan..."
              className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] p-[10px_48px_10px_14px] text-[13px] focus:ring-1 focus:ring-[#0a0a0a] focus:outline-none transition-all placeholder-[#9ca3af]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`absolute right-[6px] top-1/2 -translate-y-1/2 w-[32px] h-[32px] flex items-center justify-center rounded-[6px] transition-all ${
                input.trim() ? "bg-[#0a0a0a] text-white" : "bg-transparent text-[#d1d5db]"
              }`}
            >
              <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
          <div className="mt-2 text-[10px] text-center text-[#9ca3af] font-[500] uppercase tracking-tighter">
            Didukung oleh NLP SiJelih · Respon Mungkin Memerlukan Verifikasi Medis
          </div>
        </form>
      </div>
    </div>
  );
}
