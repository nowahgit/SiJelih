export async function verifyInfo(
  userInput: string,
  bmkgData: object | null,
  warnings: object[]
) {
  const prompt = `Kamu adalah SiJelih, sistem verifikasi informasi bencana alam Indonesia yang jeli dan terpercaya.

DATA REAL-TIME BMKG:
Gempa: ${JSON.stringify(bmkgData)}
Peringatan Dini: ${JSON.stringify(warnings)}

INFORMASI YANG DIVERIFIKASI:
"${userInput}"

Balas HANYA dengan JSON berikut tanpa teks lain:
{
  "verdict": "TERKONFIRMASI" atau "BELUM_TERVERIFIKASI" atau "HOAKS",
  "confidence": angka 0-100,
  "alasan": "2-3 kalimat penjelasan berbasis data BMKG di atas",
  "sumber": "sumber data BMKG yang digunakan untuk verifikasi",
  "saran": "tindakan konkret yang disarankan untuk pengguna"
}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}