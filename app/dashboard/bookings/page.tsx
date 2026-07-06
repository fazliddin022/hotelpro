"use client";

import { useEffect, useState, useCallback } from "react";
import { Room, Guest } from "@/lib/schema";
import {
  Plus, X, Check, Trash2, CalendarCheck,
  BedDouble, Users, DollarSign, Phone,
} from "lucide-react";

type BookingItem = {
  id: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  adults: number;
  children: number;
  notes: string | null;
  roomId: string;
  roomNumber: string;
  roomType: string;
  roomPrice: number;
  guestId: string;
  guestFirstName: string;
  guestLastName: string;
  guestPhone: string;
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Kutmoqda", color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
  { value: "confirmed", label: "Tasdiqlangan", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { value: "checked_in", label: "Keldi", color: "bg-green-50 text-green-600 border-green-100" },
  { value: "checked_out", label: "Ketdi", color: "bg-gray-50 text-gray-500 border-gray-200" },
  { value: "cancelled", label: "Bekor", color: "bg-red-50 text-red-600 border-red-100" },
];

const PAYMENT_OPTIONS = [
  { value: "unpaid", label: "To'lanmagan", color: "bg-red-50 text-red-500" },
  { value: "partial", label: "Qisman", color: "bg-yellow-50 text-yellow-600" },
  { value: "paid", label: "To'langan", color: "bg-green-50 text-green-600" },
];

const EMPTY_FORM = {
  roomId: "", guestId: "",
  checkIn: new Date().toISOString().split("T")[0],
  checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
  adults: "1", children: "0", notes: "",
};

export default function BookingsPage() {
  const [bookingList, setBookingList] = useState<BookingItem[]>([]);
  const [roomList, setRoomList] = useState<Room[]>([]);
  const [guestList, setGuestList] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchData = useCallback(async () => {
    const [bRes, rRes, gRes] = await Promise.all([
      fetch("/api/bookings"),
      fetch("/api/rooms"),
      fetch("/api/guests"),
    ]);
    setBookingList(await bRes.json());
    setRoomList(await rRes.json());
    setGuestList(await gRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!form.roomId || !form.guestId) return;
    setSaving(true);
    try {
      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      await fetchData();
      setShowModal(false);
      setForm(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, status: string, paymentStatus: string) => {
    await fetch(`/api/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, paymentStatus }),
    });
    await fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bronni o'chirishni tasdiqlaysizmi?")) return;
    await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    setBookingList(bookingList.filter((b) => b.id !== id));
  };

  const filtered = filterStatus === "all"
    ? bookingList
    : bookingList.filter((b) => b.status === filterStatus);

  const availableRooms = roomList.filter((r) => r.status === "available");

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-all";

  // Narx hisoblash
  const selectedRoom = roomList.find((r) => r.id === form.roomId);
  const nights = Math.max(1, Math.ceil(
    (new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / 86400000
  ));
  const estimatedPrice = selectedRoom ? nights * selectedRoom.pricePerNight : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Bronlar</h1>
          <p className="text-gray-500 text-sm mt-1">{bookingList.length} ta bron</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-amber-200"
        >
          <Plus size={16} />
          Bron qilish
        </button>
      </div>

      {/* Status stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {STATUS_OPTIONS.map((s) => {
          const count = bookingList.filter((b) => b.status === s.value).length;
          return (
            <div key={s.value} className={`rounded-xl border p-3 cursor-pointer transition-all ${s.color} ${filterStatus === s.value ? "ring-2 ring-offset-1 ring-gray-400" : ""}`}
              onClick={() => setFilterStatus(filterStatus === s.value ? "all" : s.value)}
            >
              <p className="text-xl font-extrabold">{count}</p>
              <p className="text-xs font-medium mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Yuklanmoqda...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <CalendarCheck size={40} className="mx-auto mb-3 opacity-30" />
            <p>Bron topilmadi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((booking) => {
              const statusConfig = STATUS_OPTIONS.find((s) => s.value === booking.status);
              const paymentConfig = PAYMENT_OPTIONS.find((p) => p.value === booking.paymentStatus);

              return (
                <div key={booking.id} className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Guest + Room info */}
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BedDouble size={20} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {booking.guestFirstName} {booking.guestLastName}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <Phone size={12} /> {booking.guestPhone}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                            #{booking.roomNumber}
                          </span>
                          <span>📅 {booking.checkIn} → {booking.checkOut}</span>
                          <span>🌙 {booking.nights} tun</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <span><Users size={11} className="inline" /> {booking.adults} katta{booking.children > 0 ? `, ${booking.children} bola` : ""}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price + Status */}
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-xl font-extrabold text-amber-600">
                        ${booking.totalPrice.toLocaleString()}
                      </p>

                      <div className="flex gap-2">
                        {/* Status select */}
                        <select
                          value={booking.status}
                          onChange={(e) => handleUpdate(booking.id, e.target.value, booking.paymentStatus)}
                          className={`text-xs font-bold px-2.5 py-1.5 rounded-full border outline-none cursor-pointer ${statusConfig?.color}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>

                        {/* Payment select */}
                        <select
                          value={booking.paymentStatus}
                          onChange={(e) => handleUpdate(booking.id, booking.status, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1.5 rounded-full border outline-none cursor-pointer ${paymentConfig?.color}`}
                        >
                          {PAYMENT_OPTIONS.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="p-1.5 bg-red-50 rounded-lg text-red-500 hover:bg-red-100"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Yangi bron</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 bg-gray-100 rounded-lg">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Guest */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Mehmon *</label>
                <select value={form.guestId} onChange={(e) => setForm({ ...form, guestId: e.target.value })} className={inputClass}>
                  <option value="">Tanlang...</option>
                  {guestList.map((g) => (
                    <option key={g.id} value={g.id}>{g.firstName} {g.lastName} — {g.phone}</option>
                  ))}
                </select>
              </div>

              {/* Room */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Xona *</label>
                <select value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })} className={inputClass}>
                  <option value="">Tanlang...</option>
                  {availableRooms.map((r) => (
                    <option key={r.id} value={r.id}>#{r.number} — {r.type} — ${r.pricePerNight}/tun</option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Kelish *</label>
                  <input type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ketish *</label>
                  <input type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className={inputClass} />
                </div>
              </div>

              {/* Adults + Children */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Kattalar</label>
                  <input type="number" min="1" value={form.adults} onChange={(e) => setForm({ ...form, adults: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Bolalar</label>
                  <input type="number" min="0" value={form.children} onChange={(e) => setForm({ ...form, children: e.target.value })} className={inputClass} />
                </div>
              </div>

              {/* Price preview */}
              {estimatedPrice > 0 && (
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{nights} tun × ${selectedRoom?.pricePerNight}</span>
                    <span className="font-extrabold text-amber-600">${estimatedPrice}</span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Izoh..." rows={2} className={`${inputClass} resize-none`} />
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Bekor</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.roomId || !form.guestId}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold rounded-xl disabled:opacity-50"
              >
                <Check size={16} />
                {saving ? "Saqlanmoqda..." : "Bron qilish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}