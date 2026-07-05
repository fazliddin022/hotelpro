import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rooms } from "@/lib/schema";
import { auth } from "@/lib/auth-config";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await db.select().from(rooms);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const [room] = await db.insert(rooms).values({
    number: body.number,
    type: body.type,
    floor: Number(body.floor),
    capacity: Number(body.capacity),
    pricePerNight: Number(body.pricePerNight),
    status: body.status || "available",
    amenities: body.amenities || [],
    description: body.description || null,
  }).returning();

  return NextResponse.json(room);
}