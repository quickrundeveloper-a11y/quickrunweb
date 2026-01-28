import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const place_id = searchParams.get("place_id");

  const GOOGLE_KEY = process.env.GOOGLE_PLACES_KEY;

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${GOOGLE_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  const location = data?.result?.geometry?.location;

  return NextResponse.json({
    lat: location?.lat || null,
    lng: location?.lng || null,
  });
}
