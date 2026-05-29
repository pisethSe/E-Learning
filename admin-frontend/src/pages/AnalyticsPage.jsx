import React, { useMemo } from "react";
import { motion as Motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Calendar,
  Download,
  FileText,
  Headphones,
  ImagePlus,
  TrendingUp,
  Video,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import {
  buildRecentActivity,
  formatCompactNumber,
  getAudioResources,
  getCatalogHealth,
  getCategoryCounts,
  getFileResources,
  getGradeCounts,
  getPhotoResources,
  getPublishedItems,
  getSubjectCounts,
  getSummary,
} from "../utils/dashboard";

const COLORS = ["#4f46e5", "#0ea5e9", "#14b8a6", "#f59e0b", "#ec4899"];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32 } },
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-card">
      <p className="mb-2 text-sm font-semibold text-slate-900">{label || payload[0].name}</p>
      {payload.map((entry) => (
        <p key={`${entry.dataKey}-${entry.name}`} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color || entry.fill }}
          />
          <span className="text-slate-600">{entry.name}:</span>
          <span className="font-medium text-slate-900">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

function buildDownloadActivity(downloads = [], days = 7) {
  const formatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
  const labels = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);
    labels.push({
      key: date.toISOString().slice(0, 10),
      name: formatter.format(date),
    });
  }

  const counts = downloads.reduce((accumulator, item) => {
    const key = item?.downloaded_at ? String(item.downloaded_at).slice(0, 10) : "";
    if (key) {
      accumulator[key] = (accumulator[key] || 0) + 1;
    }
    return accumulator;
  }, {});

  return labels.map((item) => ({
    name: item.name,
    downloads: counts[item.key] || 0,
  }));
}

export default function AnalyticsPage({
  stats,
  resources,
  events,
  downloads = [],
}) {
  const summary = getSummary(stats);
  const photoResources = useMemo(() => getPhotoResources(resources), [resources]);
  const fileResources = useMemo(() => getFileResources(resources), [resources]);
  const audioResources = useMemo(() => getAudioResources(resources), [resources]);
  const health = useMemo(() => getCatalogHealth(resources, events), [events, resources]);
  const categoryData = useMemo(
    () => getCategoryCounts(resources).filter((item) => item.value > 0),
    [resources],
  );
  const categoryCoverageData = useMemo(() => getCategoryCounts(resources), [resources]);
  const gradeData = useMemo(() => getGradeCounts(resources), [resources]);
  const subjectData = useMemo(
    () =>
      getSubjectCounts(resources)
        .filter((item) => item.value > 0)
        .slice(0, 8)
        .map((item) => ({
          name: item.subject,
          uploads: item.value,
        })),
    [resources],
  );
  const trendData = useMemo(
    () => buildRecentActivity(resources, events, 7),
    [events, resources],
  );
  const downloadTrendData = useMemo(
    () => buildDownloadActivity(downloads, 7),
    [downloads],
  );

  const keyMetrics = [
    {
      title: "Image files",
      value: formatCompactNumber(photoResources.length),
      trend: `${getPublishedItems(photoResources).length} published`,
      icon: ImagePlus,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      title: "Files",
      value: formatCompactNumber(fileResources.length),
      trend: `${getPublishedItems(fileResources).length} published`,
      icon: FileText,
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      title: "Audio",
      value: formatCompactNumber(audioResources.length),
      trend: "Literature story files",
      icon: Headphones,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Event Videos",
      value: formatCompactNumber(health.videoEvents.length),
      trend: `${summary.published_events} published`,
      icon: Video,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Downloads",
      value: formatCompactNumber(summary.total_downloads || downloads.length),
      trend: `${summary.downloads_today || 0} today`,
      icon: Download,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <Motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <Motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Catalog analytics
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Measure the catalog using the same categories and filters students use.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-soft">
          <Calendar size={16} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Live Neon snapshot</span>
        </div>
      </Motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {keyMetrics.map((metric, index) => (
          <Motion.div key={metric.title} variants={itemVariants}>
            <Card animate delay={index * 0.04} className="flex h-full items-center gap-4 p-5">
              <div className={`rounded-lg p-3 ${metric.bg}`}>
                <metric.icon size={20} className={metric.color} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{metric.title}</p>
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{metric.value}</h3>
                  <span className="rounded border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                    {metric.trend}
                  </span>
                </div>
              </div>
            </Card>
          </Motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Creation Trend</h3>
              <p className="text-sm text-slate-500">Resources and event videos created over the last 7 days</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="analyticsResources" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="analyticsEvents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="resources"
                    name="Resources"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fill="url(#analyticsResources)"
                  />
                  <Area
                    type="monotone"
                    dataKey="events"
                    name="Event videos"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#analyticsEvents)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Motion.div>

        <Motion.div variants={itemVariants}>
          <Card className="flex h-full flex-col">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-slate-900">Category Distribution</h3>
              <p className="text-sm text-slate-500">Study files by required category</p>
            </div>
            <div className="min-h-[250px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={82}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.id} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Motion.div>

        <Motion.div variants={itemVariants} className="lg:col-span-3">
          <Card>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Grade Coverage</h3>
                <p className="text-sm text-slate-500">Study resources and Khmer audio by grade</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600">
                <TrendingUp size={16} className="text-slate-400" />
                Grades 9-12
              </span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={gradeData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  barSize={32}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
                  <Bar dataKey="resources" name="Study resources" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="audio" name="Khmer audio" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Motion.div>

        <Motion.div variants={itemVariants} className="lg:col-span-3">
          <Card>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Download Activity</h3>
                <p className="text-sm text-slate-500">Student file opens recorded over the last 7 days</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600">
                <Download size={16} className="text-slate-400" />
                Real clicks
              </span>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={downloadTrendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="analyticsDownloads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="downloads"
                    name="Downloads"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#analyticsDownloads)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Motion.div>

        <Motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Top Subjects</h3>
              <p className="text-sm text-slate-500">Most uploaded subjects in the study resource library</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subjectData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  barSize={28}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="uploads" name="Uploads" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Motion.div>

        <Motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-semibold text-slate-900">Missing Category Attention</h3>
            <p className="mt-1 text-sm text-slate-500">
              Categories with zero files should be uploaded first so filters never feel empty.
            </p>
            <div className="mt-5 space-y-3">
              {categoryCoverageData.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                >
                  <span className="text-sm font-medium text-slate-700">{category.labelEn}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      category.value > 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {category.value > 0 ? `${category.value} files` : "empty"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Motion.div>
      </div>
    </Motion.div>
  );
}
