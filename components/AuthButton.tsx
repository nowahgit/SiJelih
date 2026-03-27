"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";

export default function AuthButton() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div className="w-32 h-10 bg-slate-200 animate-pulse rounded-md"></div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-700">{user.displayName}</span>
        {user.photoURL && (
          <img src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full" />
        )}
        <button
          onClick={() => signOut(auth)}
          className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
        >
          Keluar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signInWithPopup(auth, googleProvider)}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm"
    >
      Masuk dengan Google
    </button>
  );
}
