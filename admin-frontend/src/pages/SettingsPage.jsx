import React, { useState } from "react";
import {
  Bell,
  Camera,
  Check,
  HardDrive,
  Palette,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { motion as Motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { getSummary } from "../utils/dashboard";

function Toggle({ enabled, onChange, colorClass = "bg-primary-600" }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? colorClass : "bg-slate-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function SettingsPage({
  apiBaseUrl,
  stats,
  adminName,
  onRefresh,
}) {
  const [notifs, setNotifs] = useState({
    email: true,
    push: false,
    updates: true,
  });
  const [theme, setTheme] = useState("light");
  const [isSaved, setIsSaved] = useState(false);
  const summary = getSummary(stats);

  function handleSave() {
    setIsSaved(true);
    window.setTimeout(() => setIsSaved(false), 2000);
  }

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-6xl space-y-6 pb-12"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage your workspace preferences and admin details.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={onRefresh}>
            Refresh Stats
          </Button>
          <Button onClick={handleSave}>
            {isSaved ? (
              <>
                <Check size={16} className="mr-2" />
                Saved
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hidden md:block">
          <nav className="sticky top-28 space-y-1">
            {[
              { name: "Profile", icon: User, active: true },
              { name: "Notifications", icon: Bell, active: false },
              { name: "Storage", icon: HardDrive, active: false },
              { name: "Appearance", icon: Palette, active: false },
              { name: "Security", icon: Shield, active: false },
            ].map((item) => (
              <button
                key={item.name}
                type="button"
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon
                  size={16}
                  className={item.active ? "text-primary-600" : "text-slate-400"}
                />
                {item.name}
              </button>
            ))}
          </nav>
        </Motion.div>

        <div className="space-y-6 md:col-span-3">
          <Card>
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-semibold text-slate-900">Profile Information</h3>
            </div>

            <div className="flex flex-col items-start gap-6 sm:flex-row">
              <div className="group relative">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-primary-100 text-2xl font-bold text-primary-700">
                  {(adminName || "A").slice(0, 1).toUpperCase()}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 rounded-full border border-slate-200 bg-white p-1.5 text-slate-600 shadow-sm transition-colors hover:text-primary-600"
                >
                  <Camera size={14} />
                </button>
              </div>
              <div className="w-full flex-1 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    Display Name
                  </span>
                  <input
                    type="text"
                    defaultValue={adminName}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    API Base URL
                  </span>
                  <input
                    type="text"
                    defaultValue={apiBaseUrl}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
            </div>

            <div className="space-y-5">
              {[
                {
                  label: "Email Notifications",
                  copy: "Receive daily summaries and alerts via email.",
                  value: notifs.email,
                  onToggle: () => setNotifs((current) => ({ ...current, email: !current.email })),
                },
                {
                  label: "Push Notifications",
                  copy: "Get instant alerts in your browser.",
                  value: notifs.push,
                  onToggle: () => setNotifs((current) => ({ ...current, push: !current.push })),
                },
                {
                  label: "Product Updates",
                  copy: "Hear about new admin features and releases.",
                  value: notifs.updates,
                  onToggle: () => setNotifs((current) => ({ ...current, updates: !current.updates })),
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-500">{item.copy}</p>
                  </div>
                  <Toggle enabled={item.value} onChange={item.onToggle} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-semibold text-slate-900">Storage & Publishing</h3>
            </div>

            <div className="mb-6">
              <div className="mb-2 flex items-end justify-between">
                <p className="text-xl font-bold text-slate-900">
                  {summary.total_resources} <span className="text-sm font-normal text-slate-500">resources</span>
                </p>
                <p className="text-sm font-medium text-slate-500">
                  {summary.published_resources} published
                </p>
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-primary-600"
                  style={{
                    width: `${
                      summary.total_resources
                        ? (summary.published_resources / summary.total_resources) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Events</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {summary.total_events}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {summary.published_events} published events
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Upload Path</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">/uploads</p>
                <p className="mt-2 text-xs text-slate-500">
                  Public assets served from the backend.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-semibold text-slate-900">Appearance</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {["light", "dark"].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    theme === value
                      ? "border-primary-600 bg-primary-50/30 ring-1 ring-primary-600"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`mb-3 flex h-20 w-full flex-col gap-1.5 rounded border p-2 ${
                      value === "light"
                        ? "border-slate-200 bg-slate-50"
                        : "border-slate-800 bg-slate-900"
                    }`}
                  >
                    <div className={`h-1.5 w-1/2 rounded-full ${value === "light" ? "bg-slate-200" : "bg-slate-700"}`} />
                    <div className={`h-1.5 w-3/4 rounded-full ${value === "light" ? "bg-slate-200" : "bg-slate-700"}`} />
                    <div className={`mt-auto h-6 w-full rounded border ${value === "light" ? "border-slate-100 bg-white" : "border-slate-700 bg-slate-800"}`} />
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    {value === "light" ? "Light Mode" : "Dark Mode"}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="border-red-200 bg-red-50/50">
            <h3 className="text-lg font-semibold text-red-700">Danger Zone</h3>
            <p className="mb-4 mt-2 text-sm text-red-600/80">
              This panel is for sensitive actions. Keep destructive operations behind extra confirmation.
            </p>
            <Button variant="danger" size="sm">
              <Trash2 size={16} className="mr-2" />
              Delete Account
            </Button>
          </Card>
        </div>
      </div>
    </Motion.div>
  );
}
