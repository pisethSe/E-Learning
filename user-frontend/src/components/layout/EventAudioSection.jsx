import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Headphones,
  LoaderCircle,
  Mic2,
  Sparkles,
  Volume2,
} from "lucide-react";
import AudioPlayer from "@/components/resources/AudioPlayer";
import { fetchResources, resolveResourceUrl } from "@/services/api";

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

function extractKhmerText(value = "") {
  return (
    String(value)
      .match(/[\u1780-\u17FF\s\d]+/g)
      ?.join(" ")
      .trim() || ""
  );
}

function getSubjectLabel(subject = "", language = "km") {
  if (language !== "km") {
    return subject;
  }

  return SUBJECT_LABELS[subject] || extractKhmerText(subject) || subject;
}

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

function toDisplayAudio(resource, language = "km") {
  const khmerTitle = extractKhmerText(resource.title);
  const khmerDescription = extractKhmerText(resource.description);

  return {
    ...resource,
    title:
      language === "km"
        ? khmerTitle || resource.title || "សំឡេងមេរៀន"
        : resource.title || khmerTitle || "Lesson audio",
    description:
      language === "km"
        ? khmerDescription ||
          resource.description ||
          "ស្តាប់សំឡេងមេរៀនដែលបានបោះពុម្ពផ្សាយពី admin library នៅទីនេះ។"
        : resource.description ||
          "Listen to lesson audio published from the learning library.",
    subjectLabel: getSubjectLabel(resource.subject, language),
    gradeLabel:
      language === "km"
        ? `ថ្នាក់ទី ${resource.grade_level}`
        : `Grade ${resource.grade_level}`,
    createdAtLabel: formatCreatedAt(resource.created_at, language),
    fileUrl: resolveResourceUrl(resource),
  };
}

