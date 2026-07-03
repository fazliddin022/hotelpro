"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Hotel, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { t, Lang } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("uz");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const T = t[lang];

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(
        lang === "uz" ? "Email yoki parol noto'g'ri!" :
        lang === "ru" ? "Неверный email или пароль!" :
        "Invalid email or password!"
      );
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200">
            <Hotel size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">{T.appName}</h1>
          <p className="text-gray-500 text-sm mt-1">{T.tagline}</p>
        </div>

        {/* Lang toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1 shadow-sm">
            {(["uz", "ru", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  lang === l
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">
            {T.login}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                {T.email}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@hotelpro.uz"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                {T.password}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-all"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm rounded-xl hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 transition-all shadow-lg shadow-amber-200 mt-2"
            >
              {loading ? T.loading : T.login}
            </button>
          </div>

          {/* Demo */}
          <div className="mt-6 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-xs font-semibold text-amber-600 mb-1">Demo kirish:</p>
            <p className="text-xs text-gray-500">admin@hotelpro.uz / admin123</p>
            <p className="text-xs text-gray-500">reception@hotelpro.uz / reception123</p>
          </div>
        </div>
      </div>
    </div>
  );
}