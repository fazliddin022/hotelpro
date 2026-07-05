import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rooms } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const [room] = await db.update(rooms).set({
    number: body.number,
    type: body.type,
    floor: Number(body.floor),
    capacity: Number(body.capacity),
    pricePerNight: Number(body.pricePerNight),
    status: body.status,
    amenities: body.amenities || [],
    description: body.description || null,
  }).where(eq(rooms.id, id)).returning();

  return NextResponse.json(room);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(rooms).where(eq(rooms.id, id));
  return NextResponse.json({ success: true });
}