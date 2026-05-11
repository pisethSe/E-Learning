import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  LoaderCircle,
  MapPin,
  Sparkles,
} from "lucide-react";
import { fetchEvents, resolveFileUrl } from "@/services/api";

function formatEventDate(value, language = "km") {
  if (!value) {
    return language === "km"
      ? "កាលបរិច្ឆេទនឹងប្រកាសនៅពេលក្រោយ"
      : "Date coming soon";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return language === "km"
      ? "កាលបរិច្ឆេទនឹងប្រកាសនៅពេលក្រោយ"
      : "Date coming soon";
  }

  return new Intl.DateTimeFormat(language === "km" ? "km-KH" : "en-US", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function getStatusLabel(status = "", language = "km") {
  const labels = {
    coming_soon: language === "km" ? "នឹងមកដល់ឆាប់ៗ" : "Coming soon",
    upcoming: language === "km" ? "ជិតមកដល់" : "Upcoming",
    registration_open: language === "km" ? "បើកចុះឈ្មោះ" : "Registration open",
    live: language === "km" ? "កំពុងដំណើរការ" : "Live",
    completed: language === "km" ? "បានបញ្ចប់" : "Completed",
  };

  return labels[status] || status || (language === "km" ? "ព្រឹត្តិការណ៍" : "Event");
}

export default function EventsPage({ language = "km" }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isKhmer = language === "km";

  useEffect(() => {
    const abortController = new AbortController();

    async function loadEvents() {
      try {
        setLoading(true);
        setHasError(false);
        const data = await fetchEvents({}, { signal: abortController.signal });
        setEvents(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }

        setHasError(true);
        setEvents([]);
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-12 pt-28 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at top left, rgba(255,255,255,0.92), transparent 28%), radial-gradient(circle at 86% 14%, rgba(14,165,233,0.10), transparent 20%), linear-gradient(to right, rgba(209,213,219,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(209,213,219,0.3) 1px, transparent 1px)",
          backgroundSize: "auto, auto, 26px 26px, 26px 26px",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[1.4rem] border border-black/10 bg-white/86 shadow-[0_28px_90px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:rounded-[2rem]">
          <div className="border-b border-black/10 px-4 py-6 sm:px-6 sm:py-7 md:px-8 md:py-8 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-black/55 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  {isKhmer ? "ព្រឹត្តិការណ៍សិក្សា" : "Learning events"}
                </div>

                <h1 className="mt-5 text-3xl font-bold leading-tight text-black md:text-4xl lg:text-5xl">
                  {isKhmer
                    ? "ព្រឹត្តិការណ៍ និងកម្មវិធីដែលនឹងមកដល់"
                    : "Upcoming workshops, campaigns, and student events"}
                </h1>

                <p className="mt-4 max-w-3xl text-base leading-8 text-black/65 md:text-lg">
                  {isKhmer
                    ? "ទំព័រនេះបង្ហាញព្រឹត្តិការណ៍ coming soon ទាំងអស់ដែលត្រូវបានបន្ថែមពី admin dashboard ដើម្បីឱ្យសិស្សឃើញកាលបរិច្ឆេទ ទីតាំង និងតំណចុះឈ្មោះបានងាយ។"
                    : "This page shows every coming-soon event published from the admin dashboard, with dates, locations, and registration links in one clear place."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div className="rounded-[1.35rem] border border-black/10 bg-white/92 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                    {isKhmer ? "សរុប" : "Total"}
                  </p>
                  <p className="mt-3 text-3xl font-bold text-black">
                    {loading ? "--" : events.length}
                  </p>
                  <p className="mt-1 text-sm text-black/55">
                    {isKhmer ? "ព្រឹត្តិការណ៍" : "events"}
                  </p>
                </div>
                <div className="rounded-[1.35rem] border border-black/10 bg-white/92 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                    {isKhmer ? "ស្ថានភាព" : "Status"}
                  </p>
                  <p className="mt-3 text-lg font-bold text-black">Live sync</p>
                  <p className="mt-1 text-sm text-black/55">
                    {isKhmer ? "ពី backend admin" : "from the admin backend"}
                  </p>
                </div>
                <div className="rounded-[1.35rem] border border-black/10 bg-white/92 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                    {isKhmer ? "បច្ចុប្បន្នភាព" : "Readiness"}
                  </p>
                  <p className="mt-3 text-lg font-bold text-black">
                    {isKhmer ? "ច្បាស់ និងងាយមើល" : "Clear and ready"}
                  </p>
                  <p className="mt-1 text-sm text-black/55">
                    {isKhmer ? "សម្រាប់សិស្សទាំងអស់" : "for every student"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-10">
            {loading ? (
              <div className="flex min-h-[240px] items-center justify-center gap-3 text-sm text-black/55">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                {isKhmer ? "កំពុងទាញយកព្រឹត្តិការណ៍..." : "Loading events..."}
              </div>
            ) : null}

            {!loading && hasError ? (
              <div className="rounded-[1.7rem] border border-red-200/80 bg-[rgba(254,242,242,0.92)] p-6 text-sm leading-7 text-red-700 shadow-[0_14px_36px_rgba(185,28,28,0.06)]">
                {isKhmer
                  ? "មិនអាចទាញយកទិន្នន័យព្រឹត្តិការណ៍ពី backend បានទេ។"
                  : "Unable to load event data from the backend right now."}
              </div>
            ) : null}

            {!loading && !hasError && !events.length ? (
              <div className="rounded-[1.8rem] border border-dashed border-black/15 bg-white/92 p-8 text-center shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                <Clock3 className="mx-auto h-10 w-10 text-black/35" />
                <h2 className="mt-4 text-2xl font-bold text-black">
                  {isKhmer
                    ? "មិនទាន់មានព្រឹត្តិការណ៍ដែលបានបោះពុម្ពផ្សាយនៅឡើយ"
                    : "No published events yet"}
                </h2>
                <p className="mt-3 text-sm leading-7 text-black/60">
                  {isKhmer
                    ? "នៅពេល admin បន្ថែម coming-soon event ពី dashboard វានឹងបង្ហាញនៅទីនេះដោយស្វ័យប្រវត្តិ។"
                    : "As soon as an admin publishes a coming-soon event from the dashboard, it will appear here automatically."}
                </p>
              </div>
            ) : null}

            {!loading && !hasError && events.length ? (
              <div className="grid gap-5 lg:grid-cols-2">
                {events.map((event) => (
                  <article
                    key={event.id}
                    className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-white shadow-[0_14px_38px_rgba(15,23,42,0.06)]"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-[#e5e7eb]">
                      {event.image_path ? (
                        <img
                          src={resolveFileUrl(event.image_path)}
                          alt={event.title}
                          decoding="async"
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_42%),linear-gradient(135deg,#dbeafe,#e2e8f0)] text-sm font-semibold uppercase tracking-[0.28em] text-black/45">
                          Event preview
                        </div>
                      )}
                      <div className="absolute left-4 top-4 rounded-full bg-black px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
                        {getStatusLabel(event.status, language)}
                      </div>
                    </div>

                    <div className="p-5 md:p-6">
                      <h2 className="text-2xl font-bold tracking-[-0.03em] text-black">
                        {event.title}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-black/65 md:text-[15px]">
                        {event.description ||
                          (isKhmer
                            ? "ព័ត៌មានបន្ថែមនឹងបង្ហាញនៅទីនេះ។"
                            : "More event information will appear here.")}
                      </p>

                      <div className="mt-5 grid gap-3 text-sm text-black/62">
                        <div className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {formatEventDate(event.event_date, language)}
                        </div>
                        <div className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.location ||
                            (isKhmer
                              ? "ទីតាំងនឹងប្រកាសនៅពេលក្រោយ"
                              : "Location coming soon")}
                        </div>
                      </div>

                      {event.cta_url ? (
                        <div className="mt-5">
                          <a
                            href={event.cta_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-full border border-black px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white"
                          >
                            {event.cta_label ||
                              (isKhmer ? "មើលព័ត៌មានបន្ថែម" : "Learn more")}
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
