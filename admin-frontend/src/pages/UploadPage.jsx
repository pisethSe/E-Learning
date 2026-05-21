import React from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FileText, Headphones, ImagePlus, UploadCloud, Video } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import EventsPage from "./EventsPage";
import ResourcesPage from "./ResourcesPage";

const tabs = [
  {
    id: "photo",
    label: "Image Files",
    icon: ImagePlus,
    color: "text-sky-600",
    border: "border-sky-200 bg-sky-50/50",
    button: "bg-sky-600 hover:bg-sky-700",
    title: "Upload Image Files",
    copy: "Add scanned pages, diagrams, and image-based study materials. Students see them together with files and can filter by category.",
    buttonLabel: "Open Image Form",
  },
  {
    id: "file",
    label: "Files",
    icon: FileText,
    color: "text-primary-600",
    border: "border-primary-200 bg-primary-50/50",
    button: "bg-primary-600 hover:bg-primary-700",
    title: "Upload Files",
    copy: "Add answer keys, formulas, exam papers, documents, presentations, spreadsheets, and e-books.",
    buttonLabel: "Open File Form",
  },
  {
    id: "audio",
    label: "Audio",
    icon: Headphones,
    color: "text-indigo-600",
    border: "border-indigo-200 bg-indigo-50/50",
    button: "bg-indigo-600 hover:bg-indigo-700",
    title: "Upload Khmer Literature Audio",
    copy: "Story audio files for Khmer Literature essay writing and revision.",
    buttonLabel: "Open Audio Form",
  },
  {
    id: "events",
    label: "Event Videos",
    icon: Video,
    color: "text-emerald-600",
    border: "border-emerald-200 bg-emerald-50/50",
    button: "bg-emerald-600 hover:bg-emerald-700",
    title: "Upload Event Videos",
    copy: "Publish event videos with dates, locations, and registration links.",
    buttonLabel: "Open Event Form",
  },
];

function resolveUploadTab(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "resources" || normalized === "documents" || normalized === "document") {
    return "file";
  }

  if (normalized === "image" || normalized === "images") {
    return "photo";
  }

  if (tabs.some((tab) => tab.id === normalized)) {
    return normalized;
  }

  return "photo";
}

export default function UploadPage({
  resources,
  events,
  isLoading,
  isSavingResource,
  isSavingEvent,
  onSaveResource,
  onDeleteResource,
  onSaveEvent,
  onDeleteEvent,
}) {
  const navigate = useNavigate();
  const { tab } = useParams();
  const [searchParams] = useSearchParams();
  const activeTab = resolveUploadTab(tab || searchParams.get("tab"));
  const activeTabData = tabs.find((tabItem) => tabItem.id === activeTab) || tabs[0];
  const ActiveIcon = activeTabData.icon;

  function handleTabChange(tabId) {
    navigate(`/upload/${tabId}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Upload Content
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Add image files, documents, Khmer Literature audio, and event videos using the same catalog students filter on.
          </p>
        </div>
      </div>

      <div className="hide-scrollbar overflow-x-auto pb-2">
        <div className="flex space-x-1 rounded-lg border border-slate-200 bg-white p-1 shadow-soft">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-slate-100 text-slate-900 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <tab.icon size={16} className={isActive ? tab.color : "text-slate-400"} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <Card className={`border-2 border-dashed transition-colors duration-300 ${activeTabData.border}`}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-100 bg-white shadow-sm">
            <ActiveIcon size={32} className={activeTabData.color} />
          </div>

          <h3 className="text-lg font-semibold text-slate-900">
            {activeTabData.title}
          </h3>
          <p className="mb-6 mt-2 max-w-md text-sm text-slate-500">
            {activeTabData.copy}
          </p>

          <Button
            className={activeTabData.button}
            onClick={() =>
              window.scrollTo({
                top: 420,
                behavior: "smooth",
              })
            }
          >
            <UploadCloud size={18} className="mr-2" />
            {activeTabData.buttonLabel}
          </Button>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        <Motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "photo" ? (
            <ResourcesPage
              mode="photo"
              resources={resources}
              isLoading={isLoading}
              isSaving={isSavingResource}
              onSave={onSaveResource}
              onDelete={onDeleteResource}
            />
          ) : activeTab === "file" ? (
            <ResourcesPage
              mode="file"
              resources={resources}
              isLoading={isLoading}
              isSaving={isSavingResource}
              onSave={onSaveResource}
              onDelete={onDeleteResource}
            />
          ) : activeTab === "audio" ? (
            <ResourcesPage
              mode="audio"
              resources={resources}
              isLoading={isLoading}
              isSaving={isSavingResource}
              onSave={onSaveResource}
              onDelete={onDeleteResource}
            />
          ) : (
            <EventsPage
              events={events}
              isLoading={isLoading}
              isSaving={isSavingEvent}
              onSave={onSaveEvent}
              onDelete={onDeleteEvent}
            />
          )}
        </Motion.div>
      </AnimatePresence>
    </div>
  );
}
