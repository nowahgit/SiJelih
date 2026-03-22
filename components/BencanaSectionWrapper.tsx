"use client";
import dynamic from "next/dynamic";

const BencanaSection = dynamic(() => import("@/components/BencanaSection"), { ssr: false });

export default function BencanaSectionWrapper() {
  return <BencanaSection />;
}
