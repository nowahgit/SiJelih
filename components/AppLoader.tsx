"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import LoadingScreen from "./LoadingScreen";

export default function AppLoader() {
  const [user, loading] = useAuthState(auth);
  return <LoadingScreen isVisible={loading} />;
}
