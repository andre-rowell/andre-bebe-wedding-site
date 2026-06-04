import { NextResponse } from "next/server";
import { icsForEvent } from "@/lib/calendar";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || !event.isActive) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(icsForEvent(event), {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="${event.slug}.ics"`,
    },
  });
}
