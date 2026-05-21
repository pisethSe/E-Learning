import React, { useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarRange,
  CheckCircle2,
  FileText,
  Filter,
  Headphones,
  ImagePlus,
  LibraryBig,
  Search,
  UploadCloud,
  Video,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { getCategoryLabel, getSubjectLabel } from "../data/learningCatalog";
import {
  getAudioResources,
  getCatalogHealth,
  getCategoryCounts,
  getFileResources,
  getPhotoResources,
  getPublishedItems,
  getStudyResources,
  getSummary,
} from "../utils/dashboard";

const RANGE_OPTIONS = [
  { id: "12m", label: "12 months" },
  { id: "30d", label: "30 days" },
  { id: "7d", label: "7 days" },
  { id: "24h", label: "24 hours" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

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

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function formatPercent(value, total) {
  if (!total) {
    return "0%";
  }

  return `${Math.round((Number(value || 0) / Number(total || 1)) * 100)}%`;
}

function getDateValue(item) {
  const date = new Date(item?.created_at || 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function countBetween(items, start, end) {
  return (items || []).filter((item) => {
    const date = getDateValue(item);
    return date && date >= start && date < end;
  }).length;
}

function buildActivityTrend(resources = [], events = [], rangeId = "12m") {
  const now = new Date();

  if (rangeId === "24h") {
    return Array.from({ length: 12 }, (_, index) => {
      const start = new Date(now);
      start.setMinutes(0, 0, 0);
      start.setHours(start.getHours() - (11 - index) * 2);
      const end = new Date(start);
      end.setHours(end.getHours() + 2);

      return {
        name: new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
        }).format(start),
        resources: countBetween(resources, start, end),
        events: countBetween(events, start, end),
      };
    });
  }

  const days = rangeId === "30d" ? 30 : rangeId === "7d" ? 7 : null;

  if (days) {
    return Array.from({ length: days }, (_, index) => {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - (days - 1 - index));
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      return {
        name:
          days === 7
            ? new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(start)
            : new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
              }).format(start),
        resources: countBetween(resources, start, end),
        events: countBetween(events, start, end),
      };
    });
  }

  return Array.from({ length: 12 }, (_, index) => {
    const start = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);

    return {
      name: new Intl.DateTimeFormat("en-US", { month: "short" }).format(start),
      resources: countBetween(resources, start, end),
      events: countBetween(events, start, end),
    };
  });
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  const resources = payload.find((item) => item.dataKey === "resources")?.value || 0;
  const events = payload.find((item) => item.dataKey === "events")?.value || 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-card">
      <p className="font-semibold text-slate-950">{label}</p>
      <p className="mt-1 text-slate-600">Resources: {resources}</p>
      <p className="text-slate-600">Events: {events}</p>
    </div>
  );
}

function getResourceKind(resource) {
  if (resource?.file_type === "audio") {
    return {
      label: "Audio",
      icon: Headphones,
      tone: "bg-indigo-50 text-indigo-600",
    };
  }

  if (resource?.file_type === "image" || resource?.file_type === "photo") {
    return {
      label: "Image file",
      icon: ImagePlus,
      tone: "bg-sky-50 text-sky-600",
    };
  }

  return {
    label: "File",
    icon: FileText,
    tone: "bg-violet-50 text-violet-600",
  };
}

