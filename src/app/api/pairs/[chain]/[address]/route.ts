import { NextRequest, NextResponse } from "next/server";

const DEXSCREENER_API = "https://api.dexscreener.com";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chain: string; address: string }> }
) {
  const { chain, address } = await params;

  try {
    const res = await fetch(
      `${DEXSCREENER_API}/latest/dex/pairs/${chain}/${address}`,
      { next: { revalidate: 15 } }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ pairs: [] }, { status: 502 });
  }
}
