import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guests } from "@/lib/schema";
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

  const [guest] = await db.update(guests).set({
    firstName: body.firstName,
    lastName: body.lastName,
    phone: body.phone,
    email: body.email || null,
    passportNumber: body.passportNumber || null,
    nationality: body.nationality || null,
    address: body.address || null,
  }).where(eq(guests.id, id)).returning();

  return NextResponse.json(guest);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(guests).where(eq(guests.id, id));
  return NextResponse.json({ success: true });
}