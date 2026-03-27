import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/providers/ToastProvider";
import AppLoader from "@/components/AppLoader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SiJelih — Verifikasi Informasi Bencana",
  description: "Dapatkan kebenaran sekarang dari data resmi BMKG",
  other: {
    "dicoding:email": "elnoahamm@gmail.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className={`min-h-full flex flex-col ${inter.className}`}>
        <AppLoader />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
