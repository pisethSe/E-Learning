import React, { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Download,
  LogOut,
  RefreshCcw,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import AdminSidebar from "./components/layout/AdminSidebar";
import { Button } from "./components/ui/Button";
import LoginPage from "./pages/LoginPage";
import {
  API_BASE_URL,
  deleteAdminEvent,
  deleteAdminResource,
  downloadAdminBackup,
  fetchCurrentAdmin,
  fetchAdminDownloads,
  fetchAdminEvents,
  fetchAdminResources,
  fetchAdminStats,
  loginAdmin,
  logoutAdmin,
  resolveAssetUrl,
  saveAdminEvent,
  saveAdminResource,
} from "./services/api";
import {
  clearStoredAdminUser,
  getAdminDisplayName,
  getStoredAdminUser,
  setStoredAdminUser,
} from "./services/auth";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const UploadPage = lazy(() => import("./pages/UploadPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const DownloadPage = lazy(() => import("./pages/DownloadPage"));
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
  "/download": {
    title: "Download",
    description: "Review student file opens and download activity from the public website.",
  },
  "/settings": {
    title: "Settings",
    description: "Review workspace settings and catalog rules.",
  },
};

function upsertById(items, nextItem) {
  if (!nextItem?.id) {
    return items;
  }

  const existingIndex = items.findIndex((item) => item.id === nextItem.id);
  if (existingIndex === -1) {
    return [nextItem, ...items];
  }

  return items.map((item) => (item.id === nextItem.id ? nextItem : item));
}

function TopBar({
  adminName,
  adminAvatarUrl,
  isBackingUp,
  isRefreshing,
  isSigningOut,
  onBackup,
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
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs font-bold text-slate-800">
              {adminAvatarUrl ? (
                <img src={adminAvatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
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
          <Button
            className="h-11 gap-2"
            onClick={onBackup}
            disabled={isBackingUp}
          >
            <Download size={16} />
            {isBackingUp ? "Backing up..." : "Back up file"}
          </Button>
          <Button
            variant="ghost"
            onClick={onSignOut}
            className="h-11 gap-2"
            disabled={isSigningOut}
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">
              {isSigningOut ? "Switching..." : "Switch Admin"}
            </span>
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

function SuccessPopup({ message, onClose }) {
  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(onClose, 4200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message ? (
        <Motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="fixed left-4 right-4 top-20 z-50 overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] sm:left-auto sm:right-6 sm:top-6 sm:w-[24rem]"
        >
          <div className="flex items-start gap-3 px-4 py-4">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-950">Upload complete</p>
              <p className="mt-1 text-sm leading-5 text-slate-600">{message}</p>
            </div>
            <button
              type="button"
              aria-label="Close success message"
              onClick={onClose}
              className="-mr-1 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <X size={16} />
            </button>
          </div>
          <div className="h-1 bg-emerald-50">
            <div className="success-toast-progress h-full bg-emerald-500" />
          </div>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function DeleteConfirmationDialog({
  pendingDelete,
  isDeleting,
  onCancel,
  onConfirm,
}) {
  const itemType = pendingDelete?.type === "event" ? "event video" : "resource";
  const itemTitle = pendingDelete?.title || `this ${itemType}`;

  return (
    <AnimatePresence>
      {pendingDelete ? (
        <Motion.div
          role="presentation"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirmation-title"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.24)]"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <TriangleAlert size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <h2
                  id="delete-confirmation-title"
                  className="text-lg font-bold text-slate-950"
                >
                  Delete {itemType}?
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This will permanently remove <span className="font-semibold text-slate-900">{itemTitle}</span> from the admin panel and public website.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                className="gap-2"
                onClick={onConfirm}
                disabled={isDeleting}
              >
                <Trash2 size={16} />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </Motion.div>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function AppShell({
  adminUser,
  adminName,
  stats,
  resources,
  events,
  downloads,
  isLoading,
  isBackingUp,
  isRefreshing,
  isSigningOut,
  isSavingResource,
  isSavingEvent,
  feedback,
  onBackup,
  onAdminUpdate,
  onRefresh,
  onSignOut,
  onSaveResource,
  onDeleteResource,
  onSaveEvent,
  onDeleteEvent,
  onClearFeedback,
}) {
  const successMessage = feedback.type === "success" ? feedback.message : "";
  const inlineFeedback = feedback.type === "success" ? DEFAULT_FEEDBACK : feedback;
  const adminAvatarUrl = resolveAssetUrl(adminUser?.avatar_path);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar adminName={adminName} adminAvatarUrl={adminAvatarUrl} />
      <SuccessPopup message={successMessage} onClose={onClearFeedback} />

      <div className="min-h-screen pt-16 md:ml-72 md:pt-0">
        <TopBar
          adminName={adminName}
          adminAvatarUrl={adminAvatarUrl}
          isBackingUp={isBackingUp}
          isRefreshing={isRefreshing}
          isSigningOut={isSigningOut}
          onBackup={onBackup}
          onRefresh={onRefresh}
          onSignOut={onSignOut}
        />

        <main className="mx-auto max-w-[1440px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          {inlineFeedback.message ? (
            <div
              className={`mb-6 rounded-lg border px-4 py-3 text-sm font-semibold ${getFeedbackClasses(inlineFeedback.type)}`}
            >
              {inlineFeedback.message}
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
                    downloads={downloads}
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
                    resourceErrorMessage={
                      inlineFeedback.type === "error" ? inlineFeedback.message : ""
                    }
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
                    downloads={downloads}
                    isLoading={isLoading}
                  />
                }
              />
              <Route
                path="/download"
                element={
                  <DownloadPage
                    downloads={downloads}
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
                    adminUser={adminUser}
                    adminName={adminName}
                    onAdminUpdate={onAdminUpdate}
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
  const [downloads, setDownloads] = useState([]);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSavingResource, setIsSavingResource] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [feedback, setFeedback] = useState(DEFAULT_FEEDBACK);
  const adminName = getAdminDisplayName(adminUser);

  const clearAdminSession = useCallback(() => {
    clearStoredAdminUser();
    setAdminUser(null);
    setStats(null);
    setResources([]);
    setEvents([]);
    setDownloads([]);
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

      const [statsData, resourcesData, eventsData, downloadsData] = await Promise.all([
        fetchAdminStats(),
        fetchAdminResources(),
        fetchAdminEvents(),
        fetchAdminDownloads(),
      ]);

      const nextResources = Array.isArray(resourcesData) ? resourcesData : [];
      const nextEvents = Array.isArray(eventsData) ? eventsData : [];
      const nextDownloads = Array.isArray(downloadsData) ? downloadsData : [];

      setStats(statsData);
      setResources(nextResources);
      setEvents(nextEvents);
      setDownloads(nextDownloads);
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        clearAdminSession();
        return;
      }

      if (!silent) {
        setStats(null);
        setResources([]);
        setEvents([]);
        setDownloads([]);
      }
      setFeedback({
        type: "error",
        message:
          error.message ||
          "Unable to load admin data from the backend.",
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
    setIsSavingResource(true);
    setFeedback(DEFAULT_FEEDBACK);

    try {
      const savedResource = await saveAdminResource(payload);
      setResources((currentResources) => upsertById(currentResources, savedResource));
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
          : `${resourceLabel} uploaded successfully${
              payload.is_published ? " and published to the student website" : ""
            }.`,
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
          : `Event created successfully${
              payload.is_published ? " and published to the student website" : ""
            }.`,
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

  function handleResourceDelete(resource) {
    const resourceId = typeof resource === "object" ? resource.id : resource;

    setPendingDelete({
      type: "resource",
      id: resourceId,
      title: typeof resource === "object" ? resource.title : "this resource",
    });
  }

  function handleEventDelete(event) {
    const eventId = typeof event === "object" ? event.id : event;

    setPendingDelete({
      type: "event",
      id: eventId,
      title: typeof event === "object" ? event.title : "this event video",
    });
  }

  async function confirmPendingDelete() {
    if (!pendingDelete || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setFeedback(DEFAULT_FEEDBACK);
    try {
      if (pendingDelete.type === "event") {
        await deleteAdminEvent(pendingDelete.id);
      } else {
        await deleteAdminResource(pendingDelete.id);
      }

      await loadAdminData({ silent: true });
      setFeedback({
        type: "success",
        message:
          pendingDelete.type === "event"
            ? "Event deleted successfully."
            : "Resource deleted successfully.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.message ||
          (pendingDelete.type === "event"
            ? "Unable to delete event."
            : "Unable to delete resource."),
      });
    } finally {
      setPendingDelete(null);
      setIsDeleting(false);
    }
  }

  async function handleEnterWorkspace(credentials) {
    const authResponse = await loginAdmin(credentials);
    setStoredAdminUser(authResponse.user);
    setAdminUser(authResponse.user);
  }

  async function handleBackupDownload() {
    if (isBackingUp) {
      return;
    }

    setIsBackingUp(true);
    setFeedback(DEFAULT_FEEDBACK);

    try {
      await downloadAdminBackup();
      setFeedback({
        type: "success",
        message: "Backup file downloaded successfully.",
      });
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        clearAdminSession();
        return;
      }

      setFeedback({
        type: "error",
        message: error.message || "Unable to download backup file.",
      });
    } finally {
      setIsBackingUp(false);
    }
  }

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setFeedback(DEFAULT_FEEDBACK);

    try {
      await logoutAdmin();
    } finally {
      clearAdminSession();
      setIsSigningOut(false);
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
    <>
      <AppShell
        adminName={adminName}
        adminUser={adminUser}
        stats={stats}
        resources={resources}
        events={events}
        downloads={downloads}
        isLoading={isLoading}
        isBackingUp={isBackingUp}
        isRefreshing={isRefreshing}
        isSigningOut={isSigningOut}
        isSavingResource={isSavingResource}
        isSavingEvent={isSavingEvent}
        feedback={feedback}
        onBackup={handleBackupDownload}
        onAdminUpdate={(nextUser) => {
          setStoredAdminUser(nextUser);
          setAdminUser(nextUser);
        }}
        onRefresh={() => loadAdminData({ silent: true })}
        onSignOut={handleSignOut}
        onSaveResource={handleResourceSave}
        onDeleteResource={handleResourceDelete}
        onSaveEvent={handleEventSave}
        onDeleteEvent={handleEventDelete}
        onClearFeedback={() => setFeedback(DEFAULT_FEEDBACK)}
      />
      <DeleteConfirmationDialog
        pendingDelete={pendingDelete}
        isDeleting={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setPendingDelete(null);
          }
        }}
        onConfirm={confirmPendingDelete}
      />
    </>
  );
}

export default App;
