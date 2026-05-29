import React, { useCallback, useId, useRef, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { FileCheck2, FilePlus2, Save, UploadCloud, X } from "lucide-react";
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

const FILE_SIZES = ["Bytes", "KB", "MB", "GB", "TB"];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) {
    return "0 Bytes";
  }

  const sizeStep = 1024;
  const digits = decimals < 0 ? 0 : decimals;
  const index = Math.floor(Math.log(bytes) / Math.log(sizeStep));
  const unit = FILE_SIZES[index] || FILE_SIZES[FILE_SIZES.length - 1];

  return `${Number.parseFloat((bytes / sizeStep ** index).toFixed(digits))} ${unit}`;
}

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
    image: null,
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
    image: null,
  };
}

function FieldLabel({ children }) {
  return <span className="mb-2 block text-sm font-medium text-slate-700">{children}</span>;
}

function UploadIllustration() {
  return (
    <div className="relative h-16 w-16">
      <svg
        aria-label="Upload illustration"
        className="h-full w-full"
        fill="none"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Upload File Illustration</title>
        <circle
          className="stroke-slate-200"
          cx="50"
          cy="50"
          r="45"
          strokeDasharray="4 4"
          strokeWidth="2"
        >
          <animateTransform
            attributeName="transform"
            dur="60s"
            from="0 50 50"
            repeatCount="indefinite"
            to="360 50 50"
            type="rotate"
          />
        </circle>
        <path
          className="fill-primary-50 stroke-primary-500"
          d="M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z"
          strokeWidth="2"
        />
        <path
          className="stroke-primary-500"
          d="M30 35C30 35 35 35 40 35C45 35 45 30 50 30C55 30 55 35 60 35C65 35 70 35 70 35"
          fill="none"
          strokeWidth="2"
        />
        <g className="translate-y-2 transform">
          <line
            className="stroke-primary-500"
            strokeLinecap="round"
            strokeWidth="2"
            x1="50"
            x2="50"
            y1="45"
            y2="60"
          />
          <polyline
            className="stroke-primary-500"
            fill="none"
            points="42,52 50,45 58,52"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function FileDropzone({
  accept = "",
  file = null,
  label,
  helperText,
  multiple = false,
  buttonText = "Upload File",
  onFileSelect,
  onFileRemove,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputId = useId();
  const fileInputRef = useRef(null);
  const selectedFiles = Array.isArray(file) ? file : file ? [file] : [];
  const selectedFileCount = selectedFiles.length;
  const totalSelectedSize = selectedFiles.reduce(
    (total, selectedFile) => total + (selectedFile?.size || 0),
    0,
  );

  const triggerFileInput = useCallback(() => {
    const fileInput = fileInputRef.current;

    if (!fileInput) {
      return;
    }

    try {
      if (typeof fileInput.showPicker === "function") {
        fileInput.showPicker();
        return;
      }
    } catch {
      // Some browsers expose showPicker but block it in edge cases; click is the fallback.
    }

    fileInput.click();
  }, []);

  const handleFileSelect = useCallback(
    (selectedFileList) => {
      const files = Array.from(selectedFileList || []).filter(Boolean);

      if (!files.length) {
        return;
      }

      onFileSelect(multiple ? files : files[0]);
      setIsDragging(false);
    },
    [multiple, onFileSelect],
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      handleFileSelect(event.dataTransfer.files || null);
    },
    [handleFileSelect],
  );

  const handleInputChange = useCallback(
    (event) => {
      handleFileSelect(event.target.files || null);
      event.target.value = "";
    },
    [handleFileSelect],
  );

  return (
    <div
      aria-label={label}
      className="group relative w-full rounded-xl bg-white p-0.5 ring-1 ring-slate-200"
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="complementary"
    >
      <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-primary-500/25 to-transparent" />

      <div className="relative rounded-[10px] bg-slate-50/80 p-1.5">
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border border-slate-100 bg-white transition-colors",
            isDragging && "border-primary-300 bg-primary-50/60",
          )}
        >
          <div
            className={cn(
              "pointer-events-none absolute inset-0 transition-opacity duration-300",
              isDragging ? "opacity-100" : "opacity-0",
            )}
          >
            <div className="absolute inset-x-0 top-0 h-[20%] bg-gradient-to-b from-primary-500/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-t from-primary-500/10 to-transparent" />
            <div className="absolute inset-y-0 left-0 w-[20%] bg-gradient-to-r from-primary-500/10 to-transparent" />
            <div className="absolute inset-y-0 right-0 w-[20%] bg-gradient-to-l from-primary-500/10 to-transparent" />
            <div className="absolute inset-[20%] animate-pulse rounded-lg bg-primary-500/5" />
          </div>

          <input
            accept={accept}
            aria-label={label}
            className="sr-only"
            id={inputId}
            multiple={multiple}
            onChange={handleInputChange}
            ref={fileInputRef}
            type="file"
          />

          <div className="relative min-h-[220px]">
            <AnimatePresence mode="wait">
              {selectedFileCount ? (
                <Motion.div
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                  exit={{ opacity: 0, scale: 0.96 }}
                  initial={{ opacity: 0, scale: 0.96 }}
                  key="selected"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                    <FileCheck2 className="h-8 w-8" />
                  </div>
                  <h3 className="max-w-full truncate text-sm font-semibold text-slate-900">
                    {selectedFileCount === 1
                      ? selectedFiles[0].name
                      : `${selectedFileCount} files selected`}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatBytes(totalSelectedSize)} selected
                  </p>
                  {selectedFileCount > 1 ? (
                    <div className="mt-3 grid max-h-20 w-full max-w-xs gap-1 overflow-hidden text-left">
                      {selectedFiles.slice(0, 4).map((selectedFile) => (
                        <p
                          className="truncate rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-500"
                          key={`${selectedFile.name}-${selectedFile.size}-${selectedFile.lastModified}`}
                        >
                          {selectedFile.name}
                        </p>
                      ))}
                      {selectedFileCount > 4 ? (
                        <p className="px-2 text-xs font-medium text-slate-500">
                          +{selectedFileCount - 4} more
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="mt-5 flex w-full max-w-xs gap-2">
                    <button
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                      onClick={triggerFileInput}
                      type="button"
                    >
                      Replace
                      <UploadCloud className="h-4 w-4" />
                    </button>
                    <button
                      aria-label="Remove selected file"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:text-red-600"
                      onClick={onFileRemove}
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </Motion.div>
              ) : (
                <Motion.div
                  animate={{
                    opacity: isDragging ? 0.86 : 1,
                    y: 0,
                    scale: isDragging ? 0.98 : 1,
                  }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                  exit={{ opacity: 0, y: -10 }}
                  initial={{ opacity: 0, y: 10 }}
                  key="dropzone"
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-4">
                    <UploadIllustration />
                  </div>

                  <div className="mb-4 space-y-1.5">
                    <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                      Drag and drop or
                    </h3>
                    <p className="text-xs leading-5 text-slate-500">
                      {helperText}
                    </p>
                  </div>

                  <button
                    className="group/upload flex w-4/5 items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                    onClick={triggerFileInput}
                    type="button"
                  >
                    <span>{buttonText}</span>
                    <UploadCloud className="h-4 w-4 transition-transform duration-200 group-hover/upload:scale-110" />
                  </button>

                  <p className="mt-3 text-xs text-slate-500">
                    {multiple
                      ? "or drag and drop your files here"
                      : "or drag and drop your file here"}
                  </p>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResourceUploadForm({
  mode = "file",
  resource,
  onSubmit,
  onCancel,
  isSaving,
  errorMessage = "",
}) {
  const [formState, setFormState] = useState(() => createInitialState(resource, mode));
  const [localError, setLocalError] = useState("");
  const uploadMode = normalizeUploadMode(mode);
  const isAudioUpload = uploadMode === "audio";
  const subjectOptions = isAudioUpload
    ? [AUDIO_SUBJECT]
    : getSubjectsForGrade(formState.grade_level);
  const uploadFileType = getFileTypeForMode(uploadMode);
  const supportsPreviewImage = uploadMode === "file" || uploadMode === "audio";
  const activeFileType =
    RESOURCE_FILE_TYPES.find((type) => type.value === uploadFileType) ||
    RESOURCE_FILE_TYPES[0];
  const modeText = getModeText(uploadMode, Boolean(resource));

  function updateField(field, value) {
    setLocalError("");
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

    const hasSelectedFile = Array.isArray(formState.file)
      ? formState.file.length > 0
      : formState.file instanceof File;
    const hasExternalUrl = Boolean(String(formState.external_url || "").trim());

    if (!resource && !hasSelectedFile && !hasExternalUrl) {
      setLocalError("Choose a file or enter an external URL before uploading.");
      return;
    }

    const wasSaved = await onSubmit({
      ...formState,
      grade_level: Number(formState.grade_level),
      subject: isAudioUpload ? AUDIO_SUBJECT : formState.subject,
      category: isAudioUpload ? "document" : formState.category,
      file_type: uploadFileType,
    });

    if (wasSaved && !resource) {
      setFormState(createDefaultForm(uploadMode));
      setLocalError("");
    }
  }

  const visibleError = localError || errorMessage;

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

        <div className="block">
          <FieldLabel>{resource ? "Replace uploaded file" : "Upload file"}</FieldLabel>
          <FileDropzone
            accept={activeFileType.accept}
            buttonText={resource ? "Replace File" : modeText.action}
            file={formState.file}
            helperText={
              uploadMode === "photo" && !resource
                ? "Select or drag several images to combine them into one PDF file for students."
                : modeText.accepted
            }
            label={resource ? "Replace uploaded file" : "Upload file"}
            multiple={uploadMode === "photo" && !resource}
            onFileRemove={() => updateField("file", null)}
            onFileSelect={(file) => updateField("file", file)}
          />
        </div>

        {supportsPreviewImage ? (
          <div className="block">
            <FieldLabel>{resource?.thumbnail_path ? "Replace preview image" : "Preview image (optional)"}</FieldLabel>
            <FileDropzone
              accept="image/*"
              buttonText={resource?.thumbnail_path ? "Replace Image" : "Upload Image"}
              file={formState.image}
              helperText={
                isAudioUpload
                  ? "Optional JPG, PNG, WebP, GIF, or AVIF cover image shown on the student audio cards."
                  : "Optional JPG, PNG, WebP, GIF, or AVIF cover image shown on the student file cards."
              }
              label={
                resource?.thumbnail_path
                  ? "Replace preview image"
                  : "Preview image optional"
              }
              onFileRemove={() => updateField("image", null)}
              onFileSelect={(file) => updateField("image", file)}
            />
          </div>
        ) : null}

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

        {visibleError ? (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            role="alert"
          >
            {visibleError}
          </div>
        ) : null}

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
