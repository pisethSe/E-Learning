import React, { useMemo, useState } from "react";
import { ExternalLink, Eye, Filter, Pencil, Search, Trash2 } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { resolveAdminResourcePreviewUrl, resolveAssetUrl } from "../../services/api";
import {
  GRADE_OPTIONS,
  RESOURCE_CATEGORIES,
  getAllSubjects,
  getCategoryLabel,
  getSubjectLabel,
  getSubjectsForGrade,
  normalizeCategoryId,
} from "../../data/learningCatalog";

function getSourceLink(resource) {
  if (resource.id) {
    return resolveAdminResourcePreviewUrl(resource);
  }

  const externalUrl = String(resource.external_url || "").trim();

  if (externalUrl) {
    if (/^([a-z][a-z\d+\-.]*:)?\/\//i.test(externalUrl) || externalUrl.startsWith("/")) {
      return externalUrl;
    }

    return `https://${externalUrl}`;
  }

  return resolveAssetUrl(resource.file_path);
}

function normalizeTableMode(mode = "file") {
  if (mode === "audio") {
    return "audio";
  }

  if (mode === "photo" || mode === "image") {
    return "photo";
  }

  return "file";
}

function isPhotoResource(resource) {
  if (!resource) {
    return false;
  }

  return resource.file_type === "image" || resource.file_type === "photo";
}

function getResourceScope(resource, mode) {
  const tableMode = normalizeTableMode(mode);

  if (tableMode === "audio") {
    return resource.file_type === "audio";
  }

  if (tableMode === "photo") {
    return isPhotoResource(resource);
  }

  return resource.file_type !== "audio" && !isPhotoResource(resource);
}

function formatDate(value) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function ResourceTable({
  mode = "file",
  resources,
  onEdit,
  onDelete,
  isLoading,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const tableMode = normalizeTableMode(mode);
  const isAudioMode = tableMode === "audio";
  const isPhotoMode = tableMode === "photo";

  const scopedResources = useMemo(
    () =>
      (resources || []).filter((resource) => getResourceScope(resource, tableMode)),
    [resources, tableMode],
  );

  const subjectOptions = useMemo(() => {
    if (isAudioMode) {
      return [...new Set(scopedResources.map((resource) => resource.subject))]
        .filter(Boolean)
        .sort();
    }

    if (selectedGrade !== "all") {
      return getSubjectsForGrade(selectedGrade);
    }

    return getAllSubjects();
  }, [isAudioMode, scopedResources, selectedGrade]);

  const filteredResources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedResources
      .filter((resource) => {
        const matchesSearch =
          !query ||
          [
            resource.title,
            resource.description,
            resource.subject,
            resource.category,
            resource.original_filename,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query);
        const matchesGrade =
          selectedGrade === "all" ||
          Number(resource.grade_level) === Number(selectedGrade);
        const matchesSubject =
          selectedSubject === "all" || resource.subject === selectedSubject;
        const matchesCategory =
          isAudioMode ||
          selectedCategory === "all" ||
          normalizeCategoryId(resource.category) === selectedCategory;
        const matchesStatus =
          selectedStatus === "all" ||
          (selectedStatus === "published"
            ? resource.is_published
            : !resource.is_published);

        return (
          matchesSearch &&
          matchesGrade &&
          matchesSubject &&
          matchesCategory &&
          matchesStatus
        );
      })
      .sort((left, right) => {
        const leftTime = new Date(left.created_at || 0).getTime();
        const rightTime = new Date(right.created_at || 0).getTime();
        return rightTime - leftTime;
      });
  }, [
    isAudioMode,
    scopedResources,
    searchQuery,
    selectedCategory,
    selectedGrade,
    selectedStatus,
    selectedSubject,
  ]);

  const liveCount = scopedResources.filter((resource) => resource.is_published).length;
  const title = isAudioMode
    ? "Khmer Literature audio"
    : isPhotoMode
      ? "image file library"
      : "file library";
  const emptyCopy = isAudioMode
    ? "No Khmer Literature audio uploaded yet."
    : isPhotoMode
      ? "No image files uploaded yet."
      : "No files uploaded yet.";
  const eyebrow = isAudioMode
    ? "Audio library"
    : isPhotoMode
      ? "Image file library"
      : "File library";
  const searchPlaceholder = isAudioMode
    ? "Search audio stories..."
    : isPhotoMode
      ? "Search image files..."
      : "Search files...";

  function handleView(resource) {
    const sourceLink = getSourceLink(resource);

    if (!sourceLink) {
      return;
    }

    const openedWindow = window.open(sourceLink, "_blank", "noopener,noreferrer");

    if (!openedWindow) {
      window.location.assign(sourceLink);
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {eyebrow}
            </p>
            <h3 className="text-lg font-semibold text-slate-900">
              {filteredResources.length} of {scopedResources.length} {title.toLowerCase()} items
            </h3>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Filter by grade, subject, category, and publishing status.
          </p>
        </div>
        <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          {liveCount} live
        </span>
      </div>

      <div className="grid gap-3 border-b border-slate-200 bg-slate-50/70 px-6 py-4 lg:grid-cols-[minmax(220px,1fr)_repeat(4,minmax(150px,180px))]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
          />
        </label>

        <label className="relative block">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedGrade}
            onChange={(event) => {
              setSelectedGrade(event.target.value);
              setSelectedSubject("all");
            }}
            className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All grades</option>
            {GRADE_OPTIONS.map((grade) => (
              <option key={grade} value={grade}>
                Grade {grade}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <select
            value={selectedSubject}
            onChange={(event) => setSelectedSubject(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All subjects</option>
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {getSubjectLabel(subject)}
              </option>
            ))}
          </select>
        </label>

        {!isAudioMode ? (
          <label className="block">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All categories</option>
              {RESOURCE_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.labelEn}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block">
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </label>
      </div>

      {isLoading ? (
        <div className="px-6 py-10 text-sm text-slate-500">Loading resources...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Grade</th>
                <th className="px-6 py-3 font-medium">Subject</th>
                <th className="px-6 py-3 font-medium">Created</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Open</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(filteredResources.length ? filteredResources : [{ id: "empty" }]).map((resource) => {
                if (resource.id === "empty") {
                  return (
                    <tr key="empty">
                      <td colSpan="8" className="px-6 py-10 text-center text-slate-500">
                        {emptyCopy}
                      </td>
                    </tr>
                  );
                }

                const sourceLink = getSourceLink(resource);
                const categoryLabel = isAudioMode
                  ? "Story audio"
                  : getCategoryLabel(resource.category);

                return (
                  <tr key={resource.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{resource.title}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {isPhotoResource(resource) ? "Image file upload" : categoryLabel}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {categoryLabel}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{resource.grade_level}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {getSubjectLabel(resource.subject)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(resource.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                          resource.is_published
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {resource.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {sourceLink ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-primary-600 hover:bg-primary-50 hover:text-primary-700"
                          onClick={() => handleView(resource)}
                        >
                          <Eye size={15} />
                          View
                          <ExternalLink size={14} />
                        </Button>
                      ) : (
                        <span className="text-slate-400">No file</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => onEdit(resource)}
                        >
                          <Pencil size={14} />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => onDelete(resource)}
                        >
                          <Trash2 size={14} />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
