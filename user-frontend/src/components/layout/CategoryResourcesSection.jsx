import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  FolderSearch,
  LoaderCircle,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  LIVE_DATA_REFRESH_MS,
  downloadResourceFile,
  fetchResources,
  resolveFileUrl,
  resolveResourceDownloadUrl,
  resolveResourceUrl,
} from "@/services/api";
import {
  GRADE_OPTIONS,
  RESOURCE_CATEGORIES,
  extractKhmerText,
  getSubjectLabel,
  inferResourceCategory,
  normalizeText,
} from "@/data/learningCatalog";
import Pagination from "@/components/Pagination";

const khmerCollator = new Intl.Collator("km", {
  numeric: true,
  sensitivity: "base",
});

const FILES_PER_PAGE = 8;

const sectionTextureStyle = {
  backgroundImage: `
    linear-gradient(to right, #d1d5db 1px, transparent 1px),
    linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
  `,
  backgroundSize: "32px 32px",
};

const sectionTextureLeftStyle = {
  ...sectionTextureStyle,
  WebkitMaskImage:
    "radial-gradient(ellipse 80% 80% at 0% 100%, #000 50%, transparent 90%)",
  maskImage:
    "radial-gradient(ellipse 80% 80% at 0% 100%, #000 50%, transparent 90%)",
};

const sectionTextureRightStyle = {
  ...sectionTextureStyle,
  WebkitMaskImage:
    "radial-gradient(ellipse 80% 80% at 100% 100%, #000 50%, transparent 90%)",
  maskImage:
    "radial-gradient(ellipse 80% 80% at 100% 100%, #000 50%, transparent 90%)",
};

const panelTextureStyle = {
  backgroundImage: `
    linear-gradient(to right, rgba(209,213,219,0.28) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(209,213,219,0.28) 1px, transparent 1px)
  `,
  backgroundSize: "24px 24px",
};

const CATEGORY_DEFINITIONS = RESOURCE_CATEGORIES;

