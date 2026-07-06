import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, rooms } from "@/lib/schema";
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

  const [booking] = await db
    .update(bookings)
    .set({ status: body.status, paymentStatus: body.paymentStatus })
    .where(eq(bookings.id, id))
    .returning();

  // Check-out bo'lsa xonani bo'shatish
  if (body.status === "checked_out" || body.status === "cancelled") {
    await db.update(rooms).set({ status: "cleaning" }).where(eq(rooms.id, booking.roomId));
  }

  return NextResponse.json(booking);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(bookings).where(eq(bookings.id, id));
  return NextResponse.json({ success: true });
}