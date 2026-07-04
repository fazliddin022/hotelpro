import { auth } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { rooms, bookings, guests } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import {
  BedDouble, CalendarCheck, Users,
  TrendingUp, DollarSign, Clock,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-600 border-yellow-100",
  confirmed: "bg-blue-50 text-blue-600 border-blue-100",
  checked_in: "bg-green-50 text-green-600 border-green-100",
  checked_out: "bg-gray-50 text-gray-500 border-gray-100",
  cancelled: "bg-red-50 text-red-600 border-red-100",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Kutmoqda",
  confirmed: "Tasdiqlangan",
  checked_in: "Keldi",
  checked_out: "Ketdi",
  cancelled: "Bekor",
};

export default async function DashboardPage() {
  const session = await auth();
  const today = new Date().toISOString().split("T")[0];

  const [
    allRooms,
    allBookings,
    allGuests,
    todayCheckIns,
    todayCheckOuts,
    activeBookings,
  ] = await Promise.all([
    db.select().from(rooms),
    db.select().from(bookings),
    db.select().from(guests),
    db.select().from(bookings).where(
      and(eq(bookings.checkIn, today), eq(bookings.status, "confirmed"))
    ),
    db.select().from(bookings).where(
      and(eq(bookings.checkOut, today), eq(bookings.status, "checked_in"))
    ),
    db.select().from(bookings).where(eq(bookings.status, "checked_in")),
  ]);

  const availableRooms = allRooms.filter((r) => r.status === "available").length;
  const occupiedRooms = allRooms.filter((r) => r.status === "occupied").length;
  const totalRevenue = allBookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((s, b) => s + b.totalPrice, 0);

  const occupancyRate = allRooms.length > 0
    ? Math.round((occupiedRooms / allRooms.length) * 100)
    : 0;

  const stats = [
    { label: "Jami xonalar", value: allRooms.length, icon: BedDouble, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { label: "Bo'sh xonalar", value: availableRooms, icon: BedDouble, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
    { label: "Band xonalar", value: occupiedRooms, icon: BedDouble, color: "text-red-500", bg: "bg-red-50", border: "border-red-100" },
    { label: "Jami mehmonlar", value: allGuests.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Bugun keladi", value: todayCheckIns.length, icon: CalendarCheck, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
    { label: "Bugun ketadi", value: todayCheckOuts.length, icon: Clock, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
    { label: "Bandlik darajasi", value: `${occupancyRate}%`, icon: TrendingUp, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100" },
    { label: "Jami daromad", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">
          Salom, {session?.user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("uz-UZ", {
            weekday: "long", year: "numeric",
            month: "long", day: "numeric"
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`bg-white rounded-2xl border ${stat.border} p-5`}>
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Aktiv bronlar */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Hozirda mehmonlar</h2>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
            {activeBookings.length} ta
          </span>
        </div>

        {activeBookings.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <BedDouble size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Hozir mehmon yo'q</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activeBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                    <BedDouble size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      Checkout: {booking.checkOut}
                    </p>
                    <p className="text-xs text-gray-400">
                      {booking.nights} tun · ${booking.totalPrice}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[booking.status]}`}>
                  {STATUS_LABELS[booking.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}