function formatCreatedAt(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("km-KH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildSearchIndex(item) {
  return normalizeText(
    [
      item.rawTitle,
      item.rawDescription,
      item.title,
      item.description,
      extractKhmerText(item.title),
      extractKhmerText(item.description),
      item.category.labelKm,
      item.category.labelEn,
      item.subjectKm,
      item.subjectEn,
      item.gradeLabelKm,
      item.gradeLabelEn,
      item.file_type,
    ].join(" "),
  );
}

function toDisplayResource(resource, language = "km") {
  const category = inferResourceCategory(resource);

  if (!category) {
    return null;
  }

  const khmerTitle = extractKhmerText(resource.title);
  const subjectKm = getSubjectLabel(resource.subject, "km");
  const subjectEn = getSubjectLabel(resource.subject, "en");

  const title =
    language === "km"
      ? khmerTitle || resource.title
      : resource.title || khmerTitle || category.labelEn;

  const description =
    language === "km"
      ? extractKhmerText(resource.description) ||
        resource.description ||
        `ឯកសារ ${category.labelKm} ដែលបានបោះពុម្ពផ្សាយពីបណ្ណាល័យសិក្សា`
      : resource.description ||
        `${category.labelEn} published in the learning library.`;

  return {
    ...resource,
    category,
    rawTitle: resource.title || "",
    rawDescription: resource.description || "",
    title,
    description,
    subjectKm,
    subjectEn,
    gradeLabelKm: `ថ្នាក់ទី ${resource.grade_level}`,
    gradeLabelEn: `Grade ${resource.grade_level}`,
    createdAtLabel: formatCreatedAt(resource.created_at),
    downloadUrl: resolveResourceDownloadUrl(resource),
    openUrl: resolveResourceUrl(resource),
    thumbnailUrl: resource.thumbnail_path
      ? resolveFileUrl(resource.thumbnail_path)
      : resource.file_type === "image"
        ? resolveFileUrl(resource.file_path)
        : "",
    sortLabel: khmerTitle || category.labelKm,
  };
}

function ResourcePreview({ category, gradeLabel, thumbnailUrl, title }) {
  if (thumbnailUrl) {
    return (
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_12px_24px_rgba(15,23,42,0.08)] sm:h-16 sm:w-16 sm:rounded-[1.05rem] sm:shadow-[0_16px_36px_rgba(15,23,42,0.10)]">
        <img
          src={thumbnailUrl}
          alt={title}
          decoding="async"
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-1 py-1 text-[8px] font-semibold leading-none text-white sm:px-1.5 sm:py-1.5 sm:text-[9px]">
          {gradeLabel}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-gradient-to-br ${category.accent} shadow-[0_12px_24px_rgba(15,23,42,0.08)] sm:h-16 sm:w-16 sm:rounded-[1.05rem] sm:shadow-[0_16px_36px_rgba(15,23,42,0.10)]`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_46%)]" />
      <div className="absolute inset-1 rounded-lg border border-white/45 bg-white/18 backdrop-blur-sm sm:inset-1.5 sm:rounded-[0.75rem]" />
      <div className="relative flex h-full flex-col justify-between p-1.5 text-white sm:p-2">
        <span className="text-[8px] font-semibold leading-3 tracking-normal sm:text-[9px]">
          {gradeLabel}
        </span>
        <div className="space-y-1">
          <div className="h-1 w-7 rounded-full bg-white/80" />
          <div className="h-1 w-9 rounded-full bg-white/60" />
          <p className="text-[9px] font-bold leading-3 sm:text-[10px]">
            {category.labelKm}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CategoryResourcesSection({ language = "km" }) {
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isKhmer = language === "km";
  const errorMessage = hasError
    ? isKhmer
      ? "មិនអាចទាញយកឯកសារពី backend បានទេ។"
      : "Unable to load resources from the backend right now."
    : "";

  const loadResources = useCallback(
    async ({ signal, showLoading = false } = {}) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        const data = await fetchResources({}, { signal });

        if (signal?.aborted) {
          return;
        }

        setResources(Array.isArray(data) ? data : []);
        setHasError(false);
        setLoading(false);
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }

        if (showLoading) {
          setHasError(true);
          setResources([]);
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    let abortController = new AbortController();

    const refreshResources = (showLoading = false) => {
      abortController.abort();
      abortController = new AbortController();
      void loadResources({
        signal: abortController.signal,
        showLoading,
      });
    };

    refreshResources(true);

    const intervalId = window.setInterval(
      () => refreshResources(false),
      LIVE_DATA_REFRESH_MS,
    );
    const handleFocus = () => refreshResources(false);
    window.addEventListener("focus", handleFocus);

    return () => {
      abortController.abort();
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadResources]);

  const preparedResources = useMemo(() => {
    return resources
      .filter((resource) => resource.file_type !== "audio")
      .filter((resource) =>
        GRADE_OPTIONS.includes(Number(resource.grade_level)),
      )
      .map((resource) => toDisplayResource(resource, language))
      .filter(Boolean);
  }, [language, resources]);

  const categoryCounts = useMemo(() => {
    return CATEGORY_DEFINITIONS.reduce(
      (accumulator, category) => ({
        ...accumulator,
        [category.id]: preparedResources.filter(
          (resource) => resource.category.id === category.id,
        ).length,
      }),
      {},
    );
  }, [preparedResources]);

  const subjectOptions = useMemo(() => {
    return [...new Set(preparedResources.map((resource) => resource.subject))]
      .filter(Boolean)
      .sort((left, right) => khmerCollator.compare(left, right));
  }, [preparedResources]);

  const activeCategoryDefinition =
    CATEGORY_DEFINITIONS.find((category) => category.id === selectedCategory) ||
    null;
  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedGrade !== "all" ||
    selectedSubject !== "all" ||
    searchQuery.trim().length > 0;

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory((currentCategory) =>
      currentCategory === categoryId ? "all" : categoryId,
    );
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedGrade("all");
    setSelectedSubject("all");
    setSortOrder("newest");
    setCurrentPage(1);
  };

  const filteredResources = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);

    const nextResources = preparedResources.filter((resource) => {
      const matchesCategory =
        selectedCategory === "all" || resource.category.id === selectedCategory;
      const matchesGrade =
        selectedGrade === "all" ||
        Number(resource.grade_level) === Number(selectedGrade);
      const matchesSubject =
        selectedSubject === "all" || resource.subject === selectedSubject;
      const matchesQuery =
        !normalizedQuery ||
        buildSearchIndex(resource).includes(normalizedQuery);

      return matchesCategory && matchesGrade && matchesSubject && matchesQuery;
    });

    nextResources.sort((left, right) => {
      const leftTime = new Date(left.created_at || 0).getTime();
      const rightTime = new Date(right.created_at || 0).getTime();

      if (sortOrder === "oldest") {
        return (
          leftTime - rightTime ||
          khmerCollator.compare(left.sortLabel, right.sortLabel)
        );
      }

      if (sortOrder === "title") {
        return khmerCollator.compare(left.sortLabel, right.sortLabel);
      }

      return (
        rightTime - leftTime ||
        khmerCollator.compare(left.sortLabel, right.sortLabel)
      );
    });

    return nextResources;
  }, [
    preparedResources,
    searchQuery,
    selectedCategory,
    selectedGrade,
    selectedSubject,
    sortOrder,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredResources.length / FILES_PER_PAGE),
  );
  const activePage = Math.min(currentPage, totalPages);
  const paginatedResources = useMemo(() => {
    const startIndex = (activePage - 1) * FILES_PER_PAGE;
    return filteredResources.slice(startIndex, startIndex + FILES_PER_PAGE);
  }, [activePage, filteredResources]);
  const shouldShowPagination = filteredResources.length > FILES_PER_PAGE;

  const handleDownload = (event, resource) => {
    event.stopPropagation();
    void downloadResourceFile(resource);
  };

  return (
    <section
      id="resources"
      className="relative flex min-h-0 scroll-mt-24 overflow-hidden border-t border-black/10 bg-[#f9fafb] py-4 md:scroll-mt-24 md:py-5 lg:py-6"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={sectionTextureLeftStyle}
      />
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={sectionTextureRightStyle}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-16">
        <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl border border-black/10 bg-white/82 p-3 shadow-[0_28px_90px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-4 md:p-5">
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            style={panelTextureStyle}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/85 via-white/35 to-transparent" />

          <div className="relative mb-4 space-y-3 sm:space-y-4 lg:mb-6">
            <div className="rounded-2xl border border-black/10 bg-white/90 p-3 shadow-[0_14px_36px_rgba(15,23,42,0.04)] md:p-4">
              <div className="grid gap-3 md:gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(280px,1.1fr)_minmax(220px,0.8fr)] lg:items-center">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 lg:pr-4">
                  <p
                    className={`text-xs font-semibold text-black/42 ${
                      isKhmer ? "tracking-normal" : "uppercase tracking-[0.28em]"
                    }`}
                  >
                    {isKhmer ? "ប្រភេទ" : "Category"}
                  </p>
                  <h3 className="text-base font-bold text-black sm:text-lg md:text-xl">
                    {isKhmer
                      ? "ស្វែងរកតាមប្រភេទឯកសារ"
                      : "Browse by resource category"}
                  </h3>
                </div>

                <label className="relative block lg:mx-auto lg:w-full lg:max-w-xl">
                  <span
                    className={`mb-2 block text-xs font-semibold text-black/38 ${
                      isKhmer ? "tracking-normal" : "uppercase tracking-[0.22em]"
                    }`}
                  >
                    {isKhmer ? "ស្វែងរក" : "Search"}
                  </span>
                  <Search className="pointer-events-none absolute left-4 top-[calc(50%+0.65rem)] h-4 w-4 -translate-y-1/2 text-black/45" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder={
                      isKhmer
                        ? "ស្វែងរកឯកសារតាមចំណងជើង ឬមុខវិជ្ជា..."
                        : "Search by title, subject, or keyword..."
                    }
                    className="h-11 w-full rounded-xl border border-black/10 bg-[#fbfbfb] pl-11 pr-4 text-sm text-black outline-none transition-colors placeholder:text-black/40 focus:border-black/25 sm:h-12"
                  />
                </label>

                <label className="relative block w-full lg:ml-auto lg:max-w-[240px]">
                  <span
                    className={`mb-2 block text-xs font-semibold text-black/38 ${
                      isKhmer ? "tracking-normal" : "uppercase tracking-[0.22em]"
                    }`}
                  >
                    {isKhmer ? "ប្រភេទ" : "Category"}
                  </span>
                  <SlidersHorizontal className="pointer-events-none absolute left-4 top-[calc(50%+0.65rem)] h-4 w-4 -translate-y-1/2 text-black/45" />
                  <select
                    value={selectedCategory}
                    onChange={(event) => {
                      setSelectedCategory(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-11 w-full appearance-none rounded-xl border border-black/10 bg-[#fbfbfb] pl-11 pr-4 text-sm text-black outline-none transition-colors focus:border-black/25 sm:h-12"
                  >
                    <option value="all">
                      {isKhmer ? "ប្រភេទទាំងអស់" : "All categories"}
                    </option>
                    {CATEGORY_DEFINITIONS.map((category) => (
                      <option key={category.id} value={category.id}>
                        {isKhmer ? category.labelKm : category.labelEn}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/8 bg-[#f7f8f9] px-3 py-2.5 sm:px-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-black/55">
                <span className="rounded-full border border-black/8 bg-white px-3 py-1.5">
                  {isKhmer
                    ? `${filteredResources.length} ឯកសារដែលត្រូវនឹងការស្វែងរក`
                    : `${filteredResources.length} matching files`}
                </span>
                <span className="rounded-full border border-black/8 bg-white px-3 py-1.5">
                  {isKhmer
                    ? activeCategoryDefinition
                      ? `កំពុងមើល ${activeCategoryDefinition.labelKm}`
                      : "បង្ហាញគ្រប់ប្រភេទ"
                    : activeCategoryDefinition
                      ? `Viewing ${activeCategoryDefinition.labelEn}`
                      : "Showing all categories"}
                </span>
                <span className="rounded-full border border-black/8 bg-white px-3 py-1.5">
                  {sortOrder === "oldest"
                    ? isKhmer
                      ? "ចាស់ទៅថ្មី"
                      : "Oldest first"
                    : sortOrder === "title"
                      ? isKhmer
                        ? "តាមចំណងជើង"
                        : "Title A-Z"
                      : isKhmer
                        ? "ថ្មីទៅចាស់"
                        : "Newest first"}
                </span>
              </div>

              <div className="flex w-full flex-wrap items-center justify-stretch gap-3 sm:w-auto sm:justify-end">
                <label className="relative block w-full sm:w-[190px]">
                  <select
                    value={selectedGrade}
                    onChange={(event) => {
                      setSelectedGrade(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-11 w-full appearance-none rounded-full border border-black/10 bg-white px-4 text-sm text-black outline-none transition-colors focus:border-black/25"
                  >
                    <option value="all">
                      {isKhmer ? "ថ្នាក់ទាំងអស់" : "All grades"}
                    </option>
                    {GRADE_OPTIONS.map((grade) => (
                      <option key={grade} value={grade}>
                        {isKhmer ? `ថ្នាក់ទី ${grade}` : `Grade ${grade}`}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="relative block w-full sm:w-[240px]">
                  <select
                    value={selectedSubject}
                    onChange={(event) => {
                      setSelectedSubject(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-11 w-full appearance-none rounded-full border border-black/10 bg-white px-4 text-sm text-black outline-none transition-colors focus:border-black/25"
                  >
                    <option value="all">
                      {isKhmer ? "មុខវិជ្ជាទាំងអស់" : "All subjects"}
                    </option>
                    {subjectOptions.map((subject) => (
                      <option key={subject} value={subject}>
                        {getSubjectLabel(subject, language)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="relative block w-full sm:w-[190px]">
                  <select
                    value={sortOrder}
                    onChange={(event) => {
                      setSortOrder(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-11 w-full appearance-none rounded-full border border-black/10 bg-white px-4 text-sm text-black outline-none transition-colors focus:border-black/25"
                  >
                    <option value="newest">{isKhmer ? "ថ្មីទៅចាស់" : "Newest first"}</option>
                    <option value="oldest">{isKhmer ? "ចាស់ទៅថ្មី" : "Oldest first"}</option>
                    <option value="title">{isKhmer ? "តាមចំណងជើង" : "Title A-Z"}</option>
                  </select>
                </label>

                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-black/70 transition-colors hover:border-black/20 hover:text-black"
                  >
                    {isKhmer ? "សម្អាត" : "Clear"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="relative flex flex-1 min-h-0 flex-col gap-6">
            <div className="hidden gap-3 lg:grid xl:grid-cols-5">
              {CATEGORY_DEFINITIONS.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category.id)}
                  className={`group rounded-xl border px-3 py-3 text-left transition-all duration-300 ${
                    selectedCategory === category.id
                      ? "border-black bg-black text-white shadow-[0_14px_34px_rgba(15,23,42,0.10)]"
                      : "border-black/10 bg-white/92 text-black shadow-[0_8px_24px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:border-black/20 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold md:text-base">
                        {isKhmer ? category.labelKm : category.labelEn}
                      </p>
                      <p
                        className={`mt-1 text-xs ${
                          selectedCategory === category.id
                            ? "text-white/75"
                            : "text-black/55"
                        }`}
                      >
                        {isKhmer
                          ? `${categoryCounts[category.id] || 0} ឯកសារ`
                          : category.labelEn}
                      </p>
                    </div>
                    <span
                      className={`mt-1 h-2.5 w-2.5 rounded-full transition-colors ${
                        selectedCategory === category.id
                          ? "bg-white"
                          : "bg-black/15 group-hover:bg-black/30"
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/70 p-3 shadow-[0_14px_38px_rgba(15,23,42,0.04)] md:p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-black/8 pb-3">
                <div>
                  <h4 className="text-base font-bold text-black md:text-lg">
                    {isKhmer
                      ? "ឯកសារពីបណ្ណាល័យសិក្សា"
                      : "Files from the learning library"}
                  </h4>
                  <p className="mt-1 text-sm text-black/55">
                    {sortOrder === "oldest"
                      ? isKhmer
                        ? "បញ្ជីឯកសារត្រូវបានរៀបពីចាស់ទៅថ្មី ហើយអាចបើកឬទាញយកបានភ្លាមៗ។"
                        : "Resources are sorted from oldest to newest and can be opened right away."
                      : sortOrder === "title"
                        ? isKhmer
                          ? "បញ្ជីឯកសារត្រូវបានរៀបតាមចំណងជើង ហើយអាចបើកឬទាញយកបានភ្លាមៗ។"
                          : "Resources are sorted by title and can be opened right away."
                        : isKhmer
                          ? "បញ្ជីឯកសារត្រូវបានរៀបតាមថ្ងៃបន្ថែមថ្មីបំផុត ហើយអាចបើកឬទាញយកបានភ្លាមៗ។"
                          : "Resources are sorted from newest to oldest and can be opened right away."}
                  </p>
                </div>
                <span className="rounded-full border border-black/8 bg-[#f7f8f9] px-3 py-1.5 text-sm font-medium text-black/60">
                  {isKhmer
                    ? `${filteredResources.length} ឯកសារ`
                    : `${filteredResources.length} files`}
                </span>
              </div>

              <div className="grid gap-3 overflow-x-hidden lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-2">
                {loading &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex gap-3 rounded-2xl border border-black/10 bg-white/94 p-3 shadow-[0_10px_28px_rgba(15,23,42,0.04)] sm:items-center"
                    >
                      <div className="h-14 w-14 shrink-0 animate-pulse rounded-[0.9rem] bg-black/8 sm:h-16 sm:w-16 sm:rounded-[1.05rem]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-28 animate-pulse rounded-full bg-black/8" />
                        <div className="h-5 w-2/3 animate-pulse rounded-full bg-black/8" />
                        <div className="h-3 w-full animate-pulse rounded-full bg-black/8" />
                      </div>
                    </div>
                  ))}

                {!loading && hasError && (
                  <div className="rounded-[1.8rem] border border-red-200/80 bg-[rgba(254,242,242,0.92)] p-6 text-sm leading-7 text-red-700 shadow-[0_14px_36px_rgba(185,28,28,0.06)]">
                    <p>{errorMessage}</p>
                  </div>
                )}

                {!loading && !hasError && filteredResources.length === 0 && (
                  <div className="rounded-[1.9rem] border border-dashed border-black/15 bg-white/92 p-8 text-center shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                    <FolderSearch className="mx-auto h-10 w-10 text-black/35" />
                    <h3 className="mt-4 text-xl font-bold text-black">
                      {isKhmer
                        ? "មិនទាន់មានឯកសារដែលត្រូវនឹងការស្វែងរក"
                        : "No matching files yet"}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-black/60">
                      {isKhmer
                        ? "បច្ចុប្បន្ននេះមិនទាន់មានឯកសារដែលត្រូវនឹងការតម្រៀបនៅឡើយទេ។ នៅពេល admin បន្ថែមទិន្នន័យថ្មី វានឹងបង្ហាញនៅទីនេះ។"
                        : "There are no matching resources yet. As soon as the admin publishes new content, it will appear here."}
                    </p>
                  </div>
                )}

                {!loading &&
                  !hasError &&
                  paginatedResources.map((resource) => (
                    <article
                      key={resource.id}
                      className="relative cursor-pointer rounded-xl border border-black/10 bg-white p-2 shadow-[0_8px_22px_rgba(15,23,42,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:border-black/15 hover:shadow-[0_16px_38px_rgba(15,23,42,0.07)] sm:rounded-2xl sm:p-3 sm:shadow-[0_10px_28px_rgba(15,23,42,0.04)]"
                    >
                      {resource.openUrl ? (
                        <a
                          href={resource.openUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${resource.title}`}
                          className="absolute inset-0 z-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/15 sm:rounded-2xl"
                        />
                      ) : null}

                      <div className="pointer-events-none relative z-10 flex flex-row items-start gap-2.5 sm:gap-3">
                        <ResourcePreview
                          category={resource.category}
                          gradeLabel={
                            isKhmer
                              ? resource.gradeLabelKm
                              : resource.gradeLabelEn
                          }
                          thumbnailUrl={resource.thumbnailUrl}
                          title={resource.title}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                            <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold leading-4 text-white shadow-sm sm:px-2.5 sm:text-[11px]">
                              {isKhmer
                                ? resource.category.labelKm
                                : resource.category.labelEn}
                            </span>
                            <span className="rounded-full border border-black/8 bg-[#f5f6f7] px-2 py-0.5 text-[10px] font-medium leading-4 text-black/65 sm:px-2.5 sm:text-[11px]">
                              {isKhmer
                                ? resource.subjectKm
                                : resource.subjectEn}
                            </span>
                            <span className="rounded-full border border-black/8 bg-[#f5f6f7] px-2 py-0.5 text-[10px] font-medium leading-4 text-black/65 sm:px-2.5 sm:text-[11px]">
                              {isKhmer
                                ? resource.gradeLabelKm
                                : resource.gradeLabelEn}
                            </span>
                            <span className="rounded-full border border-black/8 bg-[#f5f6f7] px-2 py-0.5 text-[10px] font-medium leading-4 text-black/65 sm:px-2.5 sm:text-[11px]">
                              {resource.file_type === "image"
                                ? isKhmer
                                  ? "រូបភាព"
                                  : "Image"
                                : isKhmer
                                  ? "ឯកសារ"
                                  : "File"}
                            </span>
                          </div>

                          <h3 className="mt-1.5 text-[13px] font-bold leading-snug text-black sm:mt-2 sm:text-base">
                            {resource.title}
                          </h3>
                          <p className="mt-0.5 line-clamp-1 max-w-4xl text-[11px] leading-4 text-black/65 sm:mt-1 sm:line-clamp-2 sm:text-sm sm:leading-5">
                            {resource.description}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
                            {resource.downloadUrl ? (
                              <button
                                type="button"
                                onClick={(event) => handleDownload(event, resource)}
                                className="pointer-events-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-black px-2.5 py-1 text-[11px] font-semibold text-black transition-colors hover:bg-black hover:text-white sm:min-w-[116px] sm:px-3 sm:py-1.5 sm:text-xs"
                              >
                                <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                Download
                              </button>
                            ) : null}
                            {resource.createdAtLabel && (
                              <span className="text-[10px] font-medium text-black/45 sm:text-xs">
                                {isKhmer
                                  ? `បានបន្ថែម ${resource.createdAtLabel}`
                                  : `Added ${resource.createdAtLabel}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
              </div>

              {!loading && !hasError && shouldShowPagination ? (
                <div className="mt-5 border-t border-black/8 pt-4">
                  <Pagination
                    page={activePage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              ) : null}

              {loading && (
                <div className="flex items-center justify-center gap-2 text-sm text-black/50">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  {isKhmer
                    ? "កំពុងទាញយកឯកសារ..."
                    : "Loading resources..."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
