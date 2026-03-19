import { NextRequest, NextResponse } from "next/server";

interface Contractor {
  name: string;
  address: string;
  phone: string;
  website: string;
  source: "SAM.gov" | "OpenStreetMap" | "USASpending.gov";
  naics?: string;
  extra?: string;
}

// Keyword → NAICS code
const NAICS_MAP: Record<string, string> = {
  hvac: "238220",
  heating: "238220",
  cooling: "238220",
  electrician: "238210",
  electrical: "238210",
  plumbing: "238220",
  plumber: "238220",
  roofing: "238160",
  painting: "238320",
  concrete: "238110",
  masonry: "238140",
  framing: "238130",
  carpentry: "238130",
  flooring: "238330",
  insulation: "238310",
  landscaping: "561730",
  "information technology": "541512",
  cybersecurity: "541512",
  software: "541511",
  security: "561621",
  janitorial: "561720",
  cleaning: "561720",
  staffing: "561320",
  engineering: "541330",
  architecture: "541310",
  consulting: "541611",
};

function getNaicsCode(keyword: string): string | null {
  const lower = keyword.toLowerCase();
  for (const [key, code] of Object.entries(NAICS_MAP)) {
    if (lower.includes(key)) return code;
  }
  return null;
}

// Keyword → OpenStreetMap craft/shop tags
const OSM_TAGS: Record<string, string[]> = {
  hvac: ["craft=hvac_technician", "craft=heating_engineer"],
  heating: ["craft=hvac_technician", "craft=heating_engineer"],
  cooling: ["craft=hvac_technician"],
  electrician: ["craft=electrician"],
  electrical: ["craft=electrician"],
  plumber: ["craft=plumber"],
  plumbing: ["craft=plumber"],
  roofer: ["craft=roofer"],
  roofing: ["craft=roofer"],
  painter: ["craft=painter"],
  painting: ["craft=painter"],
  carpenter: ["craft=carpenter"],
  carpentry: ["craft=carpenter"],
  mason: ["craft=mason"],
  masonry: ["craft=mason"],
  landscap: ["craft=gardener"],
  cleaning: ["craft=cleaning"],
  builder: ["craft=builder"],
  contractor: ["craft=builder"],
  security: ["craft=locksmith"],
};

function getOsmTags(keyword: string): string[] {
  const lower = keyword.toLowerCase();
  for (const [key, tags] of Object.entries(OSM_TAGS)) {
    if (lower.includes(key)) return tags;
  }
  return [];
}

