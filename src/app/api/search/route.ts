import { NextRequest, NextResponse } from "next/server";

const DEXSCREENER_API = "https://api.dexscreener.com";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query || query.length < 2) {
    return NextResponse.json({ pairs: [] });
  }

  try {
    const res = await fetch(
      `${DEXSCREENER_API}/latest/dex/search?q=${encodeURIComponent(query)}`,
      { next: { revalidate: 15 } }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ pairs: [] }, { status: 502 });
  }
}
