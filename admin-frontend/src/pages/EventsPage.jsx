import React, { useState } from "react";
import { CalendarPlus2, Save } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { resolveAssetUrl } from "../services/api";

const DEFAULT_FORM = {
  id: null,
  title: "",
  description: "",
  status: "coming_soon",
  location: "",
  event_date: "",
  cta_label: "",
  cta_url: "",
  is_published: true,
  media: null,
};

const EVENT_STATUSES = [
  "coming_soon",
  "upcoming",
  "registration_open",
  "live",
  "completed",
];

function createInitialState(event) {
  if (!event) {
    return DEFAULT_FORM;
  }

  const isoValue = event.event_date
    ? new Date(event.event_date).toISOString().slice(0, 16)
    : "";

  return {
    id: event.id,
    title: event.title || "",
    description: event.description || "",
    status: event.status || "coming_soon",
    location: event.location || "",
    event_date: isoValue,
    cta_label: event.cta_label || "",
    cta_url: event.cta_url || "",
    is_published: Boolean(event.is_published),
    media: null,
  };
}

function FieldLabel({ children }) {
  return <span className="mb-2 block text-sm font-medium text-slate-700">{children}</span>;
}

function EventForm({ event, onSubmit, onCancel, isSaving }) {
  const [formState, setFormState] = useState(() => createInitialState(event));

  function updateField(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();
    const wasSaved = await onSubmit(formState);
    if (wasSaved && !event) {
      setFormState(DEFAULT_FORM);
    }
  }

  return (
    <Card>
      <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Event video upload
            </p>
            <h3 className="text-lg font-semibold text-slate-900">
              {event ? "Edit event video" : "Add event video"}
            </h3>
          </div>
        </div>
        {event ? (
          <button
            type="button"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
            onClick={onCancel}
          >
            Cancel
          </button>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <FieldLabel>Title</FieldLabel>
          <input
            required
            value={formState.title}
            onChange={(eventTarget) => updateField("title", eventTarget.target.value)}
            placeholder="Science workshop for Grade 12"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
          />
        </label>

        <label className="block">
          <FieldLabel>Description</FieldLabel>
          <textarea
            rows="4"
            value={formState.description}
            onChange={(eventTarget) => updateField("description", eventTarget.target.value)}
            placeholder="Short public description for the events page"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <FieldLabel>Status</FieldLabel>
            <select
              value={formState.status}
              onChange={(eventTarget) => updateField("status", eventTarget.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
            >
              {EVENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <FieldLabel>Location</FieldLabel>
            <input
              value={formState.location}
              onChange={(eventTarget) => updateField("location", eventTarget.target.value)}
              placeholder="Online / Phnom Penh"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
            />
          </label>

          <label className="block">
            <FieldLabel>Event date</FieldLabel>
            <input
              type="datetime-local"
              value={formState.event_date}
              onChange={(eventTarget) => updateField("event_date", eventTarget.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
            />
          </label>

          <label className="block">
            <FieldLabel>CTA label</FieldLabel>
            <input
              value={formState.cta_label}
              onChange={(eventTarget) => updateField("cta_label", eventTarget.target.value)}
              placeholder="Register now"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
            />
          </label>
        </div>

        <label className="block">
          <FieldLabel>CTA URL</FieldLabel>
          <input
            value={formState.cta_url}
            onChange={(eventTarget) => updateField("cta_url", eventTarget.target.value)}
            placeholder="https://example.com/register"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
          />
        </label>

        <label className="block">
          <FieldLabel>{event ? "Replace event video" : "Upload event video"}</FieldLabel>
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <input
              type="file"
              accept="video/*,.mp4,.webm,.mov,.m4v,.ogg"
              onChange={(eventTarget) => updateField("media", eventTarget.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-emerald-700"
            />
            <p className="mt-2 text-xs text-slate-500">
              Upload a video about the event for the public events page.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <input
            type="checkbox"
            checked={formState.is_published}
            onChange={(eventTarget) => updateField("is_published", eventTarget.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <div>
            <span className="block text-sm font-medium text-slate-900">
              Show this event on the website
            </span>
            <span className="text-xs text-slate-500">
              Published events will appear on the student-facing events page.
            </span>
          </div>
        </label>

        <Button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Save size={16} className="mr-2" />
              {event ? "Saving..." : "Creating..."}
            </>
          ) : (
            <>
              <CalendarPlus2 size={16} className="mr-2" />
              {event ? "Save Event" : "Create Event"}
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}

function EventList({ events, onEdit, onDelete, isLoading }) {
  return (
    <Card>
      <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Event videos library
            </p>
            <h3 className="text-lg font-semibold text-slate-900">
              {events.length} of {events.length} event video library items
            </h3>
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading events...</p>
      ) : (
        <div className="space-y-4">
          {(events.length ? events : [{ id: "empty" }]).map((event) =>
            event.id === "empty" ? (
              <p key="empty" className="text-sm text-slate-500">
                No events created yet.
              </p>
            ) : (
              <article
                key={event.id}
                className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 lg:grid-cols-[180px,1fr]"
              >
                {(event.media_path || event.image_path) ? (
                  event.media_type === "video" ? (
                    <video
                      className="h-44 w-full rounded-lg bg-slate-900 object-cover"
                      src={resolveAssetUrl(event.media_path)}
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <img
                      className="h-44 w-full rounded-lg object-cover"
                      src={resolveAssetUrl(event.media_path || event.image_path)}
                      alt={event.title}
                    />
                  )
                ) : (
                  <div className="flex h-44 items-center justify-center rounded-lg bg-slate-200 text-sm text-slate-500">
                    No media
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                      {event.status}
                    </span>
                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                        event.is_published
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {event.is_published ? "Published" : "Draft"}
                    </span>
                  </div>

                  <h4 className="mt-3 text-lg font-semibold text-slate-900">{event.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {event.description || "No description added yet."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>{event.location || "Location TBD"}</span>
                    <span>
                      {event.event_date
                        ? new Date(event.event_date).toLocaleString()
                        : "Date to be announced"}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" onClick={() => onEdit(event)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => onDelete(event.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      )}
    </Card>
  );
}

export default function EventsPage({
  events,
  isLoading,
  isSaving,
  onSave,
  onDelete,
}) {
  const [editingEvent, setEditingEvent] = useState(null);

  async function handleSave(payload) {
    const wasSaved = await onSave(payload);
    if (wasSaved) {
      setEditingEvent(null);
    }
    return wasSaved;
  }

  function handleEdit(event) {
    setEditingEvent(event);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="space-y-6">
      <EventForm
        key={editingEvent ? `event-${editingEvent.id}` : "event-new"}
        event={editingEvent}
        onSubmit={handleSave}
        onCancel={() => setEditingEvent(null)}
        isSaving={isSaving}
      />

      <EventList
        events={events}
        onEdit={handleEdit}
        onDelete={onDelete}
        isLoading={isLoading}
      />
    </section>
  );
}