// ── OpenStreetMap via Overpass API ────────────────────────────────────────────
async function fetchOverpass(keyword: string, location: string): Promise<Contractor[]> {
  try {
    // 1. Geocode location to bounding box via Nominatim
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location + ", USA")}&format=json&limit=1`,
      { headers: { "User-Agent": "NEXUS-ERP/1.0 contractor-importer" } }
    );
    if (!geoRes.ok) return [];
    const geoData = await geoRes.json();
    const place = geoData[0];
    if (!place) return [];

    // Nominatim boundingbox: [south, north, west, east]
    const [south, north, west, east] = place.boundingbox;
    const bbox = `${south},${west},${north},${east}`;

    const osmTags = getOsmTags(keyword);

    // Build Overpass QL query
    let nodeLines = "";
    if (osmTags.length > 0) {
      nodeLines = osmTags
        .map((tag) => {
          const [k, v] = tag.split("=");
          return `  node["${k}"="${v}"](${bbox});\n  way["${k}"="${v}"](${bbox});`;
        })
        .join("\n");
    } else {
      // Fallback: any craft/shop node whose name contains the keyword
      nodeLines = [
        `  node["name"~"${keyword}",i]["craft"](${bbox});`,
        `  node["name"~"${keyword}",i]["shop"](${bbox});`,
        `  way["name"~"${keyword}",i]["craft"](${bbox});`,
      ].join("\n");
    }

    const query = `[out:json][timeout:25];\n(\n${nodeLines}\n);\nout body center 20;`;

    const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: { "Content-Type": "text/plain" },
    });
    if (!overpassRes.ok) return [];
    const data = await overpassRes.json();

    return (data.elements || [])
      .filter((el: any) => el.tags?.name)
      .map((el: any): Contractor => {
        const t = el.tags;
        const addrParts = [
          t["addr:housenumber"] && t["addr:street"]
            ? `${t["addr:housenumber"]} ${t["addr:street"]}`
            : t["addr:street"],
          t["addr:city"],
          t["addr:state"],
          t["addr:postcode"],
        ].filter(Boolean);

        return {
          name: t.name || "",
          address: addrParts.length ? addrParts.join(", ") : location,
          phone: t.phone || t["contact:phone"] || "",
          website: t.website || t["contact:website"] || t.url || "",
          source: "OpenStreetMap",
        };
      });
  } catch {
    return [];
  }
}

// ── USASpending.gov ───────────────────────────────────────────────────────────
async function fetchUSASpending(keyword: string, location: string): Promise<Contractor[]> {
  try {
    const [city, stateRaw] = location.split(",").map((s) => s.trim());
    const state = stateRaw?.split(" ")[0]?.toUpperCase() || "";

    const body = {
      filters: {
        keywords: [keyword],
        recipient_location: [
          { country: "USA", ...(state && { state }), ...(city && { city }) },
        ],
        award_type_codes: ["A", "B", "C", "D"],
      },
      fields: ["Recipient Name", "Award Amount", "NAICS Code", "NAICS Description"],
      limit: 50,
      page: 1,
      sort: "Award Amount",
      order: "desc",
    };

    const res = await fetch("https://api.usaspending.gov/api/v2/search/spending_by_award/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return [];
    const data = await res.json();

    const seen = new Set<string>();
    const results: Contractor[] = [];

    for (const award of data.results || []) {
      const name = (award["Recipient Name"] || "").trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);

      const amount = award["Award Amount"];
      const naics = award["NAICS Code"];
      const naicsDesc = award["NAICS Description"];

      results.push({
        name,
        address: [city, state].filter(Boolean).join(", "),
        phone: "",
        website: "",
        source: "USASpending.gov",
        naics: naics || undefined,
        extra: amount
          ? `Awarded $${Number(amount).toLocaleString()}`
          : naicsDesc || undefined,
      });

      if (results.length >= 20) break;
    }

    return results;
  } catch {
    return [];
  }
}

// ── SAM.gov ───────────────────────────────────────────────────────────────────
async function fetchSam(keyword: string, location: string): Promise<Contractor[]> {
  const key = process.env.SAM_API_KEY;
  if (!key) return [];
  try {
    const [city, stateRaw] = location.split(",").map((s) => s.trim());
    const state = stateRaw?.split(" ")[0] || "";
    const naics = getNaicsCode(keyword);

    const params = new URLSearchParams({
      api_key: key,
      registrationStatus: "A",
      includeSections: "entityRegistration,coreData,pointsOfContact,assertions",
      limit: "20",
    });

    if (naics) {
      params.set("naicsCode", naics);
    } else {
      params.set("legalBusinessName", `%${keyword}%`);
    }
    if (city) params.set("physicalAddressCity", city);
    if (state) params.set("physicalAddressStateOrProvinceCode", state);

    const res = await fetch(`https://api.sam.gov/entity-information/v3/entities?${params}`);
    if (!res.ok) return [];
    const data = await res.json();

    return (data.entityData || []).map((e: any): Contractor => {
      const reg = e.entityRegistration || {};
      const addr = e.coreData?.physicalAddress || {};
      const poc = e.pointsOfContact?.electronicBusinessPOC || {};
      const naicsCode = e.assertions?.goodsAndServices?.primaryNaics || naics || undefined;

      return {
        name: reg.legalBusinessName || "",
        address: [addr.addressLine1, addr.city, addr.stateOrProvinceCode, addr.zipCode]
          .filter(Boolean)
          .join(", "),
        phone: poc.telephoneNumber || "",
        website: "",
        source: "SAM.gov",
        naics: naicsCode,
      };
    });
  } catch {
    return [];
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("keyword") || "";
  const location = req.nextUrl.searchParams.get("location") || "";

  if (!keyword || !location) return NextResponse.json({ results: [] });

  const [osmResult, usaResult, samResult] = await Promise.allSettled([
    fetchOverpass(keyword, location),
    fetchUSASpending(keyword, location),
    fetchSam(keyword, location),
  ]);

  const results: Contractor[] = [
    ...(osmResult.status === "fulfilled" ? osmResult.value : []),
    ...(usaResult.status === "fulfilled" ? usaResult.value : []),
    ...(samResult.status === "fulfilled" ? samResult.value : []),
  ];

  return NextResponse.json({ results });
}
