"use client";
export const dynamic = "force-dynamic";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import LoadingScreen from "@/components/LoadingScreen";

export default function LoginPage() {
  const [user, loading] = useAuthState(auth);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return <LoadingScreen isVisible={true} />;
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f9fafb]" />}>
    <>
      <LoadingScreen isVisible={loading || Boolean(user)} />
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9fafb] p-4">
        <div className="bg-white p-8 rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#e5e7eb] max-w-sm w-full flex flex-col items-center gap-8">
          <div className="text-center flex flex-col items-center">
            <img src="/image/LOGO_BLACK.png" alt="SiJelih" className="h-[68px] w-auto mb-6" />
            <h1 className="text-[24px] font-[700] text-[#0a0a0a] mb-2">Masuk ke SiJelih</h1>
            <p className="text-[#6b7280] text-[14px]">Masuk untuk menyimpan histori verifikasi</p>
          </div>
          
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-[12px] bg-white border border-[#d1d5db] hover:bg-[#f9fafb] text-[#374151] px-[16px] py-[12px] rounded-[8px] font-[500] text-[14px] transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <div className="flex items-center gap-2 justify-center">
                <div className="w-[14px] h-[14px] rounded-full border-[1.5px] border-current border-t-transparent animate-spin"></div>
                Menghubungkan...
              </div>
            ) : (
              <>
                <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Lanjutkan dengan Google
              </>
            )}
          </button>
        </div>
      </div>
    </>
    </Suspense>
  );
}
