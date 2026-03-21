"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function LandingNavbar() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-[#e5e7eb] h-[56px] min-h-[56px] flex items-center">
        <div className="max-w-[1100px] w-full mx-auto px-[24px] flex justify-between items-center relative h-full">
          <Link href="/" className="flex items-center">
            <img src="/image/LOGO_BLACK.png" alt="SiJelih" className="h-[48px] w-auto" />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-[24px]">
            <Link href="/#cara-kerja" className="text-[13px] text-[#6b7280] hover:text-[#0a0a0a] transition-colors duration-150">
              Cara Kerja
            </Link>
            <Link href="/#fitur" className="text-[13px] text-[#6b7280] hover:text-[#0a0a0a] transition-colors duration-150">
              Fitur
            </Link>
            <Link href="/#tentang" className="text-[13px] text-[#6b7280] hover:text-[#0a0a0a] transition-colors duration-150">
              Tentang
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center">
            {mounted && !loading && !user && (
              <Link href="/login" className="border border-[#0a0a0a] bg-[#0a0a0a] text-white font-[500] text-[13px] px-[16px] py-[7px] rounded-[6px] hover:bg-[#1f1f1f] transition-colors">
                Masuk
              </Link>
            )}
            {mounted && !loading && user && (
              <div className="relative" ref={dropdownRef}>
                <div 
                  className="flex items-center gap-[10px] cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="text-[13px] font-[500] text-[#374151] max-w-[120px] truncate">
                    {user.displayName}
                  </span>
                  <img 
                    src={user.photoURL || ""} 
                    alt="Avatar" 
                    referrerPolicy="no-referrer"
                    className="w-[32px] h-[32px] rounded-full object-cover border border-[#e5e7eb]" 
                  />
                </div>

                {isDropdownOpen && (
                  <div className="absolute top-[44px] right-0 bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] w-[180px] z-50 overflow-hidden text-left">
                    <Link href="/dashboard" className="w-full text-left text-[13px] p-[10px_16px] hover:bg-[#f9fafb] text-[#374151] flex items-center gap-[8px]">
                      <svg className="w-[14px] h-[14px] text-[#9ca3af]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      Dashboard
                    </Link>
                    <button onClick={handleSignOut} className="w-full text-left text-[13px] p-[10px_16px] hover:bg-[#f9fafb] text-[#ef4444] flex items-center gap-[8px]">
                      <svg className="w-[14px] h-[14px] text-[#fca5a5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hamburger Mobile */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="flex items-center justify-center bg-transparent border-none p-2 -mr-2">
              <div className="relative w-6 h-5">
                <span className={`absolute block h-[1.5px] w-6 bg-[#0a0a0a] transform transition duration-200 ease-in-out ${isMobileMenuOpen ? 'rotate-45 top-2.5' : 'top-0'}`}></span>
                <span className={`absolute block h-[1.5px] w-6 bg-[#0a0a0a] transform transition duration-200 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : 'top-[9px]'}`}></span>
                <span className={`absolute block h-[1.5px] w-6 bg-[#0a0a0a] transform transition duration-200 ease-in-out ${isMobileMenuOpen ? '-rotate-45 top-2.5' : 'top-[18px]'}`}></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mounted && isMobileMenuOpen && (
        <div className="md:hidden fixed top-[56px] left-0 right-0 bottom-0 bg-white/95 backdrop-blur-sm z-[100] animate-in fade-in slide-in-from-top-1 duration-200 overflow-y-auto">
          {loading ? (
            <div className="px-[24px] py-[40px] flex justify-center">
              <div className="w-6 h-6 border-2 border-[#f3f4f6] border-t-[#0a0a0a] rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex flex-col min-h-full pb-20">
              {!user ? (
                <>
                  <Link href="/#cara-kerja" className="block p-[16px_24px] text-[15px] font-[500] text-[#374151] hover:bg-[#f9fafb] border-b border-[#f3f4f6] transition-colors">Cara Kerja</Link>
                  <Link href="/#fitur" className="block p-[16px_24px] text-[15px] font-[500] text-[#374151] hover:bg-[#f9fafb] border-b border-[#f3f4f6] transition-colors">Fitur</Link>
                  <Link href="/#tentang" className="block p-[16px_24px] text-[15px] font-[500] text-[#374151] hover:bg-[#f9fafb] border-b border-[#f3f4f6] transition-colors">Tentang</Link>
                  <div className="p-[24px]">
                    <Link href="/login" className="flex items-center justify-center w-full bg-[#0a0a0a] text-white h-[48px] rounded-[8px] text-[15px] font-[600] active:scale-[0.98] transition-all shadow-sm">
                      Masuk ke Akun
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="px-[24px] py-[20px] border-b border-[#f3f4f6] flex items-center gap-[14px] bg-[#f9fafb]">
                    <img src={user.photoURL || ""} alt="Avatar" referrerPolicy="no-referrer" className="w-[44px] h-[44px] rounded-full object-cover border border-[#e5e7eb] shadow-sm" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[15px] font-[700] text-[#0a0a0a] truncate">{user.displayName}</span>
                      <span className="text-[12px] text-[#6b7280] truncate">{user.email}</span>
                    </div>
                  </div>
                  <Link href="/dashboard" className="p-[16px_24px] text-[15px] font-[500] text-[#374151] hover:bg-[#f9fafb] border-b border-[#f3f4f6] flex items-center gap-[12px] transition-colors">
                    <svg className="w-[18px] h-[18px] text-[#9ca3af]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="w-full text-left p-[16px_24px] text-[15px] font-[500] text-[#ef4444] hover:bg-[#fff5f5] flex items-center gap-[12px] transition-colors">
                    <svg className="w-[18px] h-[18px] text-[#fca5a5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Keluar
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
