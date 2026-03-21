import { NextResponse } from "next/server";
import { getLatestBMKGData, getEarlyWarnings } from "@/lib/bmkg";

export async function POST(req: Request) {
  try {
    const { disasterType, location } = await req.json();
    
    const [bmkgData, earlyWarnings] = await Promise.all([
      getLatestBMKGData(),
      getEarlyWarnings()
    ]);

    const context = JSON.stringify({ bmkgData, earlyWarnings });
    
    const prompt = `Kamu adalah instruktur kesiapsiagaan bencana Indonesia yang berpengalaman. Buat 5 pertanyaan simulasi bencana ${disasterType} untuk wilayah ${location} berdasarkan kondisi real saat ini: ${context}. Setiap pertanyaan harus berupa skenario darurat yang realistis dengan 4 pilihan jawaban. Satu jawaban benar, tiga jawaban salah tapi masuk akal. Jawab HANYA dengan JSON array tanpa teks lain: [{ 'question': 'skenario pertanyaan', 'options': ['pilihan A', 'pilihan B', 'pilihan C', 'pilihan D'], 'correctIndex': 0, 'explanation': 'penjelasan singkat mengapa jawaban ini benar' }]. Pertanyaan harus dalam Bahasa Indonesia, spesifik untuk jenis bencana dan lokasi tersebut, dan mencerminkan protokol BNPB yang benar.`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const groqData = await groqRes.json();
    let content = groqData.choices[0].message.content;
    
    if (content.includes("```")) {
      content = content.split("```")[1].replace(/^json/, "").trim();
    }
    
    const questionsWithKey = JSON.parse(content);
    const sessionToken = Buffer.from(JSON.stringify(questionsWithKey)).toString("base64");
    
    const questionsForClient = questionsWithKey.map((q: any) => {
      const { correctIndex, explanation, ...rest } = q;
      return rest;
    });

    return NextResponse.json({ questions: questionsForClient, sessionToken });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat simulasi" }, { status: 500 });
  }
}
