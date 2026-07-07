import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guests } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await db.select().from(guests).orderBy(desc(guests.createdAt));
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const [guest] = await db.insert(guests).values({
    firstName: body.firstName,
    lastName: body.lastName,
    phone: body.phone,
    email: body.email || null,
    passportNumber: body.passportNumber || null,
    nationality: body.nationality || null,
    address: body.address || null,
  }).returning();

  return NextResponse.json(guest);
}