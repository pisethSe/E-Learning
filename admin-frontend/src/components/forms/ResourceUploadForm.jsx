import React, { useState } from "react";
import { FilePlus2, Save } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import {
  AUDIO_SUBJECT,
  GRADE_OPTIONS,
  RESOURCE_CATEGORIES,
  RESOURCE_FILE_TYPES,
  getCategoryLabel,
  getSubjectLabel,
  getSubjectsForGrade,
  normalizeCategoryId,
} from "../../data/learningCatalog";

function normalizeUploadMode(mode = "file") {
  if (mode === "audio") {
    return "audio";
  }

  if (mode === "photo" || mode === "image") {
    return "photo";
  }

  return "file";
}

function getFileTypeForMode(mode = "file") {
  const uploadMode = normalizeUploadMode(mode);

  if (uploadMode === "audio") {
    return "audio";
  }

  if (uploadMode === "photo") {
    return "image";
  }

  return "document";
}

function getModeText(mode = "file", hasResource = false) {
  const uploadMode = normalizeUploadMode(mode);

  if (uploadMode === "audio") {
    return {
      eyebrow: "Khmer Literature audio",
      heading: hasResource ? "Edit Khmer audio" : "Add Khmer audio",
      copy: "Upload Khmer Literature story audio for essay writing and revision.",
      placeholder: "រឿងទុំទាវ audio lesson",
      descriptionPlaceholder: "Short note for the Khmer Literature audio page",
      accepted: "Accepted: MP3, WAV, M4A, AAC, or OGG audio files.",
      action: hasResource ? "Save Changes" : "Upload Audio",
    };
  }

  if (uploadMode === "photo") {
    return {
      eyebrow: "Image file upload",
      heading: hasResource ? "Edit image file" : "Add image file",
      copy: "Upload scanned pages, diagrams, and visual study materials. Students see these inside the same file library filters.",
      placeholder: "Grade 12 chemistry formula image",
      descriptionPlaceholder: "Short description for the public website",
      accepted: "Accepted: JPG, PNG, WebP, GIF, and other image files.",
      action: hasResource ? "Save Changes" : "Upload Image File",
    };
  }

  return {
    eyebrow: "File upload",
    heading: hasResource ? "Edit file" : "Add file",
    copy: "Upload answer keys, formulas, exam papers, documents, presentations, spreadsheets, or e-books.",
    placeholder: "Grade 12 mathematics formula sheet",
    descriptionPlaceholder: "Short description for the public website",
    accepted: "Accepted: PDFs, documents, presentations, spreadsheets, text files, and e-books.",
    action: hasResource ? "Save Changes" : "Upload File",
  };
}

function createDefaultForm(mode = "file") {
  const uploadMode = normalizeUploadMode(mode);
  const isAudioMode = uploadMode === "audio";

  return {
    id: null,
    title: "",
    description: "",
    grade_level: "12",
    subject: isAudioMode ? AUDIO_SUBJECT : "Mathematics",
    category: "document",
    file_type: getFileTypeForMode(uploadMode),
    external_url: "",
    is_published: true,
    file: null,
  };
}

function createInitialState(resource, mode) {
  const uploadMode = normalizeUploadMode(mode);

  if (!resource) {
    return createDefaultForm(uploadMode);
  }

  const isAudioResource = resource.file_type === "audio" || uploadMode === "audio";
  const isPhotoResource =
    resource.file_type === "image" ||
    resource.file_type === "photo" ||
    uploadMode === "photo";

  return {
    id: resource.id,
    title: resource.title || "",
    description: resource.description || "",
    grade_level: String(resource.grade_level || 12),
    subject: isAudioResource ? AUDIO_SUBJECT : resource.subject || "Mathematics",
    category: isAudioResource ? "document" : normalizeCategoryId(resource.category) || "document",
    file_type: isAudioResource ? "audio" : isPhotoResource ? "image" : "document",
    external_url: resource.external_url || "",
    is_published: Boolean(resource.is_published),
    file: null,
  };
}

function FieldLabel({ children }) {
  return <span className="mb-2 block text-sm font-medium text-slate-700">{children}</span>;
}

export default function ResourceUploadForm({
  mode = "file",
  resource,
  onSubmit,
  onCancel,
  isSaving,
}) {
  const [formState, setFormState] = useState(() => createInitialState(resource, mode));
  const uploadMode = normalizeUploadMode(mode);
  const isAudioUpload = uploadMode === "audio";
  const subjectOptions = isAudioUpload
    ? [AUDIO_SUBJECT]
    : getSubjectsForGrade(formState.grade_level);
  const uploadFileType = getFileTypeForMode(uploadMode);
  const activeFileType =
    RESOURCE_FILE_TYPES.find((type) => type.value === uploadFileType) ||
    RESOURCE_FILE_TYPES[0];
  const modeText = getModeText(uploadMode, Boolean(resource));

  function updateField(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value,
      ...(isAudioUpload
        ? { subject: AUDIO_SUBJECT, category: "document" }
        : {}),
      ...(!isAudioUpload &&
      field === "grade_level" &&
      !getSubjectsForGrade(value).includes(current.subject)
        ? { subject: getSubjectsForGrade(value)[0] }
        : {}),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const wasSaved = await onSubmit({
      ...formState,
      grade_level: Number(formState.grade_level),
      subject: isAudioUpload ? AUDIO_SUBJECT : formState.subject,
      category: isAudioUpload ? "document" : formState.category,
      file_type: uploadFileType,
    });

    if (wasSaved && !resource) {
      setFormState(createDefaultForm(uploadMode));
    }
  }

  return (
    <Card>
      <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {modeText.eyebrow}
            </p>
            <h3 className="text-lg font-semibold text-slate-900">
              {modeText.heading}
            </h3>
          </div>
          <p className="mt-1 text-sm text-slate-500">{modeText.copy}</p>
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
            placeholder={modeText.placeholder}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
          />
        </label>

        <label className="block">
          <FieldLabel>Description</FieldLabel>
          <textarea
            rows="4"
            value={formState.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder={modeText.descriptionPlaceholder}
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
              {GRADE_OPTIONS.map((grade) => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <FieldLabel>Subject</FieldLabel>
            <select
              value={formState.subject}
              onChange={(event) => updateField("subject", event.target.value)}
              disabled={isAudioUpload}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
            >
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {getSubjectLabel(subject)}
                </option>
              ))}
            </select>
          </label>

          {isAudioUpload ? (
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 sm:col-span-2">
              <p className="text-xs leading-5 text-slate-500">
                Audio is published only to Khmer Literature story audio.
              </p>
            </div>
          ) : (
            <label className="block">
              <FieldLabel>Category</FieldLabel>
              <select
                value={formState.category}
                onChange={(event) => updateField("category", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
              >
                {RESOURCE_CATEGORIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {getCategoryLabel(option.value)}
                  </option>
                ))}
              </select>
            </label>
          )}
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
              accept={activeFileType.accept}
              onChange={(event) => updateField("file", event.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-600 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-primary-700"
            />
            <p className="mt-2 text-xs text-slate-500">
              {modeText.accepted}
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
              {modeText.action}
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
