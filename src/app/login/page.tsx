"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const from = search.get("from") || "/";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "Contraseña incorrecta");
        return;
      }
      router.replace(from.startsWith("/") ? from : "/");
      router.refresh();
    } catch {
      setError("No se pudo iniciar sesión. Intentá de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="relative flex min-h-full items-center justify-center bg-[var(--bg)] px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle tooltipSide="bottom" />
      </div>
      <form onSubmit={onSubmit} className="card mb-0 w-full max-w-sm">
        <div className="text-[12px] font-semibold tracking-tight text-[var(--primary)]">
          Maak
        </div>
        <h1 className="m-0 mt-1 text-[20px] font-semibold tracking-tight">
          Acceso al prototipo
        </h1>
        <p className="mt-1.5 text-[13px] text-[var(--muted)]">
          Sitio protegido para revisión interna. No es producción.
        </p>

        <label className="mt-5 grid gap-1.5 text-[13px]">
          <span className="font-medium text-[var(--ink-2)]">Contraseña</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-3 py-2"
            required
            autoFocus
          />
        </label>

        {error ? (
          <p className="mt-2 text-[13px] font-medium text-[var(--fail)]" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending || !password}
          className="btn btn-primary mt-4 w-full disabled:opacity-40"
        >
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-full items-center justify-center px-4 py-12">
          <div className="card mb-0 w-full max-w-sm text-[13px] text-[var(--muted)]">
            Cargando…
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
