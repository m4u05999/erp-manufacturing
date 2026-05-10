"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/core/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError(t.auth.invalidCredentials);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm relative"
      >
        <button
          type="button"
          onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
          className="absolute end-4 top-4 text-xs text-zinc-400 hover:text-zinc-600"
        >
          {locale === "ar" ? t.auth.english : t.auth.arabic}
        </button>

        <h1 className="mb-6 text-2xl font-semibold text-zinc-900">{t.common.appName}</h1>
        <div className="mb-4">
          <label className="mb-1 block text-sm text-zinc-600">{t.auth.email}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm text-zinc-600">{t.auth.password}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            required
          />
        </div>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {t.auth.signIn}
        </button>
      </form>
    </div>
  );
}
