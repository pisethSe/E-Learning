import React, { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { CalendarDays, ChevronRight, LogOut, RefreshCcw, UploadCloud } from "lucide-react";
import AdminSidebar from "./components/layout/AdminSidebar";
import { Button } from "./components/ui/Button";
import LoginPage from "./pages/LoginPage";
import {
  API_BASE_URL,
  deleteAdminEvent,
  deleteAdminResource,
  fetchCurrentAdmin,
  fetchAdminEvents,
  fetchAdminResources,
  fetchAdminStats,
  loginAdmin,
  logoutAdmin,
  saveAdminEvent,
  saveAdminResource,
} from "./services/api";
import {
  clearStoredAdminUser,
  getAdminDisplayName,
  getStoredAdminUser,
  setStoredAdminUser,
} from "./services/auth";
import {
  MOCK_ADMIN_EVENTS,
  MOCK_ADMIN_RESOURCES,
  MOCK_ADMIN_STATS,
  isMockRecordId,
  shouldUseMockAdminData,
} from "./data/mockAdminData";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const UploadPage = lazy(() => import("./pages/UploadPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

const DEFAULT_FEEDBACK = { type: "", message: "" };

const PAGE_META = {
  "/": {
    title: "Overview",
    description: "Monitor catalog coverage, publishing status, and student-facing content.",
  },
  "/upload": {
    title: "Upload",
    description: "Add image files, documents, Khmer Literature audio, and event videos.",
  },
  "/analytics": {
    title: "Analytics",
    description: "Track grade, subject, category, audio, and event video coverage.",
  },
  "/settings": {
    title: "Settings",
    description: "Review workspace settings and catalog rules.",
  },
};

function TopBar({
  adminName,
  isRefreshing,
  onRefresh,
  onSignOut,
}) {
  const location = useLocation();
  const meta =
    PAGE_META[location.pathname] ||
    (location.pathname.startsWith("/upload") ? PAGE_META["/upload"] : PAGE_META["/"]);
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());
  const pageTitle = meta.title === "Overview" ? "My dashboard" : meta.title;
  const initials = (adminName || "A").slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-16 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur md:top-0">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-800">
              {initials}
            </span>
            <span className="max-w-[10rem] truncate">{adminName}</span>
            <ChevronRight size={16} className="text-slate-300" />
            <span className="text-slate-900">{meta.title}</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {pageTitle}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{meta.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm">
            <CalendarDays size={16} className="text-slate-400" />
            <span>{today}</span>
          </div>
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-11 gap-2"
          >
            <RefreshCcw size={16} className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "Refreshing" : "Refresh"}
          </Button>
          <Link to="/upload/file">
            <Button className="h-11 gap-2">
              <UploadCloud size={16} />
              New upload
            </Button>
          </Link>
          <Button variant="ghost" onClick={onSignOut} className="h-11 gap-2">
            <LogOut size={16} />
            <span className="hidden sm:inline">Switch Admin</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

function getFeedbackClasses(type) {
  if (type === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (type === "info") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
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

      <div className="min-h-screen pt-16 md:ml-72 md:pt-0">
        <TopBar
          adminName={adminName}
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          onSignOut={onSignOut}
        />

        <main className="mx-auto max-w-[1440px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          {feedback.message ? (
            <div
              className={`mb-6 rounded-lg border px-4 py-3 text-sm font-semibold ${getFeedbackClasses(feedback.type)}`}
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
                path="/upload/:tab?"
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
  const [adminUser, setAdminUser] = useState(() => getStoredAdminUser());
  const [stats, setStats] = useState(null);
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingResource, setIsSavingResource] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [feedback, setFeedback] = useState(DEFAULT_FEEDBACK);
  const adminName = getAdminDisplayName(adminUser);

  const clearAdminSession = useCallback(() => {
    clearStoredAdminUser();
    setAdminUser(null);
    setStats(null);
    setResources([]);
    setEvents([]);
    setFeedback(DEFAULT_FEEDBACK);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      try {
        const currentUser = await fetchCurrentAdmin();
        if (!isMounted) {
          return;
        }

        setStoredAdminUser(currentUser);
        setAdminUser(currentUser);
      } catch {
        if (isMounted) {
          clearStoredAdminUser();
          setAdminUser(null);
        }
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    }

    void verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadAdminData = useCallback(async ({ silent = false } = {}) => {
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

      const nextResources = Array.isArray(resourcesData) ? resourcesData : [];
      const nextEvents = Array.isArray(eventsData) ? eventsData : [];

      if (shouldUseMockAdminData(statsData, nextResources, nextEvents)) {
        setStats(MOCK_ADMIN_STATS);
        setResources(MOCK_ADMIN_RESOURCES);
        setEvents(MOCK_ADMIN_EVENTS);
        setFeedback({
          type: "info",
          message: "Showing sample data because the admin catalog is empty.",
        });
        return;
      }

      setStats(statsData);
      setResources(nextResources);
      setEvents(nextEvents);
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        clearAdminSession();
        return;
      }

      setStats(MOCK_ADMIN_STATS);
      setResources(MOCK_ADMIN_RESOURCES);
      setEvents(MOCK_ADMIN_EVENTS);
      setFeedback({
        type: "info",
        message:
          error.message ||
          "Showing sample data because the admin backend is not available.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [clearAdminSession]);

  useEffect(() => {
    if (!adminUser || isCheckingSession) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadAdminData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [adminUser, isCheckingSession, loadAdminData]);

  async function handleResourceSave(payload) {
    if (isMockRecordId(payload.id)) {
      setFeedback({
        type: "info",
        message: "Sample rows are read-only. Create a new upload to save real data.",
      });
      return false;
    }

    setIsSavingResource(true);
    setFeedback(DEFAULT_FEEDBACK);

    try {
      await saveAdminResource(payload);
      await loadAdminData({ silent: true });
      const resourceLabel =
        payload.file_type === "audio"
          ? "Audio"
          : payload.file_type === "image"
            ? "Image file"
            : "File";
      setFeedback({
        type: "success",
        message: payload.id
          ? `${resourceLabel} updated successfully.`
          : `${resourceLabel} uploaded successfully.`,
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
    if (isMockRecordId(payload.id)) {
      setFeedback({
        type: "info",
        message: "Sample events are read-only. Create a new event to save real data.",
      });
      return false;
    }

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
    if (isMockRecordId(resourceId)) {
      setFeedback({
        type: "info",
        message: "Sample rows are read-only. Add real content when you are ready.",
      });
      return;
    }

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
    if (isMockRecordId(eventId)) {
      setFeedback({
        type: "info",
        message: "Sample events are read-only. Add a real event when you are ready.",
      });
      return;
    }

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

  async function handleEnterWorkspace(credentials) {
    const authResponse = await loginAdmin(credentials);
    setStoredAdminUser(authResponse.user);
    setAdminUser(authResponse.user);
  }

  async function handleSignOut() {
    try {
      await logoutAdmin();
    } finally {
      clearAdminSession();
    }
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-sm font-semibold text-white">
        Checking admin session...
      </main>
    );
  }

  if (!adminUser) {
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
