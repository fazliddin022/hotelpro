import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, rooms, guests } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await db
    .select({
      id: bookings.id,
      checkIn: bookings.checkIn,
      checkOut: bookings.checkOut,
      nights: bookings.nights,
      totalPrice: bookings.totalPrice,
      status: bookings.status,
      paymentStatus: bookings.paymentStatus,
      adults: bookings.adults,
      children: bookings.children,
      notes: bookings.notes,
      createdAt: bookings.createdAt,
      roomId: bookings.roomId,
      roomNumber: rooms.number,
      roomType: rooms.type,
      roomPrice: rooms.pricePerNight,
      guestId: bookings.guestId,
      guestFirstName: guests.firstName,
      guestLastName: guests.lastName,
      guestPhone: guests.phone,
    })
    .from(bookings)
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .innerJoin(guests, eq(bookings.guestId, guests.id))
    .orderBy(desc(bookings.createdAt));

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Tunlar sonini hisoblash
  const checkIn = new Date(body.checkIn);
  const checkOut = new Date(body.checkOut);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000);

  // Xona narxini olish
  const [room] = await db.select().from(rooms).where(eq(rooms.id, body.roomId));
  const totalPrice = nights * room.pricePerNight;

  const [booking] = await db.insert(bookings).values({
    roomId: body.roomId,
    guestId: body.guestId,
    staffId: session.user.id,
    checkIn: body.checkIn,
    checkOut: body.checkOut,
    nights,
    totalPrice,
    status: "confirmed",
    paymentStatus: "unpaid",
    adults: Number(body.adults) || 1,
    children: Number(body.children) || 0,
    notes: body.notes || null,
  }).returning();

  // Xona statusini "occupied" ga o'zgartirish
  await db.update(rooms).set({ status: "occupied" }).where(eq(rooms.id, body.roomId));

  return NextResponse.json(booking);
}