export default function EventAudioSection({ language = "km" }) {
  const [audioItems, setAudioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isKhmer = language === "km";

  useEffect(() => {
    const abortController = new AbortController();

    async function loadAudioResources() {
      try {
        setLoading(true);
        setHasError(false);
        const data = await fetchResources(
          { file_type: "audio" },
          { signal: abortController.signal },
        );

        const items = Array.isArray(data)
          ? data.map((resource) => toDisplayAudio(resource, language))
          : [];

        setAudioItems(items);
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }

        setHasError(true);
        setAudioItems([]);
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadAudioResources();

    return () => {
      abortController.abort();
    };
  }, [language]);

  return (
    <section
      id="event"
      className="relative scroll-mt-24 overflow-hidden border-t border-black/10 bg-[#f8fafc] py-6 md:py-10 lg:py-12"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e2e8f0 1px, transparent 1px),
            linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
          `,
          backgroundSize: "20px 30px",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 100%, #000 60%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 100%, #000 60%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at top left, rgba(255,255,255,0.96), transparent 28%), radial-gradient(circle at 84% 18%, rgba(15,23,42,0.05), transparent 18%), radial-gradient(circle at 22% 78%, rgba(148,163,184,0.12), transparent 22%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8 lg:px-10 xl:px-16">
        <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/82 shadow-[0_28px_90px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <div className="relative border-b border-black/10 px-5 py-7 md:px-7 md:py-8 lg:px-8">
            <div
              className="pointer-events-none absolute inset-0 opacity-75"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(209,213,219,0.24) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(209,213,219,0.24) 1px, transparent 1px)
                `,
                backgroundSize: "26px 26px",
              }}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white via-white/70 to-transparent" />

            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-end">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-black/55 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Event Audio
                </div>

                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.26em] text-black/42">
                  {isKhmer ? "អាចស្តាប់បានគ្រប់ពេល" : "Learn with audio"}
                </p>

                <h2 className="mt-3 text-3xl font-bold leading-tight text-black md:text-4xl lg:text-5xl">
                  ស្តាប់សំឡេងមេរៀនទាំងអស់បានយ៉ាងងាយស្រួល
                </h2>

                <p className="mt-3 max-w-2xl text-lg font-medium leading-8 text-black/72 md:text-xl">
                  Listen to every lesson audio in one clean, easy-to-use place.
                </p>

                <p className="mt-4 max-w-2xl text-base leading-8 text-black/62 md:text-lg">
                  {isKhmer
                    ? "ផ្នែកនេះប្រមូលសំឡេងមេរៀនទាំងអស់សម្រាប់ឱ្យសិស្សស្តាប់បានឆាប់ រកបានងាយ ហើយប្រើប្រាស់បានស្រួលលើទូរស័ព្ទ និងកុំព្យូទ័រ។"
                    : "This section gathers all lesson audio into a clear, professional layout that is easy to browse and play on both mobile and desktop."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div className="rounded-[1.4rem] border border-black/10 bg-white/90 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center gap-2 text-black/45">
                    <Headphones className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                      {isKhmer ? "សរុប" : "Total"}
                    </span>
                  </div>
                  <p className="mt-4 text-3xl font-bold tracking-tight text-black">
                    {loading ? "--" : audioItems.length}
                  </p>
                  <p className="mt-1 text-sm text-black/55">
                    {isKhmer ? "សំឡេងទាំងអស់" : "audio lessons"}
                  </p>
                </div>

                <div className="rounded-[1.4rem] border border-black/10 bg-white/90 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center gap-2 text-black/45">
                    <Mic2 className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                      {isKhmer ? "ប្រភព" : "Source"}
                    </span>
                  </div>
                  <p className="mt-4 text-lg font-bold text-black">
                    {isKhmer ? "Admin library" : "Admin library"}
                  </p>
                  <p className="mt-1 text-sm text-black/55">
                    {isKhmer ? "sync ពី backend" : "synced from backend"}
                  </p>
                </div>

                <div className="rounded-[1.4rem] border border-black/10 bg-white/90 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center gap-2 text-black/45">
                    <Volume2 className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                      {isKhmer ? "បទពិសោធន៍" : "Experience"}
                    </span>
                  </div>
                  <p className="mt-4 text-lg font-bold text-black">
                    {isKhmer ? "ស្អាត និងស្រួលប្រើ" : "Clean and easy"}
                  </p>
                  <p className="mt-1 text-sm text-black/55">
                    {isKhmer ? "បើកស្តាប់ភ្លាមៗ" : "Play instantly"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative px-6 py-6 md:px-8 md:py-8 lg:px-10">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-black md:text-2xl">
                  {isKhmer ? "បញ្ជីសំឡេងទាំងអស់" : "All audio lessons"}
                </h3>
                <p className="mt-1 text-sm leading-7 text-black/58">
                  {isKhmer
                    ? "ជ្រើសសំឡេងដែលអ្នកចង់ស្តាប់ ហើយចុច Play ដើម្បីរៀនភ្លាមៗ។"
                    : "Choose any audio below and press play to start listening right away."}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f8fafc] px-4 py-2 text-sm font-medium text-black/65">
                {isKhmer
                  ? "ទិន្នន័យពី admin backend"
                  : "Powered by the admin backend"}
              </div>
            </div>

            <div className="grid gap-4">
              {loading &&
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[1.6rem] border border-black/10 bg-white/92 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)]"
                  >
                    <div className="h-4 w-28 animate-pulse rounded-full bg-black/8" />
                    <div className="mt-4 h-8 w-2/3 animate-pulse rounded-full bg-black/8" />
                    <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-black/8" />
                    <div className="mt-5 h-14 animate-pulse rounded-[1rem] bg-black/7" />
                  </div>
                ))}

              {!loading && hasError && (
                <div className="rounded-[1.7rem] border border-red-200/80 bg-[rgba(254,242,242,0.92)] p-6 text-sm leading-7 text-red-700 shadow-[0_14px_36px_rgba(185,28,28,0.06)]">
                  {isKhmer
                    ? "មិនអាចទាញយកសំឡេងមេរៀនពី backend បានទេ។"
                    : "Unable to load lesson audio from the backend right now."}
                </div>
              )}

              {!loading && !hasError && audioItems.length === 0 && (
                <div className="rounded-[1.8rem] border border-dashed border-black/15 bg-white/92 p-8 text-center shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                  <Headphones className="mx-auto h-10 w-10 text-black/35" />
                  <h3 className="mt-4 text-xl font-bold text-black">
                    {isKhmer
                      ? "មិនទាន់មានសំឡេងមេរៀននៅឡើយ"
                      : "No audio lessons yet"}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-black/60">
                    {isKhmer
                      ? "នៅពេល admin បន្ថែមសំឡេងមេរៀន វានឹងបង្ហាញនៅទីនេះដោយស្វ័យប្រវត្តិ។"
                      : "As soon as new audio resources are published, they will appear here automatically."}
                  </p>
                </div>
              )}

              {!loading &&
                !hasError &&
                audioItems.map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-[1.65rem] border border-black/10 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-black/15 hover:shadow-[0_18px_44px_rgba(15,23,42,0.08)]"
                  >
                    <div className="grid gap-5 p-5 md:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.88fr)] lg:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white shadow-sm">
                            {item.gradeLabel}
                          </span>
                          <span className="rounded-full border border-black/8 bg-[#f5f6f7] px-3 py-1 text-xs font-medium text-black/65">
                            {item.subjectLabel}
                          </span>
                          <span className="rounded-full border border-black/8 bg-[#f5f6f7] px-3 py-1 text-xs font-medium text-black/65">
                            Audio
                          </span>
                        </div>

                        <h4 className="mt-4 text-xl font-bold leading-snug text-black md:text-2xl">
                          {item.title}
                        </h4>

                        <p className="mt-3 max-w-3xl text-sm leading-7 text-black/62 md:text-[15px]">
                          {item.description}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-black/48">
                          {item.createdAtLabel ? (
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays className="h-4 w-4" />
                              {isKhmer
                                ? `បានបន្ថែម ${item.createdAtLabel}`
                                : `Added ${item.createdAtLabel}`}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="rounded-[1.4rem] border border-black/10 bg-[#fbfcfd] p-3">
                        <AudioPlayer
                          src={item.fileUrl}
                          title={
                            isKhmer ? "ចាក់សំឡេងមេរៀន" : "Play lesson audio"
                          }
                          className="border-0 bg-transparent p-0 shadow-none"
                        />
                      </div>
                    </div>
                  </article>
                ))}
            </div>

            {loading && (
              <div className="mt-5 flex items-center justify-center gap-2 text-sm text-black/50">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                {isKhmer
                  ? "កំពុងទាញយកសំឡេងមេរៀន..."
                  : "Loading lesson audio..."}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
