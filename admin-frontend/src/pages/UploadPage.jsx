import React from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CalendarRange, FileStack, UploadCloud } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import EventsPage from "./EventsPage";
import ResourcesPage from "./ResourcesPage";

const tabs = [
  {
    id: "resources",
    label: "Resources",
    icon: FileStack,
    color: "text-primary-600",
    border: "border-primary-200 bg-primary-50/50",
    button: "bg-primary-600 hover:bg-primary-700",
  },
  {
    id: "events",
    label: "Events",
    icon: CalendarRange,
    color: "text-emerald-600",
    border: "border-emerald-200 bg-emerald-50/50",
    button: "bg-emerald-600 hover:bg-emerald-700",
  },
];

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
  const [searchParams] = useSearchParams();
  const activeTab = tabs.find((tab) => tab.id === searchParams.get("tab"))?.id || "resources";
  const activeTabData = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  const ActiveIcon = activeTabData.icon;

  function handleTabChange(tabId) {
    navigate(`/upload?tab=${tabId}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Upload Content
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Add new resources or publish student-facing events.
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
            {activeTab === "resources" ? "Upload Resource Files" : "Create New Event"}
          </h3>
          <p className="mb-6 mt-2 max-w-md text-sm text-slate-500">
            {activeTab === "resources"
              ? "Manage documents, images, audio lessons, and links for the student library."
              : "Publish upcoming workshops, registration notices, and school announcements."}
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
            {activeTab === "resources" ? "Open Resource Form" : "Open Event Form"}
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
          {activeTab === "resources" ? (
            <ResourcesPage
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
