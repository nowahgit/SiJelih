export async function getLatestBMKGData() {
  try {
    const [autoGempaRes, gempaDirasakanRes] = await Promise.all([
      fetch("https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json", { cache: "no-store" }),
      fetch("https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json", { cache: "no-store" })
    ]);
    
    const autoGempa = await autoGempaRes.json();
    const gempaDirasakan = await gempaDirasakanRes.json();
    
    return {
      autoGempa: autoGempa?.Infogempa?.gempa || null,
      gempaDirasakan: gempaDirasakan?.Infogempa?.gempa || []
    };
  } catch (error) {
    return null;
  }
}

export async function getEarlyWarnings() {
  try {
    const res = await fetch("https://www.bmkg.go.id/alerts/nowcast/id", { cache: "no-store" });
    const xml = await res.text();
    
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
    
    return warnings;
  } catch (error) {
    return [];
  }
}

export async function getWeatherForecast(kodeWilayah: string) {
  try {
    const res = await fetch(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${kodeWilayah}`, { cache: "no-store" });
    const data = await res.json();
    
    const forecasts = data?.data?.[0]?.cuaca?.[0] || [];
    const result = [];
    
    for (let i = 0; i < Math.min(8, forecasts.length); i++) {
        const item = forecasts[i];
        result.push({
            waktu: item.local_datetime,
            cuaca: item.weather_desc,
            suhu: item.t,
            kelembapan: item.hu,
            angin_kmh: item.ws
        });
    }
    
    return result;
  } catch (error) {
    return [];
  }
}
