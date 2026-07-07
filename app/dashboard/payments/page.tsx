import { auth } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { bookings, rooms, guests } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default async function PaymentsPage() {
  const session = await auth();

  const allBookings = await db
    .select({
      id: bookings.id,
      checkIn: bookings.checkIn,
      checkOut: bookings.checkOut,
      nights: bookings.nights,
      totalPrice: bookings.totalPrice,
      status: bookings.status,
      paymentStatus: bookings.paymentStatus,
      roomNumber: rooms.number,
      roomType: rooms.type,
      guestFirstName: guests.firstName,
      guestLastName: guests.lastName,
    })
    .from(bookings)
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .innerJoin(guests, eq(bookings.guestId, guests.id))
    .orderBy(bookings.createdAt);

  const totalRevenue = allBookings.filter((b) => b.paymentStatus === "paid").reduce((s, b) => s + b.totalPrice, 0);
  const pendingRevenue = allBookings.filter((b) => b.paymentStatus === "unpaid").reduce((s, b) => s + b.totalPrice, 0);
  const partialRevenue = allBookings.filter((b) => b.paymentStatus === "partial").reduce((s, b) => s + b.totalPrice, 0);
  const totalBookings = allBookings.length;

  const PAYMENT_COLORS: Record<string, string> = {
    unpaid: "bg-red-50 text-red-600 border-red-100",
    partial: "bg-yellow-50 text-yellow-600 border-yellow-100",
    paid: "bg-green-50 text-green-600 border-green-100",
  };

  const PAYMENT_LABELS: Record<string, string> = {
    unpaid: "To'lanmagan",
    partial: "Qisman",
    paid: "To'langan",
  };

  const STATUS_LABELS: Record<string, string> = {
    pending: "Kutmoqda",
    confirmed: "Tasdiqlangan",
    checked_in: "Keldi",
    checked_out: "Ketdi",
    cancelled: "Bekor",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">To'lovlar</h1>
        <p className="text-gray-500 text-sm mt-1">Moliyaviy hisobot</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Jami daromad", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "Kutilayotgan", value: `$${pendingRevenue.toLocaleString()}`, icon: Clock, color: "text-red-500", bg: "bg-red-50", border: "border-red-100" },
          { label: "Qisman to'langan", value: `$${partialRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-100" },
          { label: "Jami bronlar", value: totalBookings, icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white rounded-2xl border ${stat.border} p-5`}>
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-900">Barcha to'lovlar</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50">
                {["Mehmon", "Xona", "Sana", "Tunlar", "Summa", "Bron holati", "To'lov"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allBookings.map((b, i) => (
                <tr key={b.id} className={i < allBookings.length - 1 ? "border-b border-gray-50" : ""}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900 text-sm">{b.guestFirstName} {b.guestLastName}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-gray-600">#{b.roomNumber}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs text-gray-500 whitespace-nowrap">{b.checkIn} → {b.checkOut}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-600">{b.nights} tun</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-amber-600">${b.totalPrice.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-medium text-gray-500">{STATUS_LABELS[b.status]}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${PAYMENT_COLORS[b.paymentStatus]}`}>
                      {PAYMENT_LABELS[b.paymentStatus]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}