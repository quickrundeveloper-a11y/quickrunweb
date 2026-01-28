import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get("input");

  const GOOGLE_KEY = process.env.GOOGLE_PLACES_KEY;

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input!
  )}&components=country:in&key=${GOOGLE_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  return NextResponse.json(data);
}