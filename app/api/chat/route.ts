import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const prompt = `Kamu adalah Asisten Darurat SiJelih berbasis NLP (Natural Language Processing).
Tugasmu adalah memberikan panduan pertolongan pertama (First Aid) yang akurat, tenang, dan mudah diikuti, atau petunjuk evakuasi saat terjadi bencana alam di Indonesia.

ATURAN:
1. Balas dengan bahasa Indonesia yang sopan, tenang, dan profesional.
2. JANGAN menggunakan format markdown yang berlebihan. Cukup poin-poin sederhana.
3. Selalu ingatkan pengguna untuk menghubungi 112 atau petugas medis profesional jika situasi memburuk.
4. Jangan memberikan saran medis yang bersifat spekulatif atau berbahaya.
5. Jika ditanya tentang rute evakuasi, berikan panduan umum seperti "cari tempat tinggi jika tsunami" atau "jauhi bangunan jika gempa".

PESAN PENGGUNA: "${message}"`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content.trim();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chatbot API Error:", error);
    return NextResponse.json(
      { reply: "Maaf, sistem sedang sibuk. Silakan tetap tenang dan cari bantuan terdekat." },
      { status: 500 }
    );
  }
}
