import React, { useState } from "react";
import { Layers, LogIn } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function LoginPage({ onSubmit }) {
  const [name, setName] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }

    onSubmit(name);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl lg:grid-cols-[1.1fr,0.9fr]">
        <section className="hidden bg-gradient-to-br from-primary-700 via-primary-800 to-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                <Layers size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-200">
                  Grade A
                </p>
                <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
              </div>
            </div>
            <h2 className="mt-16 max-w-md text-4xl font-bold leading-tight tracking-tight">
              Manage school resources, events, and publishing from one clean workspace.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-primary-100/80">
              This admin dashboard is built in React JSX and styled to match the
              dashboard template direction you shared.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              ["Resources", "Library uploads"],
              ["Events", "Student announcements"],
              ["Insights", "Publishing analytics"],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-2 text-xs text-primary-100/70">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Grade A admin
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Open dashboard
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Enter your display name to access the content management dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Admin display name
              </span>
              <input
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Piseth"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
              />
            </label>

            <Button type="submit" size="lg" className="w-full">
              <LogIn size={18} className="mr-2" />
              Enter Workspace
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
