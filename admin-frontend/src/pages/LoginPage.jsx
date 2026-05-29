import React, { useState } from "react";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/Button";

const ADMIN_LOGIN_PRESETS = [
  {
    label: "Main admin",
    email: "admin@gradea.local",
  },
  {
    label: "Content admin",
    email: "content@gradea.local",
  },
  {
    label: "Support admin",
    email: "support@gradea.local",
  },
];

export default function LoginPage({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function applyPreset(preset) {
    setEmail(preset.email);
    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Enter your admin email and password.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await onSubmit({
        email: email.trim(),
        password,
      });
    } catch (error) {
      setErrorMessage(error.message || "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.92)_0,rgba(255,255,255,0)_30%),radial-gradient(circle_at_72%_34%,rgba(255,194,124,0.55)_0,rgba(255,194,124,0)_34%),linear-gradient(135deg,#fffaf4_0%,#ffe4c7_48%,#f8b566_100%)] px-4 py-6 text-slate-950 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute left-[-10rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-white/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-14rem] right-[-10rem] h-[38rem] w-[38rem] rounded-full bg-orange-300/45 blur-3xl" />
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[0.92fr,1.08fr] lg:gap-12">
        <section
          className="relative order-2 mx-auto w-full min-w-0 max-w-md lg:order-1"
          style={{ maxWidth: "min(28rem, calc(100vw - 2rem))" }}
        >
          <div className="pointer-events-none absolute -inset-3 rounded-[1.35rem] bg-white/18 blur-2xl" />
          <div className="relative w-full overflow-hidden rounded-[1.25rem] border border-white/55 bg-white/[0.38] p-6 shadow-[0_28px_90px_rgba(124,61,18,0.20),inset_0_1px_0_rgba(255,255,255,0.80),inset_0_-1px_0_rgba(255,255,255,0.22)] backdrop-blur-2xl backdrop-saturate-150 sm:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/55 to-white/0" />
            <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full border border-white/50 bg-white/18 blur-sm" />
            <div className="pointer-events-none absolute -bottom-20 left-8 h-40 w-40 rounded-full bg-orange-200/25 blur-2xl" />
            <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white/35 text-orange-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-orange-100/40 backdrop-blur">
                <ShieldCheck size={21} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
                  Grade A
                </p>
                <h1 className="text-xl font-bold tracking-tight text-slate-950">
                  Admin login
                </h1>
              </div>
            </div>

            <div className="mt-9">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                Welcome back
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Sign in to continue managing your Grade A learning content.
              </p>
            </div>

            <div className="mt-6 grid gap-2">
              {ADMIN_LOGIN_PRESETS.map((preset) => (
                <button
                  key={preset.email}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-white/55 bg-white/35 px-3 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] outline-none transition hover:border-orange-200 hover:bg-white/60 focus:border-orange-300 focus:ring-4 focus:ring-orange-100/80"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100/70 text-orange-600">
                    <ShieldCheck size={17} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold uppercase tracking-[0.12em] text-orange-600">
                      {preset.label}
                    </span>
                    <span className="mt-1 block truncate text-xs font-semibold text-slate-700">
                      {preset.email}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Admin email
                </span>
                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    autoFocus
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@example.com"
                    className="w-full rounded-xl border border-white/55 bg-white/42 py-3 pl-11 pr-4 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] outline-none transition placeholder:text-slate-400 backdrop-blur focus:border-orange-300 focus:bg-white/65 focus:ring-4 focus:ring-orange-100/80"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </span>
                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-white/55 bg-white/42 py-3 pl-11 pr-4 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] outline-none transition placeholder:text-slate-400 backdrop-blur focus:border-orange-300 focus:bg-white/65 focus:ring-4 focus:ring-orange-100/80"
                  />
                </div>
              </label>

              {errorMessage ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              <Button
                type="submit"
                size="lg"
                className="mt-1 w-full !rounded-xl !bg-orange-600/95 !text-white shadow-[0_16px_34px_rgba(234,88,12,0.30),inset_0_1px_0_rgba(255,255,255,0.24)] hover:!bg-orange-700 focus:!ring-orange-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Enter Workspace"}
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </form>
            </div>
          </div>
        </section>

        <section className="order-1 flex min-h-[280px] min-w-0 items-center justify-center lg:order-2 lg:min-h-[620px] lg:justify-end">
          <div className="relative w-full max-w-[620px]">
            <img
              src="/grade-a-podcast-logo.png"
              alt="Grade A Podcast logo"
              className="relative mx-auto w-full max-w-[calc(100vw-3rem)] object-contain drop-shadow-[0_34px_45px_rgba(92,45,17,0.32)] sm:max-w-[460px] lg:max-w-[620px]"
              style={{ maxWidth: "min(620px, calc(100vw - 3rem))" }}
              draggable="false"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
