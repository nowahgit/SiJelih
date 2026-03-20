import { NextResponse } from "next/server";
import { getLatestBMKGData, getEarlyWarnings } from "@/lib/bmkg";

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: "Data gambar tidak lengkap" }, { status: 400 });
    }

    const [bmkgData, warnings] = await Promise.all([
      getLatestBMKGData(),
      getEarlyWarnings()
    ]);

    const promptText = `Kamu adalah SiJelih, sistem verifikasi informasi bencana alam Indonesia. Baca semua teks yang ada di gambar ini, lalu verifikasi klaim tersebut berdasarkan data BMKG berikut: ${JSON.stringify({ bmkgData, warnings })}. Balas HANYA dengan JSON: { "verdict": "TERKONFIRMASI" | "BELUM_TERVERIFIKASI" | "HOAKS", "confidence": number, "alasan": "string", "sumber": "string", "saran": "string", "extractedText": "string" }`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: promptText },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } }
            ]
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`Groq API error ${response.status}: ${JSON.stringify(errorBody)}`);
    }

    const data = await response.json();
    const cleanJson = data.choices[0].message.content.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanJson);

    return NextResponse.json({
      verdict: result.verdict,
      confidence: result.confidence,
      alasan: result.alasan,
      sumber: result.sumber,
      saran: result.saran,
      extractedText: result.extractedText,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("verify-image error:", error);
    return NextResponse.json({ error: "Verifikasi gagal", detail: String(error) }, { status: 500 });
  }
}
