import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  BookOpen,
  Camera,
  Check,
  Copy,
  Download,
  HardDrive,
  KeyRound,
  Palette,
  RefreshCcw,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { motion as Motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  AUDIO_SUBJECT,
  GRADE_OPTIONS,
  RESOURCE_CATEGORIES,
  SUBJECTS_BY_GRADE,
} from "../data/learningCatalog";
import {
  downloadAdminBackup,
  fetchAdminSettings,
  deleteCurrentAdminAvatar,
  resolveAssetUrl,
  uploadCurrentAdminAvatar,
  updateAdminSettings,
  updateCurrentAdmin,
} from "../services/api";
import { getSummary } from "../utils/dashboard";

const SETTINGS_STORAGE_KEY = "grade-a-admin-settings";
const DEFAULT_SETTINGS = {
  notifications: {
    email: true,
    push: false,
    updates: true,
  },
  appearance: {
    theme: "light",
    density: "comfortable",
  },
};

const VALID_THEMES = new Set(["light", "dark"]);
const VALID_DENSITIES = new Set(["comfortable", "compact"]);

function normalizeSettings(value = {}) {
  const theme = String(value.appearance?.theme || DEFAULT_SETTINGS.appearance.theme).toLowerCase();
  const density = String(value.appearance?.density || DEFAULT_SETTINGS.appearance.density).toLowerCase();

  return {
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
      ...(value.notifications || {}),
    },
    appearance: {
      theme: VALID_THEMES.has(theme) ? theme : DEFAULT_SETTINGS.appearance.theme,
      density: VALID_DENSITIES.has(density) ? density : DEFAULT_SETTINGS.appearance.density,
    },
  };
}

