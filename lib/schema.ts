import {
  pgTable, uuid, text, integer,
  boolean, timestamp, pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "receptionist", "guest"]);
export const roomTypeEnum = pgEnum("room_type", ["standard", "deluxe", "suite", "presidential"]);
export const roomStatusEnum = pgEnum("room_status", ["available", "occupied", "cleaning", "maintenance"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "checked_in", "checked_out", "cancelled"]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "partial", "paid"]);

// Staff
export const staff = pgTable("staff", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default("receptionist").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Xonalar
export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  number: text("number").notNull().unique(),
  type: roomTypeEnum("type").notNull(),
  status: roomStatusEnum("status").default("available").notNull(),
  floor: integer("floor").notNull(),
  capacity: integer("capacity").default(2).notNull(),
  pricePerNight: integer("price_per_night").notNull(),
  amenities: text("amenities").array(),
  description: text("description"),
  images: text("images").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mehmonlar
export const guests = pgTable("guests", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  passportNumber: text("passport_number"),
  nationality: text("nationality"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bronlar
export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomId: uuid("room_id").references(() => rooms.id).notNull(),
  guestId: uuid("guest_id").references(() => guests.id).notNull(),
  staffId: uuid("staff_id").references(() => staff.id),
  checkIn: text("check_in").notNull(),
  checkOut: text("check_out").notNull(),
  nights: integer("nights").notNull(),
  totalPrice: integer("total_price").notNull(),
  status: bookingStatusEnum("status").default("pending").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("unpaid").notNull(),
  adults: integer("adults").default(1).notNull(),
  children: integer("children").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Types
export type Staff = typeof staff.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type Guest = typeof guests.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;