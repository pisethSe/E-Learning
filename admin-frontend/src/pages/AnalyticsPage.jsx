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
  FileText,
  MousePointerClick,
  TrendingUp,
  UploadCloud,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import {
  buildCountMap,
  buildRecentActivity,
  formatCompactNumber,
  getSummary,
  toSortedEntries,
} from "../utils/dashboard";

const COLORS = ["#4f46e5", "#3b82f6", "#0ea5e9", "#64748b"];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-card">
      <p className="mb-2 text-sm font-semibold text-slate-900">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-600">{entry.name}:</span>
          <span className="font-medium text-slate-900">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage({
  stats,
  resources,
  events,
}) {
  const summary = getSummary(stats);

  const trendData = useMemo(
    () => buildRecentActivity(resources, events, 7),
    [events, resources],
  );

  const typeData = [
    { name: "Documents", value: summary.total_documents },
    { name: "Images", value: summary.total_images },
    { name: "Audio", value: summary.total_audio },
    {
      name: "Events",
      value: summary.total_events,
    },
  ].filter((item) => item.value > 0);

  const subjectData = useMemo(
    () =>
      toSortedEntries(
        buildCountMap(resources || [], (item) => item.subject || "Unknown"),
      )
        .slice(0, 5)
        .map(([name, value]) => ({ name, views: value })),
    [resources],
  );

  const keyMetrics = [
    {
      title: "Total Content",
      value: formatCompactNumber(summary.total_resources + summary.total_events),
      trend: `${summary.published_resources + summary.published_events} live`,
      icon: UploadCloud,
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      title: "Publish Rate",
      value: `${summary.total_resources ? Math.round((summary.published_resources / summary.total_resources) * 100) : 0}%`,
      trend: "resources",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Event Publish Rate",
      value: `${summary.total_events ? Math.round((summary.published_events / summary.total_events) * 100) : 0}%`,
      trend: "events",
      icon: MousePointerClick,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Documents",
      value: formatCompactNumber(summary.total_documents),
      trend: `${summary.total_audio} audio`,
      icon: FileText,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
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
            Analytics
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Track your resource library and publishing performance.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-soft">
          <Calendar size={16} className="text-slate-400" />
          <select className="cursor-pointer bg-transparent text-sm font-medium text-slate-700 outline-none">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>All Time</option>
          </select>
        </div>
      </Motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {keyMetrics.map((metric, index) => (
          <Motion.div key={metric.title} variants={itemVariants}>
            <Card animate delay={index * 0.04} className="flex items-center gap-4 p-5">
              <div className={`rounded-lg p-3 ${metric.bg}`}>
                <metric.icon size={20} className={metric.color} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{metric.title}</p>
                <div className="flex items-baseline gap-2">
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
              <h3 className="text-lg font-semibold text-slate-900">Recent Creation Trend</h3>
              <p className="text-sm text-slate-500">Resources vs events created over the last 7 days</p>
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
                    name="Events"
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
              <h3 className="text-lg font-semibold text-slate-900">Content Distribution</h3>
              <p className="text-sm text-slate-500">Library split by content type</p>
            </div>
            <div className="min-h-[250px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
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
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Top Subjects</h3>
              <p className="text-sm text-slate-500">Most uploaded subjects in your resource library</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subjectData}
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
                  <Bar dataKey="views" name="Uploads" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Motion.div>
      </div>
    </Motion.div>
  );
}
