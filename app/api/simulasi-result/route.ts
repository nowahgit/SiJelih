import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { disasterType, location, answers, sessionToken } = await req.json();
    
    const questionsWithKey = JSON.parse(Buffer.from(sessionToken, "base64").toString("utf-8"));
    
    let score = 0;
    const questionsWithAnswers = questionsWithKey.map((q: any, i: number) => {
      const isCorrect = answers[i] === q.options[q.correctIndex];
      if (isCorrect) score += 20;
      return {
        question: q.question,
        userAnswer: answers[i],
        correctAnswer: q.options[q.correctIndex],
        isCorrect,
        explanation: q.explanation
      };
    });

    const prompt = `Kamu adalah instruktur kesiapsiagaan bencana Indonesia. Evaluasi hasil simulasi bencana ${disasterType} di ${location} berikut. Pertanyaan dan jawaban user: ${JSON.stringify(questionsWithAnswers)}. Skor total: ${score}/100. Berikan evaluasi yang konstruktif, spesifik per pertanyaan yang salah, dan motivasi untuk terus belajar. Gunakan Bahasa Indonesia yang ramah dan tidak menghakimi. Maksimal 200 kata. Jawab hanya dengan teks evaluasi, bukan JSON.`;

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
    const feedback = groqData.choices[0].message.content;

    return NextResponse.json({ score, feedback });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memproses hasil simulasi" }, { status: 500 });
  }
}
