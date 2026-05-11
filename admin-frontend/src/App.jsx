import React, { Suspense, lazy, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { CalendarDays, LogOut, RefreshCcw } from "lucide-react";
import AdminSidebar from "./components/layout/AdminSidebar";
import { Button } from "./components/ui/Button";
import LoginPage from "./pages/LoginPage";
import {
  API_BASE_URL,
  deleteAdminEvent,
  deleteAdminResource,
  fetchAdminEvents,
  fetchAdminResources,
  fetchAdminStats,
  saveAdminEvent,
  saveAdminResource,
} from "./services/api";
import {
  clearStoredAdminName,
  getStoredAdminName,
  setStoredAdminName,
} from "./services/auth";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const UploadPage = lazy(() => import("./pages/UploadPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

const DEFAULT_FEEDBACK = { type: "", message: "" };

const PAGE_META = {
  "/": {
    title: "Overview",
    description: "Monitor content, uploads, and publishing activity.",
  },
  "/upload": {
    title: "Upload",
    description: "Manage resources and event publishing in one place.",
  },
  "/analytics": {
    title: "Analytics",
    description: "Track library breakdowns and publishing health.",
  },
  "/settings": {
    title: "Settings",
    description: "Update workspace preferences and connection details.",
  },
};

function TopBar({
  adminName,
  isRefreshing,
  onRefresh,
  onSignOut,
}) {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || PAGE_META["/"];
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            <span>Grade A Admin</span>
            <span className="hidden sm:inline">/</span>
            <span className="hidden sm:inline">{meta.title}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {meta.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{meta.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
            <CalendarDays size={16} className="text-slate-400" />
            <span>{today}</span>
          </div>
          <div className="hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 sm:block">
            Working as <span className="font-semibold text-slate-900">{adminName}</span>
          </div>
          <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCcw size={16} className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing" : "Refresh"}
          </Button>
          <Button variant="ghost" onClick={onSignOut}>
            <LogOut size={16} className="mr-2" />
            Switch Admin
          </Button>
        </div>
      </div>
    </header>
  );
}

function AppShell({
  adminName,
  stats,
  resources,
  events,
  isLoading,
  isRefreshing,
  isSavingResource,
  isSavingEvent,
  feedback,
  onRefresh,
  onSignOut,
  onSaveResource,
  onDeleteResource,
  onSaveEvent,
  onDeleteEvent,
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar adminName={adminName} />

      <div className="min-h-screen md:ml-64">
        <TopBar
          adminName={adminName}
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          onSignOut={onSignOut}
        />

        <main className="px-4 pb-8 pt-20 sm:px-6 lg:px-8 lg:pt-8">
          {feedback.message ? (
            <div
              className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
                feedback.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {feedback.message}
            </div>
          ) : null}

          <Suspense
            fallback={
              <div className="rounded-lg border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500 shadow-card">
                Loading dashboard...
              </div>
            }
          >
            <Routes>
              <Route
                path="/"
                element={
                  <DashboardPage
                    stats={stats}
                    resources={resources}
                    events={events}
                    isLoading={isLoading}
                  />
                }
              />
              <Route
                path="/upload"
                element={
                  <UploadPage
                    resources={resources}
                    events={events}
                    isLoading={isLoading}
                    isSavingResource={isSavingResource}
                    isSavingEvent={isSavingEvent}
                    onSaveResource={onSaveResource}
                    onDeleteResource={onDeleteResource}
                    onSaveEvent={onSaveEvent}
                    onDeleteEvent={onDeleteEvent}
                  />
                }
              />
              <Route
                path="/analytics"
                element={
                  <AnalyticsPage
                    stats={stats}
                    resources={resources}
                    events={events}
                    isLoading={isLoading}
                  />
                }
              />
              <Route
                path="/settings"
                element={
                  <SettingsPage
                    apiBaseUrl={API_BASE_URL}
                    stats={stats}
                    adminName={adminName}
                    onRefresh={onRefresh}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function App() {
  const [adminName, setAdminName] = useState(() => getStoredAdminName());
  const [stats, setStats] = useState(null);
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingResource, setIsSavingResource] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [feedback, setFeedback] = useState(DEFAULT_FEEDBACK);

  async function loadAdminData({ silent = false } = {}) {
    try {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setFeedback(DEFAULT_FEEDBACK);

      const [statsData, resourcesData, eventsData] = await Promise.all([
        fetchAdminStats(),
        fetchAdminResources(),
        fetchAdminEvents(),
      ]);

      setStats(statsData);
      setResources(Array.isArray(resourcesData) ? resourcesData : []);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Unable to load admin data.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    if (!adminName) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadAdminData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [adminName]);

  async function handleResourceSave(payload) {
    setIsSavingResource(true);
    setFeedback(DEFAULT_FEEDBACK);

    try {
      await saveAdminResource(payload);
      await loadAdminData({ silent: true });
      setFeedback({
        type: "success",
        message: payload.id
          ? "Resource updated successfully."
          : "Resource uploaded successfully.",
      });
      return true;
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Unable to save resource.",
      });
      return false;
    } finally {
      setIsSavingResource(false);
    }
  }

  async function handleEventSave(payload) {
    setIsSavingEvent(true);
    setFeedback(DEFAULT_FEEDBACK);

    try {
      await saveAdminEvent(payload);
      await loadAdminData({ silent: true });
      setFeedback({
        type: "success",
        message: payload.id
          ? "Event updated successfully."
          : "Event created successfully.",
      });
      return true;
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Unable to save event.",
      });
      return false;
    } finally {
      setIsSavingEvent(false);
    }
  }

  async function handleResourceDelete(resourceId) {
    const confirmed = window.confirm(
      "Delete this resource from the admin panel and website?",
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminResource(resourceId);
      await loadAdminData({ silent: true });
      setFeedback({
        type: "success",
        message: "Resource deleted successfully.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Unable to delete resource.",
      });
    }
  }

  async function handleEventDelete(eventId) {
    const confirmed = window.confirm(
      "Delete this event from the admin panel and website?",
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminEvent(eventId);
      await loadAdminData({ silent: true });
      setFeedback({
        type: "success",
        message: "Event deleted successfully.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Unable to delete event.",
      });
    }
  }

  function handleEnterWorkspace(nextAdminName) {
    setStoredAdminName(nextAdminName);
    setAdminName(nextAdminName);
  }

  function handleSignOut() {
    clearStoredAdminName();
    setAdminName("");
    setStats(null);
    setResources([]);
    setEvents([]);
    setFeedback(DEFAULT_FEEDBACK);
  }

  if (!adminName) {
    return <LoginPage onSubmit={handleEnterWorkspace} />;
  }

  return (
    <AppShell
      adminName={adminName}
      stats={stats}
      resources={resources}
      events={events}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      isSavingResource={isSavingResource}
      isSavingEvent={isSavingEvent}
      feedback={feedback}
      onRefresh={() => loadAdminData({ silent: true })}
      onSignOut={handleSignOut}
      onSaveResource={handleResourceSave}
      onDeleteResource={handleResourceDelete}
      onSaveEvent={handleEventSave}
      onDeleteEvent={handleEventDelete}
    />
  );
}

export default App;
