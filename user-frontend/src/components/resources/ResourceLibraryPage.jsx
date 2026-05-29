import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Download,
  FileText,
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
  getAllSubjects,
  getCategoryMeta,
  getSubjectLabel,
  getSubjectsForGrade,
  inferResourceCategory,
  normalizeCategoryId,
  normalizeText,
} from "@/data/learningCatalog";

const khmerCollator = new Intl.Collator("km", {
  numeric: true,
  sensitivity: "base",
});

function formatCreatedAt(value, language = "km") {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(language === "km" ? "km-KH" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildSearchIndex(resource) {
  return normalizeText(
    [
      resource.title,
      resource.description,
      resource.original_filename,
      resource.subject,
      resource.subjectLabel,
      resource.category.labelKm,
      resource.category.labelEn,
      resource.gradeLabel,
      resource.file_type,
    ].join(" "),
  );
}

function toDisplayResource(resource, language) {
  const category = inferResourceCategory(resource);

  return {
    ...resource,
    category,
    downloadUrl: resolveResourceDownloadUrl(resource),
    openUrl: resolveResourceUrl(resource),
    thumbnailUrl: resource.thumbnail_path
      ? resolveFileUrl(resource.thumbnail_path)
      : resource.file_type === "image"
        ? resolveFileUrl(resource.file_path)
        : "",
    subjectLabel: getSubjectLabel(resource.subject, language),
    gradeLabel:
      language === "km"
        ? `ថ្នាក់ទី ${resource.grade_level}`
        : `Grade ${resource.grade_level}`,
    createdAtLabel: formatCreatedAt(resource.created_at, language),
  };
}

function ResourceThumb({ resource }) {
  if (resource.thumbnailUrl) {
    return (
      <img
        src={resource.thumbnailUrl}
        alt={resource.title}
        loading="lazy"
        decoding="async"
        className="h-14 w-14 rounded-[0.9rem] border border-black/10 object-cover shadow-[0_14px_34px_rgba(15,23,42,0.08)] sm:h-16 sm:w-16 sm:rounded-[1.05rem]"
      />
    );
  }

  return (
    <div
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[0.9rem] border border-black/10 bg-gradient-to-br ${resource.category.accent} text-white shadow-[0_14px_34px_rgba(15,23,42,0.08)] sm:h-16 sm:w-16 sm:rounded-[1.05rem]`}
    >
      <FileText className="h-6 w-6" />
    </div>
  );
}

export default function ResourceLibraryPage({
  language = "km",
  fixedGrade,
  fixedSubject,
  initialQuery = "",
  eyebrow,
  title,
  description,
}) {
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isKhmer = language === "km";

  const loadResources = useCallback(
    async ({ signal, showLoading = false } = {}) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        const params = {
          grade: fixedGrade,
          subject: fixedSubject,
        };
        const data = await fetchResources(params, { signal });

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
    [fixedGrade, fixedSubject],
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
      .map((resource) => toDisplayResource(resource, language));
  }, [language, resources]);

  const subjectOptions = useMemo(() => {
    if (fixedSubject) {
      return [];
    }

    if (fixedGrade || selectedGrade !== "all") {
      return getSubjectsForGrade(fixedGrade || selectedGrade);
    }

    return getAllSubjects();
  }, [fixedGrade, fixedSubject, selectedGrade]);

  const effectiveSelectedSubject =
    selectedSubject !== "all" &&
    subjectOptions.length > 0 &&
    !subjectOptions.includes(selectedSubject)
      ? "all"
      : selectedSubject;

  const filteredResources = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);

    return preparedResources
      .filter((resource) => {
        const matchesGrade =
          fixedGrade ||
          selectedGrade === "all" ||
          Number(resource.grade_level) === Number(selectedGrade);
        const matchesSubject =
          fixedSubject ||
          effectiveSelectedSubject === "all" ||
          resource.subject === effectiveSelectedSubject;
        const matchesCategory =
          selectedCategory === "all" ||
          normalizeCategoryId(resource.category.id) === selectedCategory;
        const matchesQuery =
          !normalizedQuery || buildSearchIndex(resource).includes(normalizedQuery);

        return matchesGrade && matchesSubject && matchesCategory && matchesQuery;
      })
      .sort((left, right) => {
        const leftTime = new Date(left.created_at || 0).getTime();
        const rightTime = new Date(right.created_at || 0).getTime();

        if (sortOrder === "oldest") {
          return leftTime - rightTime || khmerCollator.compare(left.title, right.title);
        }

        if (sortOrder === "title") {
          return khmerCollator.compare(left.title, right.title);
        }

        return rightTime - leftTime || khmerCollator.compare(left.title, right.title);
      });
  }, [
    fixedGrade,
    fixedSubject,
    preparedResources,
    searchQuery,
    selectedCategory,
    effectiveSelectedSubject,
    selectedGrade,
    sortOrder,
  ]);

  const activeCategory =
    selectedCategory === "all" ? null : getCategoryMeta(selectedCategory);

  const resetFilters = () => {
    setSearchQuery(initialQuery);
    setSelectedGrade("all");
    setSelectedSubject("all");
    setSelectedCategory("all");
    setSortOrder("newest");
  };

  const handleDownload = (event, resource) => {
    event.stopPropagation();
    void downloadResourceFile(resource);
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-12 pt-28 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <div className="relative mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[1.6rem] border border-black/10 bg-white/88 shadow-[0_28px_90px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:rounded-[2rem]">
          <div className="border-b border-black/10 px-5 py-7 sm:px-7 lg:px-10">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-end">
              <div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black/55 shadow-sm ${
                    isKhmer ? "tracking-normal" : "uppercase tracking-[0.24em]"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  {eyebrow || (isKhmer ? "បណ្ណាល័យឯកសារ" : "Resource library")}
                </div>
                <h1 className="mt-5 text-3xl font-bold leading-tight text-black md:text-4xl lg:text-5xl">
                  {title}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-black/65 md:text-lg">
                  {description}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div className="rounded-2xl border border-black/10 bg-white/92 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                  <p
                    className={`text-xs font-semibold text-black/45 ${
                      isKhmer ? "tracking-normal" : "uppercase tracking-[0.18em]"
                    }`}
                  >
                    {isKhmer ? "លទ្ធផល" : "Results"}
                  </p>
                  <p className="mt-3 text-3xl font-bold text-black">
                    {loading ? "--" : filteredResources.length}
                  </p>
                  <p className="mt-1 text-sm text-black/55">
                    {isKhmer ? "ឯកសារ" : "files"}
                  </p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white/92 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                  <p
                    className={`text-xs font-semibold text-black/45 ${
                      isKhmer ? "tracking-normal" : "uppercase tracking-[0.18em]"
                    }`}
                  >
                    {isKhmer ? "ប្រភេទ" : "Category"}
                  </p>
                  <p className="mt-3 text-lg font-bold text-black">
                    {activeCategory
                      ? isKhmer
                        ? activeCategory.labelKm
                        : activeCategory.labelEn
                      : isKhmer
                        ? "ទាំងអស់"
                        : "All"}
                  </p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white/92 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                  <p
                    className={`text-xs font-semibold text-black/45 ${
                      isKhmer ? "tracking-normal" : "uppercase tracking-[0.18em]"
                    }`}
                  >
                    {isKhmer ? "ប្រភព" : "Source"}
                  </p>
                  <p className="mt-3 text-lg font-bold text-black">Admin</p>
                  <p className="mt-1 text-sm text-black/55">
                    {isKhmer ? "sync ពី dashboard" : "dashboard sync"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 sm:px-7 lg:px-10">
            <div className="grid gap-3 rounded-2xl border border-black/10 bg-[#f7f8f9] p-3 md:grid-cols-2 lg:grid-cols-5">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={isKhmer ? "ស្វែងរកឯកសារ..." : "Search files..."}
                  className="h-12 w-full rounded-xl border border-black/10 bg-white pl-11 pr-4 text-sm text-black outline-none focus:border-black/25"
                />
              </label>

              {!fixedGrade ? (
                <label className="relative block">
                  <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45" />
                  <select
                    value={selectedGrade}
                    onChange={(event) => setSelectedGrade(event.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-black/10 bg-white pl-11 pr-4 text-sm text-black outline-none focus:border-black/25"
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
              ) : null}

              {!fixedSubject ? (
                <label className="relative block">
                  <select
                    value={effectiveSelectedSubject}
                    onChange={(event) => setSelectedSubject(event.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-black/10 bg-white px-4 text-sm text-black outline-none focus:border-black/25"
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
              ) : null}

              <label className="relative block">
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-black/10 bg-white px-4 text-sm text-black outline-none focus:border-black/25"
                >
                  <option value="all">
                    {isKhmer ? "ប្រភេទទាំងអស់" : "All categories"}
                  </option>
                  {RESOURCE_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {isKhmer ? category.labelKm : category.labelEn}
                    </option>
                  ))}
                </select>
              </label>

              <label className="relative block">
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-black/10 bg-white px-4 text-sm text-black outline-none focus:border-black/25"
                >
                  <option value="newest">{isKhmer ? "ថ្មីទៅចាស់" : "Newest first"}</option>
                  <option value="oldest">{isKhmer ? "ចាស់ទៅថ្មី" : "Oldest first"}</option>
                  <option value="title">{isKhmer ? "តាមចំណងជើង" : "Title A-Z"}</option>
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {RESOURCE_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    setSelectedCategory((current) =>
                      current === category.id ? "all" : category.id,
                    )
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    selectedCategory === category.id
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white text-black/68 hover:border-black/20 hover:text-black"
                  }`}
                >
                  {isKhmer ? category.labelKm : category.labelEn}
                </button>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/60 transition-colors hover:border-black/20 hover:text-black"
              >
                {isKhmer ? "សម្អាត" : "Clear"}
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              {loading ? (
                <div className="flex min-h-[220px] items-center justify-center gap-2 text-sm text-black/55">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  {isKhmer ? "កំពុងទាញយកឯកសារ..." : "Loading files..."}
                </div>
              ) : null}

              {!loading && hasError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                  {isKhmer
                    ? "មិនអាចទាញយកឯកសារពី backend បានទេ។"
                    : "Unable to load resources from the backend right now."}
                </div>
              ) : null}

              {!loading && !hasError && filteredResources.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/15 bg-white p-8 text-center">
                  <FolderSearch className="mx-auto h-10 w-10 text-black/35" />
                  <h2 className="mt-4 text-xl font-bold text-black">
                    {isKhmer ? "មិនទាន់មានឯកសារ" : "No files found"}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-black/60">
                    {isKhmer
                      ? "នៅពេល admin upload ឯកសារដែលត្រូវនឹងការតម្រៀប វានឹងបង្ហាញនៅទីនេះ។"
                      : "When the admin uploads matching resources, they will appear here."}
                  </p>
                </div>
              ) : null}

              {!loading &&
                !hasError &&
                filteredResources.map((resource) => (
                  <article
                    key={resource.id}
                    className="relative cursor-pointer rounded-2xl border border-black/10 bg-white p-2.5 shadow-[0_12px_32px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-black/15 sm:p-3"
                  >
                    {resource.openUrl ? (
                      <a
                        href={resource.openUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${resource.title}`}
                        className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/15"
                      />
                    ) : null}

                    <div className="pointer-events-none relative z-10 grid grid-cols-[56px,1fr] gap-3 sm:grid-cols-[64px,1fr]">
                      <ResourceThumb resource={resource} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-black px-2.5 py-0.5 text-[11px] font-semibold text-white">
                            {isKhmer
                              ? resource.category.labelKm
                              : resource.category.labelEn}
                          </span>
                          <span className="rounded-full border border-black/8 bg-[#f5f6f7] px-2.5 py-0.5 text-[11px] font-medium text-black/65">
                            {resource.subjectLabel}
                          </span>
                          <span className="rounded-full border border-black/8 bg-[#f5f6f7] px-2.5 py-0.5 text-[11px] font-medium text-black/65">
                            {resource.gradeLabel}
                          </span>
                        </div>

                        <h2 className="mt-2 text-sm font-bold leading-snug text-black sm:text-base">
                          {resource.title}
                        </h2>
                        {resource.description ? (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-black/62 sm:text-sm">
                            {resource.description}
                          </p>
                        ) : null}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {resource.downloadUrl ? (
                            <button
                              type="button"
                              onClick={(event) => handleDownload(event, resource)}
                              className="pointer-events-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-black px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-black hover:text-white"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </button>
                          ) : null}
                          {resource.createdAtLabel ? (
                            <span className="text-[11px] font-medium text-black/45 sm:text-xs">
                              {isKhmer
                                ? `បានបន្ថែម ${resource.createdAtLabel}`
                                : `Added ${resource.createdAtLabel}`}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