function readStoredSettings() {
  try {
    const storedValue = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!storedValue) {
      return DEFAULT_SETTINGS;
    }

    return normalizeSettings(JSON.parse(storedValue));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveStoredSettings(settings) {
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

function Toggle({ enabled, onChange, colorClass = "bg-primary-600" }) {
  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
        enabled ? colorClass : "bg-slate-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function Field({ label, children, helper }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {helper ? <span className="mt-1.5 block text-xs text-slate-500">{helper}</span> : null}
    </label>
  );
}

function sectionButtonClass(isActive) {
  return `flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-primary-50 text-primary-700"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;
}

export default function SettingsPage({
  apiBaseUrl,
  stats,
  adminUser,
  adminName,
  onAdminUpdate,
  onRefresh,
}) {
  const [settings, setSettings] = useState(() => readStoredSettings());
  const [profile, setProfile] = useState({
    name: adminUser?.name || adminName || "",
    email: adminUser?.email || "",
    avatar_path: adminUser?.avatar_path || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [shouldRemoveAvatar, setShouldRemoveAvatar] = useState(false);
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [activeSection, setActiveSection] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const avatarInputRef = useRef(null);
  const avatarPreviewUrlRef = useRef("");
  const summary = getSummary(stats);

  const sections = useMemo(
    () => [
      { id: "profile", name: "Profile", icon: User },
      { id: "catalog", name: "Catalog Rules", icon: BookOpen },
      { id: "storage", name: "Storage", icon: HardDrive },
      { id: "notifications", name: "Notifications", icon: Bell },
      { id: "appearance", name: "Appearance", icon: Palette },
      { id: "security", name: "Security", icon: Shield },
    ],
    [],
  );

  useEffect(() => {
    document.documentElement.dataset.adminTheme = settings.appearance.theme;
    document.documentElement.dataset.adminDensity = settings.appearance.density;
    document.documentElement.style.colorScheme =
      settings.appearance.theme === "dark" ? "dark" : "light";
  }, [settings.appearance]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrlRef.current) {
        window.URL.revokeObjectURL(avatarPreviewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const savedSettings = await fetchAdminSettings();
        if (!isMounted) {
          return;
        }

        const normalizedSettings = normalizeSettings(savedSettings);
        setSettings(normalizedSettings);
        saveStoredSettings(normalizedSettings);
      } catch (error) {
        if (isMounted) {
          setFeedback({
            type: "error",
            message: error.message || "Unable to load saved workspace settings.",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingSettings(false);
        }
      }
    }

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  async function updateNotification(key) {
    if (
      key === "push" &&
      !settings.notifications.push &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setFeedback({
          type: "error",
          message: "Browser notifications were not enabled.",
        });
        return;
      }
    }

    setSettings((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        [key]: !current.notifications[key],
      },
    }));

    if (
      key === "push" &&
      !settings.notifications.push &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification("Grade A admin alerts enabled", {
          body: "Browser notifications are ready for this dashboard.",
        });
      } catch {
        setFeedback({
          type: "error",
          message: "Browser notifications are enabled, but the test notification could not be shown.",
        });
      }
    }
  }

  function updateAppearance(key, value) {
    setSettings((current) => ({
      ...current,
      appearance: {
        ...current.appearance,
        [key]: value,
      },
    }));
  }

  function scrollToSection(sectionId) {
    setActiveSection(sectionId);
    document.getElementById(`settings-${sectionId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function copyApiUrl() {
    try {
      await navigator.clipboard.writeText(apiBaseUrl);
      setFeedback({ type: "success", message: "API base URL copied." });
    } catch {
      setFeedback({ type: "error", message: "Unable to copy API base URL." });
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    setFeedback({ type: "", message: "" });
    try {
      await onRefresh?.();
      setFeedback({ type: "success", message: "Workspace stats refreshed." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to refresh stats." });
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleBackup() {
    setIsBackingUp(true);
    setFeedback({ type: "", message: "" });
    try {
      await downloadAdminBackup();
      setFeedback({ type: "success", message: "Backup file downloaded." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to download backup." });
    } finally {
      setIsBackingUp(false);
    }
  }

  function handleAvatarSelect(event) {
    const [file] = Array.from(event.target.files || []);
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFeedback({ type: "error", message: "Choose an image file for your profile photo." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: "error", message: "Profile photo must be 5 MB or smaller." });
      return;
    }

    if (avatarPreviewUrlRef.current) {
      window.URL.revokeObjectURL(avatarPreviewUrlRef.current);
    }

    const nextPreviewUrl = window.URL.createObjectURL(file);
    avatarPreviewUrlRef.current = nextPreviewUrl;
    setAvatarFile(file);
    setAvatarPreviewUrl(nextPreviewUrl);
    setShouldRemoveAvatar(false);
    setFeedback({ type: "", message: "" });
  }

  function handleAvatarRemove() {
    if (avatarPreviewUrlRef.current) {
      window.URL.revokeObjectURL(avatarPreviewUrlRef.current);
      avatarPreviewUrlRef.current = "";
    }

    setAvatarFile(null);
    setAvatarPreviewUrl("");
    setShouldRemoveAvatar(Boolean(profile.avatar_path));
    setFeedback({ type: "", message: "" });
  }

  async function handleSave() {
    const trimmedName = profile.name.trim();
    const trimmedEmail = profile.email.trim();
    const isEmailChanging = trimmedEmail !== (adminUser?.email || "");
    const isProfileChanging = trimmedName !== (adminUser?.name || "") || isEmailChanging;
    const isAvatarChanging = Boolean(avatarFile) || shouldRemoveAvatar;
    const hasPasswordInput =
      security.currentPassword || security.newPassword || security.confirmPassword;

    if (!trimmedName) {
      setFeedback({ type: "error", message: "Display name is required." });
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setFeedback({ type: "error", message: "Enter a valid admin email." });
      return;
    }

    if (isEmailChanging && !security.currentPassword) {
      setFeedback({
        type: "error",
        message: "Enter your current password to change admin email.",
      });
      return;
    }

    if (hasPasswordInput) {
      if (!security.currentPassword) {
        setFeedback({ type: "error", message: "Enter your current password first." });
        return;
      }

      if (security.newPassword.length < 8) {
        setFeedback({ type: "error", message: "New password must be at least 8 characters." });
        return;
      }

      if (security.newPassword !== security.confirmPassword) {
        setFeedback({ type: "error", message: "New password confirmation does not match." });
        return;
      }
    }

    setIsSaving(true);
    setFeedback({ type: "", message: "" });

    try {
      const savedSettings = await updateAdminSettings(settings);
      const normalizedSettings = normalizeSettings(savedSettings);
      setSettings(normalizedSettings);
      saveStoredSettings(normalizedSettings);

      let nextUser = adminUser;

      if (isProfileChanging || hasPasswordInput) {
        nextUser = await updateCurrentAdmin({
          name: trimmedName,
          email: trimmedEmail,
          current_password: security.currentPassword || undefined,
          new_password: security.newPassword || undefined,
        });
      }

      if (avatarFile) {
        nextUser = await uploadCurrentAdminAvatar(avatarFile);
      } else if (shouldRemoveAvatar) {
        nextUser = await deleteCurrentAdminAvatar();
      }

      if (isProfileChanging || hasPasswordInput || isAvatarChanging) {
        onAdminUpdate?.(nextUser);
      }

      setProfile({
        name: nextUser?.name || trimmedName,
        email: nextUser?.email || trimmedEmail,
        avatar_path: nextUser?.avatar_path || "",
      });
      if (avatarPreviewUrlRef.current) {
        window.URL.revokeObjectURL(avatarPreviewUrlRef.current);
        avatarPreviewUrlRef.current = "";
      }
      setAvatarFile(null);
      setAvatarPreviewUrl("");
      setShouldRemoveAvatar(false);
      setSecurity({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setFeedback({ type: "success", message: "Settings saved successfully." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to save settings." });
    } finally {
      setIsSaving(false);
    }
  }

  const feedbackClass =
    feedback.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700";
  const avatarUrl = avatarPreviewUrl || (!shouldRemoveAvatar ? resolveAssetUrl(profile.avatar_path) : "");
  const avatarInitial = (profile.name || profile.email || "A").slice(0, 1).toUpperCase();

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
            Manage your admin profile, workspace preferences, and backup tools.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCcw size={16} className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing" : "Refresh Stats"}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoadingSettings}>
            <Check size={16} className="mr-2" />
            {isSaving ? "Saving..." : isLoadingSettings ? "Loading..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {feedback.message ? (
        <div className={`rounded-lg border px-4 py-3 text-sm font-semibold ${feedbackClass}`}>
          {feedback.message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hidden md:block">
          <nav className="sticky top-28 space-y-1">
            {sections.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={sectionButtonClass(activeSection === item.id)}
              >
                <item.icon
                  size={16}
                  className={activeSection === item.id ? "text-primary-600" : "text-slate-400"}
                />
                {item.name}
              </button>
            ))}
          </nav>
        </Motion.div>

        <div className="space-y-6 md:col-span-3">
          <Card id="settings-profile" className="scroll-mt-28">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <User size={18} className="text-primary-600" />
              <h3 className="text-lg font-semibold text-slate-900">Profile Information</h3>
            </div>

            <div className="flex flex-col items-start gap-6 sm:flex-row">
              <div className="flex w-full flex-col items-start gap-3 sm:w-36 sm:items-center">
                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-primary-100 text-2xl font-bold text-primary-700 shadow-sm">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatarInitial
                  )}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white bg-slate-950 text-white shadow-lg transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="Change profile photo"
                  >
                    <Camera size={15} />
                  </button>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarSelect}
                />
                <div className="flex flex-wrap gap-2 sm:justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => avatarInputRef.current?.click()}
                    className="h-9 px-3 text-xs"
                  >
                    Change photo
                  </Button>
                  {(avatarUrl || avatarFile || (!shouldRemoveAvatar && profile.avatar_path)) ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleAvatarRemove}
                      className="h-9 px-3 text-xs text-slate-500"
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
                <p className="max-w-36 text-xs leading-5 text-slate-500 sm:text-center">
                  JPG, PNG, WebP, GIF, or AVIF up to 5 MB.
                </p>
              </div>
              <div className="w-full flex-1 space-y-4">
                <Field label="Display Name">
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                  />
                </Field>
                <Field label="Admin Email" helper="Changing email requires your current password in Security.">
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                  />
                </Field>
                <Field label="API Base URL" helper="This value comes from VITE_API_BASE_URL and is read-only here.">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={apiBaseUrl}
                      readOnly
                      className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none"
                    />
                    <Button type="button" variant="outline" onClick={copyApiUrl} className="shrink-0 gap-2">
                      <Copy size={15} />
                      Copy
                    </Button>
                  </div>
                </Field>
              </div>
            </div>
          </Card>

          <Card id="settings-catalog" className="scroll-mt-28">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <BookOpen size={18} className="text-primary-600" />
              <h3 className="text-lg font-semibold text-slate-900">Catalog Rules</h3>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Grades</p>
                <p className="mt-2 text-sm text-slate-500">
                  Admin resources are limited to Grades {GRADE_OPTIONS.join(", ")}.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {GRADE_OPTIONS.map((grade) => (
                    <span
                      key={grade}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      Grade {grade}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Audio Rule</p>
                <p className="mt-2 text-sm text-slate-500">
                  Audio uploads are locked to {AUDIO_SUBJECT} / អក្សរសាស្ត្រខ្មែរ.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
                <p className="text-sm font-semibold text-slate-900">Required Resource Categories</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  {RESOURCE_CATEGORIES.map((category) => (
                    <div key={category.value} className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-sm font-semibold text-slate-900">{category.labelKm}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{category.labelEn}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
                <p className="text-sm font-semibold text-slate-900">Grade 12 Bac II Subjects</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {SUBJECTS_BY_GRADE[12].join(", ")}
                </p>
              </div>
            </div>
          </Card>

          <Card id="settings-storage" className="scroll-mt-28">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <HardDrive size={18} className="text-primary-600" />
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
                  className="h-full bg-primary-600 transition-all"
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
                <p className="mt-1 text-xl font-semibold text-slate-900">{summary.total_events}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {summary.published_events} published event videos
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

            <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Backup Archive</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Download resources, events, and download logs as PDF, JSON, and CSV files.
                  </p>
                </div>
                <Button type="button" onClick={handleBackup} disabled={isBackingUp} className="gap-2">
                  <Download size={16} />
                  {isBackingUp ? "Backing up..." : "Back up file"}
                </Button>
              </div>
            </div>
          </Card>

          <Card id="settings-notifications" className="scroll-mt-28">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <Bell size={18} className="text-primary-600" />
              <h3 className="text-lg font-semibold text-slate-900">Notification Preferences</h3>
            </div>

            <div className="space-y-5">
              {[
                ["email", "Email Preference", "Save whether this admin account should receive email summaries when email delivery is configured."],
                ["push", "Browser Notifications", "Request browser permission and confirm dashboard alerts can be shown."],
                ["updates", "Product Update Preference", "Save whether this admin wants release and feature update notices."],
              ].map(([key, label, copy]) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{label}</p>
                    <p className="text-sm text-slate-500">{copy}</p>
                  </div>
                  <Toggle enabled={settings.notifications[key]} onChange={() => void updateNotification(key)} />
                </div>
              ))}
            </div>
          </Card>

          <Card id="settings-appearance" className="scroll-mt-28">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <Palette size={18} className="text-primary-600" />
              <h3 className="text-lg font-semibold text-slate-900">Appearance</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {["light", "dark"].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateAppearance("theme", value)}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    settings.appearance.theme === value
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

            <div className="mt-5">
              <p className="text-sm font-semibold text-slate-900">Interface Density</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["comfortable", "compact"].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateAppearance("density", value)}
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold capitalize transition ${
                      settings.appearance.density === value
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card id="settings-security" className="scroll-mt-28">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <Shield size={18} className="text-primary-600" />
              <h3 className="text-lg font-semibold text-slate-900">Security</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Current Password" helper="Required to change email or password.">
                <input
                  type="password"
                  autoComplete="current-password"
                  value={security.currentPassword}
                  onChange={(event) => setSecurity((current) => ({ ...current, currentPassword: event.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                />
              </Field>
              <div className="hidden sm:block" />
              <Field label="New Password">
                <input
                  type="password"
                  autoComplete="new-password"
                  value={security.newPassword}
                  onChange={(event) => setSecurity((current) => ({ ...current, newPassword: event.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                />
              </Field>
              <Field label="Confirm New Password">
                <input
                  type="password"
                  autoComplete="new-password"
                  value={security.confirmPassword}
                  onChange={(event) => setSecurity((current) => ({ ...current, confirmPassword: event.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                />
              </Field>
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <KeyRound size={18} className="mt-0.5 text-slate-500" />
                <p className="text-sm leading-6 text-slate-600">
                  Leave password fields empty to keep your current password. Saving a new password updates the current admin account immediately.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 bg-slate-50/70">
            <h3 className="text-lg font-semibold text-slate-900">Safe Operations</h3>
            <p className="mb-4 mt-2 text-sm text-slate-600">
              Deleting uploaded content still requires confirmation from the resource or event list.
            </p>
            <Button variant="outline" size="sm" disabled>
              <Trash2 size={16} className="mr-2" />
              Protected
            </Button>
          </Card>
        </div>
      </div>
    </Motion.div>
  );
}
