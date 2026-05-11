import React, { useMemo } from "react";
import { motion as Motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarRange,
  FileText,
  Image as ImageIcon,
  Music,
  UploadCloud,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import {
  buildRecentActivity,
  formatCompactNumber,
  getSummary,
} from "../utils/dashboard";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
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
  }).format(date);
}

export default function DashboardPage({
  stats,
  resources,
  events,
  isLoading,
}) {
  const summary = getSummary(stats);

  const trendData = useMemo(
    () => buildRecentActivity(resources, events, 7),
    [events, resources],
  );

  const storageBars = [
    {
      label: "Documents",
      value: summary.total_documents,
      total: summary.total_resources,
      color: "bg-primary-500",
    },
    {
      label: "Images",
      value: summary.total_images,
      total: summary.total_resources,
      color: "bg-blue-500",
    },
    {
      label: "Audio",
      value: summary.total_audio,
      total: summary.total_resources,
      color: "bg-indigo-500",
    },
  ];

  const recentResources = (resources || []).slice(0, 4);
  const upcomingEvents = (events || []).slice(0, 3);

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
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening with your content today.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/upload?tab=resources">
            <Button>
              <UploadCloud size={18} className="mr-2" />
              New Upload
            </Button>
          </Link>
          <Link to="/upload?tab=events">
            <Button variant="outline">
              <CalendarRange size={18} className="mr-2" />
              New Event
            </Button>
          </Link>
        </div>
      </Motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total Uploads",
            value: formatCompactNumber(summary.total_resources),
            trend: `${summary.published_resources} live`,
            icon: UploadCloud,
            color: "text-primary-600",
            bg: "bg-primary-50",
          },
          {
            title: "Documents",
            value: formatCompactNumber(summary.total_documents),
            trend: `${summary.total_images} images`,
            icon: FileText,
            color: "text-slate-700",
            bg: "bg-slate-100",
          },
          {
            title: "Audio Lessons",
            value: formatCompactNumber(summary.total_audio),
            trend: `${summary.total_resources} resources`,
            icon: Music,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
          {
            title: "Events",
            value: formatCompactNumber(summary.total_events),
            trend: `${summary.published_events} published`,
            icon: CalendarRange,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
        ].map((stat, index) => (
          <Motion.div key={stat.title} variants={itemVariants}>
            <Card animate delay={index * 0.04} className="hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900">
                    {stat.value}
                  </h3>
                </div>
                <div className={`rounded-lg p-2.5 ${stat.bg}`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="flex items-center rounded-md bg-emerald-50 px-2 py-0.5 font-medium text-emerald-600">
                  <ArrowUpRight size={14} className="mr-1" />
                  {stat.trend}
                </span>
                <span className="ml-2 text-xs text-slate-400">current snapshot</span>
              </div>
            </Card>
          </Motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Motion.div variants={itemVariants}>
            <Card>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                  <p className="text-sm text-slate-500">Resources and events created over the last 7 days</p>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorResources" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                    <Tooltip
                      contentStyle={{
                        borderRadius: "0.75rem",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="resources"
                      name="Resources"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      fill="url(#colorResources)"
                    />
                    <Area
                      type="monotone"
                      dataKey="events"
                      name="Events"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#colorEvents)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Motion.div>

          <Motion.div variants={itemVariants}>
            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Recent Uploads</h3>
                  <p className="text-sm text-slate-500">Latest resources added to the public library</p>
                </div>
                <Link to="/upload?tab=resources">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-3 font-medium">Title</th>
                      <th className="px-6 py-3 font-medium">Type</th>
                      <th className="px-6 py-3 font-medium">Grade</th>
                      <th className="px-6 py-3 font-medium">Created</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(recentResources.length ? recentResources : [{ id: "empty" }]).map((resource) =>
                      resource.id === "empty" ? (
                        <tr key="empty">
                          <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-500">
                            {isLoading ? "Loading resources..." : "No resources uploaded yet."}
                          </td>
                        </tr>
                      ) : (
                        <tr key={resource.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-primary-50 p-2">
                                <ImageIcon size={16} className="text-primary-600" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{resource.title}</p>
                                <p className="text-xs text-slate-500">{resource.subject}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 capitalize text-slate-600">{resource.file_type}</td>
                          <td className="px-6 py-4 text-slate-600">Grade {resource.grade_level}</td>
                          <td className="px-6 py-4 text-slate-600">{formatDate(resource.created_at)}</td>
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
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </Motion.div>
        </div>

        <div className="space-y-6">
          <Motion.div variants={itemVariants}>
            <Card className="border-2 border-dashed border-slate-300 bg-slate-50 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-soft">
                <UploadCloud size={24} className="text-primary-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Quick Upload</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
                Jump straight into the resource or event upload workspace.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link to="/upload?tab=resources">
                  <Button size="sm" className="w-full">
                    Upload Resource
                  </Button>
                </Link>
                <Link to="/upload?tab=events">
                  <Button variant="outline" size="sm" className="w-full">
                    Create Event
                  </Button>
                </Link>
              </div>
            </Card>
          </Motion.div>

          <Motion.div variants={itemVariants}>
            <Card>
              <h3 className="text-base font-semibold text-slate-900">Resource Mix</h3>
              <div className="mt-5 space-y-5">
                {storageBars.map((item) => {
                  const percent =
                    item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;

                  return (
                    <div key={item.label}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className="text-slate-500">{item.value}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div
                          className={`h-2 rounded-full ${item.color}`}
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
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Upcoming Events</h3>
                <Link to="/upload?tab=events">
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {(upcomingEvents.length ? upcomingEvents : [{ id: "empty" }]).map((event) =>
                  event.id === "empty" ? (
                    <p key="empty" className="text-sm text-slate-500">
                      {isLoading ? "Loading events..." : "No events created yet."}
                    </p>
                  ) : (
                    <div
                      key={event.id}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <p className="font-medium text-slate-900">{event.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {event.location || "Location to be announced"}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-medium capitalize text-slate-600">
                          {event.status}
                        </span>
                        <span className="text-slate-400">{formatDate(event.event_date)}</span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </Card>
          </Motion.div>
        </div>
      </div>
    </Motion.div>
  );
}
