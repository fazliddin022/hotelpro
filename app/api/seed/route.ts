import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { staff, rooms, guests, bookings } from "@/lib/schema";
import bcrypt from "bcryptjs";

export async function GET() {
  await db.delete(bookings);
  await db.delete(guests);
  await db.delete(rooms);
  await db.delete(staff);

  // Staff
  const adminPass = await bcrypt.hash("admin123", 10);
  const receptionPass = await bcrypt.hash("reception123", 10);

  await db.insert(staff).values([
    { name: "Admin Adminov", email: "admin@hotelpro.uz", password: adminPass, role: "admin", phone: "+998901111111" },
    { name: "Registrator Holiqov", email: "reception@hotelpro.uz", password: receptionPass, role: "receptionist", phone: "+998902222222" },
  ]);

  // Rooms
  const insertedRooms = await db.insert(rooms).values([
    { number: "101", type: "standard", floor: 1, capacity: 2, pricePerNight: 80, status: "available", amenities: ["Wi-Fi", "TV", "Shower"] },
    { number: "102", type: "standard", floor: 1, capacity: 2, pricePerNight: 80, status: "occupied", amenities: ["Wi-Fi", "TV", "Shower"] },
    { number: "103", type: "standard", floor: 1, capacity: 2, pricePerNight: 80, status: "cleaning", amenities: ["Wi-Fi", "TV", "Shower"] },
    { number: "201", type: "deluxe", floor: 2, capacity: 3, pricePerNight: 150, status: "available", amenities: ["Wi-Fi", "TV", "Bathtub", "Mini-bar"] },
    { number: "202", type: "deluxe", floor: 2, capacity: 3, pricePerNight: 150, status: "occupied", amenities: ["Wi-Fi", "TV", "Bathtub", "Mini-bar"] },
    { number: "203", type: "deluxe", floor: 2, capacity: 3, pricePerNight: 150, status: "available", amenities: ["Wi-Fi", "TV", "Bathtub", "Mini-bar"] },
    { number: "301", type: "suite", floor: 3, capacity: 4, pricePerNight: 300, status: "available", amenities: ["Wi-Fi", "TV", "Jacuzzi", "Mini-bar", "Kitchen"] },
    { number: "302", type: "suite", floor: 3, capacity: 4, pricePerNight: 300, status: "maintenance", amenities: ["Wi-Fi", "TV", "Jacuzzi", "Mini-bar", "Kitchen"] },
    { number: "401", type: "presidential", floor: 4, capacity: 6, pricePerNight: 600, status: "available", amenities: ["Wi-Fi", "TV", "Jacuzzi", "Mini-bar", "Kitchen", "Terrace"] },
  ]).returning();

  // Guests
  const insertedGuests = await db.insert(guests).values([
    { firstName: "Bobur", lastName: "Toshmatov", phone: "+998901234567", nationality: "Uzbekistan", passportNumber: "AA1234567" },
    { firstName: "John", lastName: "Smith", phone: "+12025551234", nationality: "USA", passportNumber: "US9876543" },
    { firstName: "Anna", lastName: "Petrova", phone: "+79161234567", nationality: "Russia", passportNumber: "RU5555555" },
  ]).returning();

  // Bookings
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  await db.insert(bookings).values([
    { roomId: insertedRooms[1].id, guestId: insertedGuests[0].id, checkIn: today, checkOut: tomorrow, nights: 1, totalPrice: 80, status: "checked_in", paymentStatus: "paid", adults: 2 },
    { roomId: insertedRooms[4].id, guestId: insertedGuests[1].id, checkIn: today, checkOut: nextWeek, nights: 7, totalPrice: 1050, status: "checked_in", paymentStatus: "partial", adults: 2, children: 1 },
    { roomId: insertedRooms[3].id, guestId: insertedGuests[2].id, checkIn: tomorrow, checkOut: nextWeek, nights: 6, totalPrice: 900, status: "confirmed", paymentStatus: "unpaid", adults: 1 },
    { roomId: insertedRooms[0].id, guestId: insertedGuests[0].id, checkIn: yesterday, checkOut: today, nights: 1, totalPrice: 80, status: "checked_out", paymentStatus: "paid", adults: 1 },
  ]);

  return NextResponse.json({ success: true });
}