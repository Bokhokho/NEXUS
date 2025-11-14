import { NextResponse } from "next/server";

const BASE_URL = "https://maps.googleapis.com/maps/api/place";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword");
  const location = searchParams.get("location");
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!keyword || !location || !apiKey) {
    return NextResponse.json(
      {
        error: "Missing parameters",
        keyword,
        location,
        apiKeyExists: !!apiKey,
      },
      { status: 400 }
    );
  }

  try {
    const query = `${keyword} in ${location}`;
    let nextPageToken: string | undefined = undefined;
    let allResults: any[] = [];

    // Fetch up to 3 pages
    do {
      const url: string = `${BASE_URL}/textsearch/json?query=${encodeURIComponent(
        query
      )}&key=${apiKey}${nextPageToken ? `&pagetoken=${nextPageToken}` : ""}`;

      const res: Response = await fetch(url);
      const data: any = await res.json();

      if (!res.ok) {
        console.error("Google TextSearch Error:", data);
        throw new Error("Google TextSearch failed");
      }

      allResults = allResults.concat(data.results || []);
      nextPageToken = data.next_page_token;

      // Google needs ~2s for next_page_token activation
      if (nextPageToken) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } while (nextPageToken);

    // Fetch details
    const detailedResults = await Promise.all(
      allResults.map(async (place) => {
        try {
          const detailUrl = `${BASE_URL}/details/json?place_id=${
            place.place_id
          }&fields=name,formatted_address,formatted_phone_number,website,international_phone_number,address_components&key=${apiKey}`;

          const res = await fetch(detailUrl);
          const data = await res.json();
          const d = data.result || {};

          // Extract city + state
          let city = "N/A";
          let state = "N/A";

          if (d.address_components) {
            for (const c of d.address_components) {
              if (c.types.includes("locality")) city = c.long_name;
              if (c.types.includes("administrative_area_level_1"))
                state = c.short_name;
            }
          }

          return {
            name: d.name || "N/A",
            city,
            state,
            phone:
              d.formatted_phone_number ||
              d.international_phone_number ||
              "N/A",
            email: "N/A",
            website: d.website || "N/A",
          };
        } catch (err) {
          console.error("Details fetch error:", err);
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
    console.error("Maps API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
