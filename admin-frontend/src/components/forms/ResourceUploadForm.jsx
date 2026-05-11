import React, { useState } from "react";
import { FilePlus2, Save } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

const DEFAULT_FORM = {
  id: null,
  title: "",
  description: "",
  grade_level: "12",
  subject: "Mathematics",
  category: "",
  file_type: "document",
  external_url: "",
  is_published: true,
  file: null,
};

const SUBJECT_OPTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Khmer Literature",
  "History",
  "Geography",
  "English",
];

const CATEGORY_OPTIONS = [
  { value: "", label: "General" },
  { value: "exam", label: "Exam papers" },
  { value: "exercise", label: "Exercises" },
  { value: "formula", label: "Formulas" },
  { value: "answer", label: "Answer keys" },
];

function createInitialState(resource) {
  if (!resource) {
    return DEFAULT_FORM;
  }

  return {
    id: resource.id,
    title: resource.title || "",
    description: resource.description || "",
    grade_level: String(resource.grade_level || 12),
    subject: resource.subject || "Mathematics",
    category: resource.category || "",
    file_type: resource.file_type || "document",
    external_url: resource.external_url || "",
    is_published: Boolean(resource.is_published),
    file: null,
  };
}

function FieldLabel({ children }) {
  return <span className="mb-2 block text-sm font-medium text-slate-700">{children}</span>;
}

export default function ResourceUploadForm({
  resource,
  onSubmit,
  onCancel,
  isSaving,
}) {
  const [formState, setFormState] = useState(() => createInitialState(resource));

  function updateField(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const wasSaved = await onSubmit({
      ...formState,
      grade_level: Number(formState.grade_level),
    });

    if (wasSaved && !resource) {
      setFormState(DEFAULT_FORM);
    }
  }

  return (
    <Card className="xl:sticky xl:top-28">
      <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Resource upload
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            {resource ? "Edit resource" : "Add new resource"}
          </h3>
        </div>
        {resource ? (
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
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Grade 12 mathematics formula sheet"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
          />
        </label>

        <label className="block">
          <FieldLabel>Description</FieldLabel>
          <textarea
            rows="4"
            value={formState.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Short description for the public website"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <FieldLabel>Grade</FieldLabel>
            <select
              value={formState.grade_level}
              onChange={(event) => updateField("grade_level", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
            >
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
          </label>

          <label className="block">
            <FieldLabel>Subject</FieldLabel>
            <select
              value={formState.subject}
              onChange={(event) => updateField("subject", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
            >
              {SUBJECT_OPTIONS.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <FieldLabel>Type</FieldLabel>
            <select
              value={formState.file_type}
              onChange={(event) => updateField("file_type", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
            >
              <option value="document">Document / file</option>
              <option value="image">Image</option>
              <option value="audio">Audio</option>
            </select>
          </label>

          <label className="block">
            <FieldLabel>Category</FieldLabel>
            <select
              value={formState.category}
              onChange={(event) => updateField("category", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value || "general"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <FieldLabel>External URL</FieldLabel>
          <input
            value={formState.external_url}
            onChange={(event) => updateField("external_url", event.target.value)}
            placeholder="Optional link if you do not upload a file"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
          />
        </label>

        <label className="block">
          <FieldLabel>{resource ? "Replace uploaded file" : "Upload file"}</FieldLabel>
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <input
              type="file"
              onChange={(event) => updateField("file", event.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-600 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-primary-700"
            />
            <p className="mt-2 text-xs text-slate-500">
              Upload documents, images, or audio. Thumbnails are generated for images.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <input
            type="checkbox"
            checked={formState.is_published}
            onChange={(event) => updateField("is_published", event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          <div>
            <span className="block text-sm font-medium text-slate-900">
              Publish this resource
            </span>
            <span className="text-xs text-slate-500">
              Make it visible on the public website immediately after save.
            </span>
          </div>
        </label>

        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? (
            <>
              <Save size={16} className="mr-2" />
              {resource ? "Saving..." : "Uploading..."}
            </>
          ) : (
            <>
              <FilePlus2 size={16} className="mr-2" />
              {resource ? "Save Changes" : "Upload Resource"}
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
