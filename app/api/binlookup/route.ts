import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bin = searchParams.get("bin");

    if (!bin) {
      return NextResponse.json({ error: "BIN missing" }, { status: 400 });
    }

    const res = await fetch(`https://lookup.binlist.net/${bin}`, {
      headers: { "Accept-Version": "3" },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "BIN not found" }, { status: 404 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
