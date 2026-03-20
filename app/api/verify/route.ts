import { NextResponse } from "next/server";
import { getLatestBMKGData, getEarlyWarnings, getWeatherForecast } from "@/lib/bmkg";
import { verifyInfo } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const { text, kodeWilayah } = await req.json();

    if (!text || text.length < 10) {
      return NextResponse.json({ error: "Teks terlalu pendek" }, { status: 400 });
    }

    const [bmkgData, warnings, weather] = await Promise.all([
      getLatestBMKGData(),
      getEarlyWarnings(),
      kodeWilayah ? getWeatherForecast(kodeWilayah) : Promise.resolve([]),
    ]);

    const result = await verifyInfo(text, { bmkgData, weather }, warnings);

    return NextResponse.json({
      verdict: result.verdict,
      confidence: result.confidence,
      alasan: result.alasan,
      sumber: result.sumber,
      saran: result.saran,
      inputText: text,
      checkedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Verifikasi gagal" }, { status: 500 });
  }
}