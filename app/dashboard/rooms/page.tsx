"use client";

import { useEffect, useState, useCallback } from "react";
import { Room } from "@/lib/schema";
import {
  Plus, X, Check, Pencil, Trash2,
  BedDouble, DollarSign, Users, Building2,
} from "lucide-react";

const ROOM_TYPES = ["standard", "deluxe", "suite", "presidential"];
const ROOM_STATUSES = ["available", "occupied", "cleaning", "maintenance"];
const AMENITIES_LIST = ["Wi-Fi", "TV", "Shower", "Bathtub", "Mini-bar", "Kitchen", "Jacuzzi", "Terrace", "AC", "Safe"];

const TYPE_COLORS: Record<string, string> = {
  standard: "bg-gray-50 text-gray-600 border-gray-200",
  deluxe: "bg-blue-50 text-blue-600 border-blue-100",
  suite: "bg-purple-50 text-purple-600 border-purple-100",
  presidential: "bg-amber-50 text-amber-600 border-amber-100",
};

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-50 text-green-600 border-green-100",
  occupied: "bg-red-50 text-red-600 border-red-100",
  cleaning: "bg-yellow-50 text-yellow-600 border-yellow-100",
  maintenance: "bg-gray-50 text-gray-500 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  available: "Bo'sh",
  occupied: "Band",
  cleaning: "Tozalanmoqda",
  maintenance: "Ta'mirda",
};

const TYPE_LABELS: Record<string, string> = {
  standard: "Standart",
  deluxe: "Deluxe",
  suite: "Lyuks",
  presidential: "Prezident",
};

const TYPE_ICONS: Record<string, string> = {
  standard: "🛏️",
  deluxe: "🛎️",
  suite: "👑",
  presidential: "⭐",
};

const EMPTY_FORM = {
  number: "", type: "standard", floor: "1",
  capacity: "2", pricePerNight: "", status: "available",
  amenities: [] as string[], description: "",
};

export default function RoomsPage() {
  const [roomList, setRoomList] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const fetchRooms = useCallback(async () => {
    const res = await fetch("/api/rooms");
    const data = await res.json();
    setRoomList(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleOpen = (room?: Room) => {
    if (room) {
      setEditing(room);
      setForm({
        number: room.number,
        type: room.type,
        floor: String(room.floor),
        capacity: String(room.capacity),
        pricePerNight: String(room.pricePerNight),
        status: room.status,
        amenities: room.amenities || [],
        description: room.description || "",
      });
    } else {
      setEditing(null);
      setForm(EMPTY_FORM);
    }
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const toggleAmenity = (amenity: string) => {
    setForm({
      ...form,
      amenities: form.amenities.includes(amenity)
        ? form.amenities.filter((a) => a !== amenity)
        : [...form.amenities, amenity],
    });
  };

  const handleSave = async () => {
    if (!form.number || !form.pricePerNight) return;
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/rooms/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        setRoomList(roomList.map((r) => r.id === updated.id ? updated : r));
      } else {
        const res = await fetch("/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const created = await res.json();
        setRoomList([...roomList, created]);
      }
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xonani o'chirishni tasdiqlaysizmi?")) return;
    await fetch(`/api/rooms/${id}`, { method: "DELETE" });
    setRoomList(roomList.filter((r) => r.id !== id));
  };

  const filtered = roomList.filter((r) => {
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const matchType = filterType === "all" || r.type === filterType;
    return matchStatus && matchType;
  });

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Xonalar</h1>
          <p className="text-gray-500 text-sm mt-1">{roomList.length} ta xona</p>
        </div>
        <button
          onClick={() => handleOpen()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-amber-200"
        >
          <Plus size={16} />
          Xona qo'shish
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const count = roomList.filter((r) => r.status === key).length;
          return (
            <div key={key} className={`rounded-xl border p-4 ${STATUS_COLORS[key]}`}>
              <p className="text-2xl font-extrabold">{count}</p>
              <p className="text-xs font-medium mt-0.5">{label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filterStatus === "all" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200"
            }`}
          >
            Barchasi
          </button>
          {ROOM_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filterStatus === s
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filterType === "all" ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-500 border-gray-200"
            }`}
          >
            Barcha turlar
          </button>
          {ROOM_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filterType === t
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-white text-gray-500 border-gray-200"
              }`}
            >
              {TYPE_ICONS[t]} {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Yuklanmoqda...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <BedDouble size={40} className="mx-auto mb-3 opacity-30" />
          <p>Xona topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((room) => (
            <div key={room.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Top */}
              <div className={`p-4 ${
                room.status === "available" ? "bg-green-50" :
                room.status === "occupied" ? "bg-red-50" :
                room.status === "cleaning" ? "bg-yellow-50" : "bg-gray-50"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{TYPE_ICONS[room.type]}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[room.status]}`}>
                    {STATUS_LABELS[room.status]}
                  </span>
                </div>
                <h3 className="font-extrabold text-gray-900 text-xl mt-2">
                  #{room.number}
                </h3>
                <p className={`text-xs font-semibold px-2 py-0.5 rounded-full border w-fit mt-1 ${TYPE_COLORS[room.type]}`}>
                  {TYPE_LABELS[room.type]}
                </p>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Building2 size={13} /> {room.floor}-qavat
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Users size={13} /> {room.capacity} kishi
                  </span>
                </div>
                <div className="flex items-center gap-1 text-lg font-extrabold text-amber-600">
                  <DollarSign size={16} />
                  {room.pricePerNight}/tun
                </div>

                {room.amenities && room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.slice(0, 3).map((a) => (
                      <span key={a} className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full">
                        {a}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="text-xs text-gray-400">+{room.amenities.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleOpen(room)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-600 transition-all"
                  >
                    <Pencil size={13} /> Tahrirlash
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-semibold text-red-500 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">
                {editing ? "Xonani tahrirlash" : "Yangi xona"}
              </h2>
              <button onClick={handleClose} className="p-1.5 bg-gray-100 rounded-lg">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Number + Floor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Xona raqami *</label>
                  <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="101" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Qavat</label>
                  <input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} className={inputClass} />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Xona turi</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROOM_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setForm({ ...form, type })}
                      className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                        form.type === type
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-gray-200 text-gray-500"
                      }`}
                    >
                      {TYPE_ICONS[type]} {TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capacity + Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Sig'im</label>
                  <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Narx ($/tun) *</label>
                  <input type="number" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} placeholder="80" className={inputClass} />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Holati</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROOM_STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setForm({ ...form, status: s })}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        form.status === s
                          ? STATUS_COLORS[s] + " border-2"
                          : "border-gray-200 text-gray-500"
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Qulayliklar</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_LIST.map((a) => (
                    <button
                      key={a}
                      onClick={() => toggleAmenity(a)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        form.amenities.includes(a)
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-white text-gray-500 border-gray-200"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Izoh</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={`${inputClass} resize-none`} />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={handleClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">
                Bekor
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.number || !form.pricePerNight}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold rounded-xl disabled:opacity-50"
              >
                <Check size={16} />
                {saving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}