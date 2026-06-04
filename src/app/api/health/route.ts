import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "andre-bebe-wedding-site",
    timestamp: new Date().toISOString(),
  });
}
