import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const adm4 = searchParams.get("adm4");
  const q = searchParams.get("q");

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.bmkg.go.id/"
  };

  try {
    if (type === "search_geo") {
        if (!q) return NextResponse.json({ error: "Query required" }, { status: 400 });
        const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=1`, { headers });
        const data = await nomRes.json();
        return NextResponse.json(data);
    }

    if (type === "warnings") {
      const res = await fetch("https://www.bmkg.go.id/alerts/nowcast/id", { cache: "no-store", headers });
      const xml = await res.text();
      const warnings = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      const titleRegex = /<title>([\s\S]*?)<\/title>/;
      const descRegex = /<description>([\s\S]*?)<\/description>/;
      const dateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;
      let match; let count = 0;
      while ((match = itemRegex.exec(xml)) !== null && count < 5) {
        const itemXml = match[1];
        const titleMatch = titleRegex.exec(itemXml);
        const descMatch = descRegex.exec(itemXml);
        const dateMatch = dateRegex.exec(itemXml);
        warnings.push({
          judul: titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "",
          deskripsi: descMatch ? descMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "",
          waktu: dateMatch ? dateMatch[1].trim() : ""
        });
        count++;
      }
      return NextResponse.json(warnings);
    } 

    if (type === "latest") {
      const [autoGempaRes, gempaDirasakanRes] = await Promise.all([
        fetch("https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json", { cache: "no-store", headers }),
        fetch("https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json", { cache: "no-store", headers })
      ]);
      const autoGempa = await autoGempaRes.json();
      const gempaDirasakan = await gempaDirasakanRes.json();
      return NextResponse.json({
        autoGempa: autoGempa?.Infogempa?.gempa || null,
        gempaDirasakan: gempaDirasakan?.Infogempa?.gempa || []
      });
    }

    if (type === "weather" && adm4) {
      const res = await fetch(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${adm4}`, { cache: "no-store", headers });
      if (!res.ok) return NextResponse.json({ error: "BMKG API error" }, { status: res.status });
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid GET type" }, { status: 400 });
  } catch (error) {
    console.error("BMKG Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, loc } = body;

        if (type === "search_adm4" && loc) {
            const prompt = `System: Kamu adalah data spesialis kode administrasi BMKG Indonesia.
User: Cari kode wilayah Administrasi Level 4 (Kelurahan/Desa) Kemendagri (13 digit) yang digunakan BMKG untuk:
- Kelurahan/Desa: ${loc.address?.village || loc.address?.suburb || loc.address?.neighbourhood || ""}
- Kecamatan: ${loc.address?.city_district || loc.address?.town || ""}
- Kota/Kabupaten: ${loc.address?.city || loc.address?.county || ""}
- Provinsi: ${loc.address?.state || ""}

Aturan:
1. Kode HARUS 13 digit dengan titik (contoh: 33.72.01.1001).
2. Kode Karangasem Surakarta adalah 33.72.01.1001.
3. Kode Kebon Kosong Jakarta Pusat adalah 31.71.03.1002.
4. Gunakan database internalmu untuk wilayah lain di Indonesia.
5. Kembalikan HANYA JSON: {"code": "XX.XX.XX.XXXX"}. Jika tidak ditemukan, {"code": null}.`;

            const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" },
                    temperature: 0,
                }),
            });

            const aiData = await aiResponse.json();
            const result = JSON.parse(aiData.choices[0].message.content);
            
            // Post-processing: Pastikan format kode benar (13 digit dengan titik)
            let finalCode = result.code;
            if (finalCode && /^[0-9.]+$/.test(finalCode)) {
                // Done
            } else {
                finalCode = null;
            }

            return NextResponse.json({ code: finalCode });
        }

        return NextResponse.json({ error: "Invalid POST type" }, { status: 400 });
    } catch (error) {
        console.error("BMKG Proxy POST Error:", error);
        return NextResponse.json({ code: null });
    }
}
