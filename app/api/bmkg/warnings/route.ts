import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://www.bmkg.go.id/alerts/nowcast/id", { 
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    
    if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch from BMKG" }, { status: res.status });
    }

    const xml = await res.text();
    
    // We can parse it here on the server to save client bandwidth
    const warnings = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title>([\s\S]*?)<\/title>/;
    const descRegex = /<description>([\s\S]*?)<\/description>/;
    const dateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;
    
    let match;
    let count = 0;
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
  } catch (error) {
    console.error("BMKG Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
