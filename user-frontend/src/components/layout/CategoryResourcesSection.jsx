import React, { useEffect, useMemo, useState } from "react";
import {
  Download,
  FolderSearch,
  LoaderCircle,
  Search,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import {
  fetchResources,
  resolveFileUrl,
  resolveResourceUrl,
} from "@/services/api";

const khmerCollator = new Intl.Collator("km", {
  numeric: true,
  sensitivity: "base",
});

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

const CATEGORY_DEFINITIONS = [
  {
    id: "exam",
    labelKm: "វិញ្ញាសា",
    labelEn: "Exam Papers",
    accent: "from-[#1f2937] via-[#334155] to-[#94a3b8]",
    keywords: ["កំណែវិញ្ញាសា", "វិញ្ញាសា", "exam", "test", "paper", "bac"],
  },
  {
    id: "exercise",
    labelKm: "លំហាត់",
    labelEn: "Exercises",
    accent: "from-[#1f3b2d] via-[#365845] to-[#a5c3b1]",
    keywords: ["លំហាត់", "exercise", "worksheet", "practice", "homework"],
  },
  {
    id: "formula",
    labelKm: "រូបមន្ត",
    labelEn: "Formulas",
    accent: "from-[#4c3a28] via-[#8a6b49] to-[#d7c2a4]",
    keywords: ["រូបមន្ត", "formula", "summary", "cheat sheet"],
  },
  {
    id: "answer",
    labelKm: "កំណែរលំហាត់",
    labelEn: "Answer Keys",
    accent: "from-[#4c2832] via-[#805364] to-[#dcb6c0]",
    keywords: [
      "កំណែរលំហាត់",
      "កំណែលំហាត់",
      "កំណែ",
      "ចម្លើយ",
      "answer",
      "answer key",
      "solution",
      "solved",
    ],
  },
];

const CATEGORY_BY_ID = CATEGORY_DEFINITIONS.reduce((accumulator, category) => {
  accumulator[category.id] = category;
  return accumulator;
}, {});

const SUBJECT_LABELS = {
  Mathematics: "គណិតវិទ្យា",
  Physics: "រូបវិទ្យា",
  Chemistry: "គីមីវិទ្យា",
  Biology: "ជីវវិទ្យា",
  "Khmer Literature": "អក្សរសាស្ត្រខ្មែរ",
  History: "ប្រវត្តិវិទ្យា",
  Geography: "ភូមិវិទ្យា",
  English: "ភាសាអង់គ្លេស",
};

const GRADE_OPTIONS = [9, 10, 11, 12];

function extractKhmerText(value = "") {
  return (
    String(value)
      .match(/[\u1780-\u17FF\s\d]+/g)
      ?.join(" ")
      .trim() || ""
  );
}

function normalizeText(value = "") {
  return String(value).toLowerCase().replace(/\s+/g, " ").trim();
}

function detectCategory(resource) {
  const explicitCategoryKey = normalizeText(resource.category || "").replace(
    /[\s-]+/g,
    "_",
  );
  if (explicitCategoryKey && CATEGORY_BY_ID[explicitCategoryKey]) {
    return CATEGORY_BY_ID[explicitCategoryKey];
  }

  const haystack = normalizeText(
    [
      resource.title,
      resource.description,
      resource.file_type,
      extractKhmerText(resource.title),
      extractKhmerText(resource.description),
    ].join(" "),
  );

  const orderedDefinitions = [
    CATEGORY_DEFINITIONS[3],
    CATEGORY_DEFINITIONS[0],
    CATEGORY_DEFINITIONS[1],
    CATEGORY_DEFINITIONS[2],
  ];

  return (
    orderedDefinitions.find((definition) =>
      definition.keywords.some((keyword) =>
        haystack.includes(normalizeText(keyword)),
      ),
    ) || null
  );
}

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

function getSubjectLabel(subject = "", language = "km") {
  if (language !== "km") {
    return subject;
  }

  return SUBJECT_LABELS[subject] || extractKhmerText(subject) || subject;
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
  const category = detectCategory(resource);

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
    fileUrl: resolveResourceUrl(resource),
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
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.25rem] border border-black/10 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.10)] sm:h-24 sm:w-24 sm:rounded-[1.45rem]">
        <img
          src={thumbnailUrl}
          alt={title}
          decoding="async"
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
          {gradeLabel}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.25rem] border border-black/10 bg-gradient-to-br ${category.accent} shadow-[0_16px_36px_rgba(15,23,42,0.10)] sm:h-24 sm:w-24 sm:rounded-[1.45rem]`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_46%)]" />
      <div className="absolute inset-3 rounded-[1.05rem] border border-white/45 bg-white/18 backdrop-blur-sm" />
      <div className="relative flex h-full flex-col justify-between p-3 text-white">
        <span className="text-[11px] font-semibold leading-4 tracking-[0.08em]">
          {gradeLabel}
        </span>
        <div className="space-y-1">
          <div className="h-1.5 w-10 rounded-full bg-white/80" />
          <div className="h-1.5 w-14 rounded-full bg-white/60" />
          <p className="text-xs font-bold leading-4">{category.labelKm}</p>
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
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isKhmer = language === "km";
  const errorMessage = hasError
    ? isKhmer
      ? "មិនអាចទាញយកឯកសារពី backend បានទេ។"
      : "Unable to load resources from the backend right now."
    : "";

  useEffect(() => {
    const abortController = new AbortController();

    async function loadResources() {
      try {
        setLoading(true);
        setHasError(false);
        const data = await fetchResources(
          {},
          { signal: abortController.signal },
        );

        setResources(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }

        setHasError(true);
        setResources([]);
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadResources();

    return () => {
      abortController.abort();
    };
  }, []);

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

  const activeCategoryDefinition =
    CATEGORY_DEFINITIONS.find((category) => category.id === selectedCategory) ||
    null;
  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedGrade !== "all" ||
    searchQuery.trim().length > 0;

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory((currentCategory) =>
      currentCategory === categoryId ? "all" : categoryId,
    );
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedGrade("all");
  };

  const filteredResources = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);

    const nextResources = preparedResources.filter((resource) => {
      const matchesCategory =
        selectedCategory === "all" || resource.category.id === selectedCategory;
      const matchesGrade =
        selectedGrade === "all" ||
        Number(resource.grade_level) === Number(selectedGrade);
      const matchesQuery =
        !normalizedQuery ||
        buildSearchIndex(resource).includes(normalizedQuery);

      return matchesCategory && matchesGrade && matchesQuery;
    });

    nextResources.sort((left, right) => {
      const leftTime = new Date(left.created_at || 0).getTime();
      const rightTime = new Date(right.created_at || 0).getTime();

      return (
        rightTime - leftTime ||
        khmerCollator.compare(left.sortLabel, right.sortLabel)
      );
    });

    return nextResources;
  }, [preparedResources, searchQuery, selectedCategory, selectedGrade]);

  return (
    <section
      id="resources"
      className="relative flex min-h-0 scroll-mt-24 overflow-hidden border-t border-black/10 bg-[#f9fafb] py-5 md:min-h-[calc(100dvh-5rem)] md:scroll-mt-24 md:py-7 lg:py-8"
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
        <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl border border-black/10 bg-white/82 p-4 shadow-[0_28px_90px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-5 md:p-6 lg:p-7">
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            style={panelTextureStyle}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/85 via-white/35 to-transparent" />

          <div className="relative mb-6 space-y-3 sm:space-y-4 lg:mb-10">
            <div className="rounded-2xl border border-black/10 bg-white/90 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.04)] md:p-5">
              <div className="grid gap-3 md:gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(280px,1.1fr)_minmax(220px,0.8fr)] lg:items-center">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 lg:pr-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/42">
                    {isKhmer ? "ប្រភេទ" : "Category"}
                  </p>
                  <h3 className="text-lg font-bold text-black sm:text-xl md:text-2xl">
                    {isKhmer
                      ? "ស្វែងរកតាមប្រភេទឯកសារ"
                      : "Browse by resource category"}
                  </h3>
                </div>

                <label className="relative block lg:mx-auto lg:w-full lg:max-w-xl">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-black/38">
                    {isKhmer ? "ស្វែងរក" : "Search"}
                  </span>
                  <Search className="pointer-events-none absolute left-4 top-[calc(50%+0.65rem)] h-4 w-4 -translate-y-1/2 text-black/45" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={
                      isKhmer
                        ? "ស្វែងរកឯកសារតាមចំណងជើង ឬមុខវិជ្ជា..."
                        : "Search by title, subject, or keyword..."
                    }
                    className="h-12 w-full rounded-xl border border-black/10 bg-[#fbfbfb] pl-11 pr-4 text-sm text-black outline-none transition-colors placeholder:text-black/40 focus:border-black/25 sm:h-14"
                  />
                </label>

                <label className="relative block w-full lg:ml-auto lg:max-w-[240px]">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-black/38">
                    {isKhmer ? "តម្រៀប" : "Filter"}
                  </span>
                  <SlidersHorizontal className="pointer-events-none absolute left-4 top-[calc(50%+0.65rem)] h-4 w-4 -translate-y-1/2 text-black/45" />
                  <select
                    value={selectedCategory}
                    onChange={(event) =>
                      setSelectedCategory(event.target.value)
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-black/10 bg-[#fbfbfb] pl-11 pr-4 text-sm text-black outline-none transition-colors focus:border-black/25 sm:h-14"
                  >
                    <option value="all">
                      {isKhmer ? "តម្រៀបតាមប្រភេទឯកសារ" : "Filter by category"}
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

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/8 bg-[#f7f8f9] px-3 py-3 sm:px-4">
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
                  {isKhmer ? "តម្រៀបថ្មីទៅចាស់" : "Newest to oldest"}
                </span>
              </div>

              <div className="flex w-full flex-wrap items-center justify-stretch gap-3 sm:w-auto sm:justify-end">
                <label className="relative block w-full sm:w-[190px]">
                  <select
                    value={selectedGrade}
                    onChange={(event) => setSelectedGrade(event.target.value)}
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

                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-black/70 transition-colors hover:border-black/20 hover:text-black"
                  >
                    {isKhmer ? "សម្អាតការតម្រៀប" : "Clear filters"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="relative flex flex-1 min-h-0 flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex w-full items-center gap-2 rounded-full border border-black/10 bg-white/95 px-4 py-2 text-sm font-medium text-black/70 shadow-sm sm:w-auto">
                <Send className="h-4 w-4" />
                {isKhmer
                  ? "ទិន្នន័យពី admin backend"
                  : "Data from the admin backend"}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {CATEGORY_DEFINITIONS.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category.id)}
                  className={`group rounded-xl border px-4 py-4 text-left transition-all duration-300 ${
                    selectedCategory === category.id
                      ? "border-black bg-black text-white shadow-[0_14px_34px_rgba(15,23,42,0.10)]"
                      : "border-black/10 bg-white/92 text-black shadow-[0_8px_24px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:border-black/20 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-bold md:text-lg">
                        {isKhmer ? category.labelKm : category.labelEn}
                      </p>
                      <p
                        className={`mt-1 text-sm ${
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

            <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04)] md:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-black/8 pb-4">
                <div>
                  <h4 className="text-lg font-bold text-black">
                    {isKhmer
                      ? "ឯកសារពីបណ្ណាល័យសិក្សា"
                      : "Files from the learning library"}
                  </h4>
                  <p className="mt-1 text-sm text-black/55">
                    {isKhmer
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

              <div className="grid gap-4 overflow-x-hidden lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-2">
                {loading &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white/94 p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center"
                    >
                      <div className="h-20 w-20 animate-pulse rounded-[1.2rem] bg-black/8 sm:h-24 sm:w-24 sm:rounded-[1.35rem]" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 w-28 animate-pulse rounded-full bg-black/8" />
                        <div className="h-6 w-2/3 animate-pulse rounded-full bg-black/8" />
                        <div className="h-4 w-full animate-pulse rounded-full bg-black/8" />
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
                  filteredResources.map((resource) => (
                    <article
                      key={resource.id}
                    className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-black/15 hover:shadow-[0_16px_38px_rgba(15,23,42,0.07)] md:p-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start">
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
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white shadow-sm">
                              {isKhmer
                                ? resource.category.labelKm
                                : resource.category.labelEn}
                            </span>
                            <span className="rounded-full border border-black/8 bg-[#f5f6f7] px-3 py-1 text-xs font-medium text-black/65">
                              {isKhmer
                                ? resource.subjectKm
                                : resource.subjectEn}
                            </span>
                            <span className="rounded-full border border-black/8 bg-[#f5f6f7] px-3 py-1 text-xs font-medium text-black/65">
                              {isKhmer
                                ? resource.gradeLabelKm
                                : resource.gradeLabelEn}
                            </span>
                            <span className="rounded-full border border-black/8 bg-[#f5f6f7] px-3 py-1 text-xs font-medium text-black/65">
                              {resource.file_type === "image"
                                ? isKhmer
                                  ? "រូបភាព"
                                  : "Image"
                                : isKhmer
                                  ? "ឯកសារ"
                                  : "File"}
                            </span>
                          </div>

                          <h3 className="mt-3 text-lg font-bold leading-snug text-black md:text-xl">
                            {resource.title}
                          </h3>
                          <p className="mt-2 max-w-4xl text-sm leading-7 text-black/65">
                            {resource.description}
                          </p>

                          <div className="mt-4 flex flex-wrap items-center gap-3 pt-1">
                            {resource.fileUrl ? (
                              <a
                                href={resource.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-black px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white sm:w-auto sm:min-w-[132px]"
                              >
                                <Download className="h-4 w-4" />
                                {isKhmer ? "បើកឯកសារ" : "Open file"}
                              </a>
                            ) : null}
                            {resource.createdAtLabel && (
                              <span className="text-xs font-medium text-black/45">
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
