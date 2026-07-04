"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  Hotel, LayoutDashboard, BedDouble,
  CalendarCheck, Users, CreditCard,
  LogOut, UserCog,
} from "lucide-react";
import { t, Lang } from "@/lib/i18n";

export default function Sidebar({ role, name }: { role: string; name: string }) {
  const pathname = usePathname();
  const [lang, setLang] = useState<Lang>("uz");
  const T = t[lang];

  const links = [
    { href: "/dashboard", label: T.dashboard, icon: LayoutDashboard },
    { href: "/dashboard/rooms", label: T.rooms, icon: BedDouble },
    { href: "/dashboard/bookings", label: T.bookings, icon: CalendarCheck },
    { href: "/dashboard/guests", label: T.guests, icon: Users },
    { href: "/dashboard/payments", label: T.payments, icon: CreditCard },
    { href: "/dashboard/staff", label: T.staff, icon: UserCog, adminOnly: true },
  ].filter((l) => !l.adminOnly || role === "admin");

  return (
    <aside className="w-64 bg-white border-r border-gray-100 fixed top-0 left-0 bottom-0 flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
            <Hotel size={20} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-gray-900">HotelPro</p>
            <p className="text-xs text-gray-400">{T.tagline}</p>
          </div>
        </div>

        {/* User */}
        <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
          <p className="text-xs text-amber-600 font-medium mt-0.5">
            {role === "admin" ? T.admin : T.receptionist}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-all ${
                active
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Lang + Logout */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(["uz", "ru", "en"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                lang === l ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={18} />
          {T.logout}
        </button>
      </div>
    </aside>
  );
}