export default function DashboardPage({
  stats,
  resources,
  events,
  isLoading,
}) {
  const [rangeId, setRangeId] = useState("12m");
  const [searchTerm, setSearchTerm] = useState("");
  const summary = getSummary(stats);
  const photoResources = useMemo(() => getPhotoResources(resources), [resources]);
  const fileResources = useMemo(() => getFileResources(resources), [resources]);
  const studyResources = useMemo(() => getStudyResources(resources), [resources]);
  const audioResources = useMemo(() => getAudioResources(resources), [resources]);
  const health = useMemo(() => getCatalogHealth(resources, events), [events, resources]);
  const categoryCounts = useMemo(() => getCategoryCounts(resources), [resources]);
  const trendData = useMemo(
    () => buildActivityTrend(resources, events, rangeId),
    [events, rangeId, resources],
  );
  const totalResources = summary.total_resources || resources.length;
  const publishedResources =
    summary.published_resources || getPublishedItems(resources).length;
  const totalEvents = summary.total_events || events.length;
  const publishedEvents = summary.published_events || getPublishedItems(events).length;
  const chartTotal = trendData.reduce(
    (total, item) => total + item.resources + item.events,
    0,
  );
  const maxCategoryCount = Math.max(...categoryCounts.map((item) => item.value), 1);
  const searchValue = searchTerm.trim().toLowerCase();
  const latestResources = [...(resources || [])]
    .filter((resource) => {
      if (!searchValue) {
        return true;
      }

      return [
        resource.title,
        resource.subject,
        resource.category,
        resource.file_type,
        resource.grade_level,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchValue));
    })
    .sort((left, right) => new Date(right.created_at || 0) - new Date(left.created_at || 0))
    .slice(0, 7);
  const recentEvents = [...(events || [])]
    .sort((left, right) => new Date(right.created_at || 0) - new Date(left.created_at || 0))
    .slice(0, 3);

  const statCards = [
    {
      title: "All resources",
      value: formatNumber(totalResources),
      detail: `${formatPercent(publishedResources, totalResources)} published`,
      icon: LibraryBig,
      to: "/upload/file",
    },
    {
      title: "Study files",
      value: formatNumber(studyResources.length),
      detail: `${fileResources.length} documents, ${photoResources.length} image files`,
      icon: FileText,
      to: "/upload/file",
    },
    {
      title: "Audio lessons",
      value: formatNumber(audioResources.length),
      detail: `${health.khmerAudio.length} Khmer Literature`,
      icon: Headphones,
      to: "/upload/audio",
    },
    {
      title: "Event videos",
      value: formatNumber(health.videoEvents.length || totalEvents),
      detail: `${publishedEvents} published`,
      icon: Video,
      to: "/upload/events",
    },
  ];

  const quickActions = [
    {
      label: "Upload image file",
      to: "/upload/photo",
      icon: ImagePlus,
    },
    {
      label: "Upload file",
      to: "/upload/file",
      icon: UploadCloud,
    },
    {
      label: "Add audio",
      to: "/upload/audio",
      icon: Headphones,
    },
    {
      label: "Event video",
      to: "/upload/events",
      icon: CalendarRange,
    },
  ];

  return (
    <Motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, index) => (
          <Motion.div key={stat.title} variants={itemVariants}>
            <Link to={stat.to}>
              <Card animate delay={index * 0.03} className="h-full hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm">
                    <stat.icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-500">{stat.title}</p>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <h3 className="text-3xl font-bold tracking-tight text-slate-950">
                        {stat.value}
                      </h3>
                      <span className="inline-flex items-center rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                        <ArrowUpRight size={13} className="mr-1" />
                        {stat.detail}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </Motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Motion.div variants={itemVariants}>
          <Card className="h-full overflow-hidden p-0">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-950">Content activity</h2>
                  <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                    {chartTotal} new
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Resources and event videos added during the selected range.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                  {RANGE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setRangeId(option.id)}
                      className={`rounded-md px-3 py-1.5 text-sm font-bold transition-colors ${
                        rangeId === option.id
                          ? "bg-white text-slate-950 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <Link to="/analytics">
                  <Button variant="outline" className="h-10 gap-2">
                    <Filter size={16} />
                    Analytics
                  </Button>
                </Link>
              </div>
            </div>

            <div className="px-2 pb-4 pt-5 sm:px-4">
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 12, right: 22, left: 12, bottom: 8 }}
                  >
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickMargin={16}
                      minTickGap={16}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      width={28}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="resources"
                      name="Resources"
                      stroke="#7c3aed"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: "#7c3aed", stroke: "#ffffff", strokeWidth: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="events"
                      name="Events"
                      stroke="#c4b5fd"
                      strokeWidth={2.25}
                      strokeDasharray="3 7"
                      dot={false}
                      activeDot={{ r: 4, fill: "#a78bfa", stroke: "#ffffff", strokeWidth: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </Motion.div>

        <div className="space-y-6">
          <Motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-950">Quick actions</h2>
                  <p className="mt-1 text-sm text-slate-500">Common publishing tasks</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                  Admin
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="flex min-h-24 flex-col justify-between rounded-lg border border-slate-200 bg-white p-3 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    <action.icon size={20} className="text-violet-600" />
                    <span>{action.label}</span>
                  </Link>
                ))}
              </div>
            </Card>
          </Motion.div>

          <Motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-950">Catalog health</h2>
                  <p className="mt-1 text-sm text-slate-500">Coverage for required content</p>
                </div>
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  {health.coveredCategories}/{health.totalCategories}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {categoryCounts.map((category) => {
                  const percent = Math.round((category.value / maxCategoryCount) * 100);

                  return (
                    <div key={category.id}>
                      <div className="mb-1.5 flex justify-between gap-3 text-sm">
                        <span className="truncate font-semibold text-slate-700">
                          {category.labelEn}
                        </span>
                        <span className="font-bold text-slate-500">{category.value}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-violet-600"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </Motion.div>

          <Motion.div variants={itemVariants}>
            <Card>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-950">Recent events</h2>
                  <p className="mt-1 text-sm text-slate-500">Latest video updates</p>
                </div>
                <Link to="/upload/events">
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {(recentEvents.length ? recentEvents : [{ id: "empty" }]).map((event) =>
                  event.id === "empty" ? (
                    <p key="empty" className="text-sm text-slate-500">
                      {isLoading ? "Loading event videos..." : "No event videos created yet."}
                    </p>
                  ) : (
                    <div
                      key={event.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm">
                          <Video size={18} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-950">{event.title}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {event.location || "Location to be announced"}
                          </p>
                          <span className="mt-3 inline-flex rounded-md bg-white px-2 py-1 text-xs font-bold capitalize text-slate-500 shadow-sm">
                            {event.status || "draft"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </Card>
          </Motion.div>
        </div>
      </div>

      <Motion.div variants={itemVariants}>
        <Card className="overflow-hidden p-0">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Latest uploads</h2>
              <p className="mt-1 text-sm text-slate-500">
                Review what students will see across grades and subjects.
              </p>
            </div>

            <label className="flex h-11 w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500 shadow-sm md:max-w-sm">
              <Search size={18} className="text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="min-w-0 flex-1 bg-transparent font-medium outline-none placeholder:text-slate-400"
                placeholder="Search uploads"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Content</th>
                  <th className="px-6 py-3">Grade</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(latestResources.length ? latestResources : [{ id: "empty" }]).map((resource) => {
                  if (resource.id === "empty") {
                    return (
                      <tr key="empty">
                        <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-500">
                          {isLoading
                            ? "Loading uploads..."
                            : searchTerm
                              ? "No uploads match your search."
                              : "No uploads yet."}
                        </td>
                      </tr>
                    );
                  }

                  const kind = getResourceKind(resource);
                  const uploadRoute =
                    resource.file_type === "audio"
                      ? "/upload/audio"
                      : resource.file_type === "image" || resource.file_type === "photo"
                        ? "/upload/photo"
                        : "/upload/file";

                  return (
                    <tr key={resource.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${kind.tone}`}
                          >
                            <kind.icon size={18} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-950">
                              {resource.title}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {getSubjectLabel(resource.subject)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">
                        Grade {resource.grade_level || "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <p className="font-semibold text-slate-700">{kind.label}</p>
                        <p className="max-w-[13rem] truncate text-xs text-slate-500">
                          {resource.file_type === "audio"
                            ? "Khmer audio"
                            : resource.file_type === "image" || resource.file_type === "photo"
                              ? "Image file"
                              : getCategoryLabel(resource.category)}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-500">
                        {formatDate(resource.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-bold ${
                            resource.is_published
                              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                              : "border-amber-100 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {resource.is_published ? <CheckCircle2 size={13} /> : null}
                          {resource.is_published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={uploadRoute}
                          className="text-sm font-bold text-violet-700 hover:text-violet-900"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </Motion.div>
    </Motion.div>
  );
}
