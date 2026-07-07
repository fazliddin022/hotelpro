"use client";

import { useEffect, useState, useCallback } from "react";
import { Guest } from "@/lib/schema";
import {
  Plus, X, Check, Pencil, Trash2,
  Users, Phone, Mail, Globe, CreditCard, MapPin, Search,
} from "lucide-react";

const EMPTY_FORM = {
  firstName: "", lastName: "", phone: "",
  email: "", passportNumber: "", nationality: "", address: "",
};

export default function GuestsPage() {
  const [guestList, setGuestList] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchGuests = useCallback(async () => {
    const res = await fetch("/api/guests");
    const data = await res.json();
    setGuestList(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const handleOpen = (guest?: Guest) => {
    if (guest) {
      setEditing(guest);
      setForm({
        firstName: guest.firstName,
        lastName: guest.lastName,
        phone: guest.phone,
        email: guest.email || "",
        passportNumber: guest.passportNumber || "",
        nationality: guest.nationality || "",
        address: guest.address || "",
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

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.phone) return;
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/guests/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        setGuestList(guestList.map((g) => g.id === updated.id ? updated : g));
      } else {
        const res = await fetch("/api/guests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const created = await res.json();
        setGuestList([created, ...guestList]);
      }
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Mehmonni o'chirishni tasdiqlaysizmi?")) return;
    await fetch(`/api/guests/${id}`, { method: "DELETE" });
    setGuestList(guestList.filter((g) => g.id !== id));
  };

  const filtered = guestList.filter((g) =>
    `${g.firstName} ${g.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    g.phone.includes(search) ||
    g.nationality?.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Mehmonlar</h1>
          <p className="text-gray-500 text-sm mt-1">{guestList.length} ta mehmon</p>
        </div>
        <button
          onClick={() => handleOpen()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-amber-200"
        >
          <Plus size={16} />
          Mehmon qo'shish
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism, telefon yoki millat..."
          className={`${inputClass} pl-10`}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Yuklanmoqda...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p>Mehmon topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((guest) => (
            <div key={guest.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {guest.firstName.charAt(0)}{guest.lastName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {guest.firstName} {guest.lastName}
                    </p>
                    {guest.nationality && (
                      <p className="text-xs text-amber-600 font-medium">{guest.nationality}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpen(guest)} className="p-1.5 bg-gray-50 rounded-lg text-gray-500 hover:bg-gray-100">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(guest.id)} className="p-1.5 bg-red-50 rounded-lg text-red-500 hover:bg-red-100">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-gray-400" />
                  {guest.phone}
                </div>
                {guest.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-gray-400" />
                    {guest.email}
                  </div>
                )}
                {guest.passportNumber && (
                  <div className="flex items-center gap-2">
                    <CreditCard size={12} className="text-gray-400" />
                    {guest.passportNumber}
                  </div>
                )}
                {guest.address && (
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-gray-400" />
                    {guest.address}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">
                {editing ? "Mehmonni tahrirlash" : "Yangi mehmon"}
              </h2>
              <button onClick={handleClose} className="p-1.5 bg-gray-100 rounded-lg">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Ism *" className={inputClass} />
                <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Familiya *" className={inputClass} />
              </div>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Telefon *" className={inputClass} />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className={inputClass} />
              <input value={form.passportNumber} onChange={(e) => setForm({ ...form, passportNumber: e.target.value })} placeholder="Pasport raqami" className={inputClass} />
              <input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} placeholder="Millat / Fuqarolik" className={inputClass} />
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Manzil" className={inputClass} />
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={handleClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Bekor</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.firstName || !form.lastName || !form.phone}
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