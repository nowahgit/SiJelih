export async function getLatestBMKGData() {
  const isBrowser = typeof window !== "undefined";
  
  try {
    if (isBrowser) {
        const res = await fetch("/api/bmkg?type=latest", { cache: "no-store" });
        return await res.json();
    }

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
    console.error("Latest BMKG Data Fetch Error:", error);
    return null;
  }
}

export async function getEarlyWarnings() {
  const isBrowser = typeof window !== "undefined";
  
  try {
    if (isBrowser) {
      const res = await fetch("/api/bmkg?type=warnings", { cache: "no-store" });
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }

    const res = await fetch("https://www.bmkg.go.id/alerts/nowcast/id", { 
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
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
    console.error("Early Warnings Fetch Error:", error);
    return [];
  }
}

export async function geoSearch(query: string) {
    try {
        const res = await fetch(`/api/bmkg?type=search_geo&q=${encodeURIComponent(query)}`);
        return await res.json();
    } catch (e) {
        console.error("Geo search failed", e);
        return [];
    }
}

export async function searchAdm4Code(locationInfo: any) {
  try {
    // Brain move: Menggunakan POST agar tidak bocor URL length limit dan parsing yang lebih aman.
    const res = await fetch(`/api/bmkg`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "search_adm4", loc: locationInfo }),
        cache: "no-store" 
    });
    const data = await res.json();
    return data.code || null;
  } catch (error) {
    console.error("AI ADM4 Search Error:", error);
    return null;
  }
}

export async function getWeatherForecast(kodeWilayah: string) {
  const isBrowser = typeof window !== "undefined";
  
  try {
    if (isBrowser) {
      const res = await fetch(`/api/bmkg?type=weather&adm4=${kodeWilayah}`, { cache: "no-store" });
      const data = await res.json();
      return parseWeather(data);
    }

    const res = await fetch(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${kodeWilayah}`, { cache: "no-store" });
    const data = await res.json();
    return parseWeather(data);

  } catch (error) {
    console.error("Weather Forecast Fetch Error:", error);
    return [];
  }
}

function parseWeather(data: any) {
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
}
