import { NextResponse } from "next/server";

const BASE_URL = "https://maps.googleapis.com/maps/api/place";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword");
  const location = searchParams.get("location");
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!keyword || !location || !apiKey) {
    return NextResponse.json(
      { error: "Missing parameters", keyword, location, apiKeyExists: !!apiKey },
      { status: 400 }
    );
  }

  try {
    const query = `${keyword} in ${location}`;
    let nextPageToken: string | undefined = undefined;
    let allResults: any[] = [];

    // Fetch all pages (Google usually gives up to 3 pages)
    do {
      const url = `${BASE_URL}/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}${
        nextPageToken ? `&pagetoken=${nextPageToken}` : ""
      }`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));

      allResults = allResults.concat(data.results || []);
      nextPageToken = data.next_page_token;

      // Google requires ~2s delay before next_page_token becomes active
      if (nextPageToken) await new Promise((r) => setTimeout(r, 2500));
    } while (nextPageToken);

    // Fetch detailed info for each place
    const detailedResults = await Promise.all(
      allResults.map(async (place) => {
        try {
          const detailUrl = `${BASE_URL}/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,international_phone_number,address_components&key=${apiKey}`;
          const res = await fetch(detailUrl);
          const detailData = await res.json();
          const details = detailData.result || {};

          // Extract city and state from address components
          let city = "";
          let state = "";
          if (details.address_components) {
            for (const c of details.address_components) {
              if (c.types.includes("locality")) city = c.long_name;
              if (c.types.includes("administrative_area_level_1")) state = c.short_name;
            }
          }

          return {
            name: details.name || "N/A",
            city: city || "N/A",
            state: state || "N/A",
            phone: details.formatted_phone_number || details.international_phone_number || "N/A",
            email: "N/A", // Google Places doesn’t return email — we’ll leave this placeholder
            website: details.website || "N/A",
          };
        } catch (e) {
          console.error("Error fetching details:", e);
          return {
            name: place.name || "N/A",
            city: "N/A",
            state: "N/A",
            phone: "N/A",
            email: "N/A",
            website: "N/A",
          };
        }
      })
    );

    return NextResponse.json({ results: detailedResults });
  } catch (err) {
    console.error("Google Maps fetch failed:", err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
