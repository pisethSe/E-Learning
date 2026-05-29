import React, { useState } from "react";
import { Download, ExternalLink, FileText, Search } from "lucide-react";
import { Card } from "../components/ui/Card";
import { getCategoryLabel, getSubjectLabel } from "../data/learningCatalog";
import { resolveAdminResourcePreviewUrl, resolveAssetUrl } from "../services/api";

function formatDateTime(value) {
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
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function getTypeLabel(value) {
  if (value === "audio") {
    return "Audio";
  }

  if (value === "image" || value === "photo") {
    return "Image file";
  }

  return "File";
}

function getDownloadPreviewUrl(item) {
  if (item.resource_id) {
    return resolveAdminResourcePreviewUrl({ id: item.resource_id });
  }

  return resolveAssetUrl(item.target_url);
}

export default function DownloadPage({ downloads = [], isLoading }) {
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const todayKey = new Date().toISOString().slice(0, 10);

  const filteredDownloads = downloads.filter((item) => {
    if (!normalizedQuery) {
      return true;
    }

    return [
      item.resource_title,
      item.resource_subject,
      item.resource_category,
      item.resource_file_type,
      item.ip_address,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  const downloadsToday = downloads.filter((item) =>
    String(item.downloaded_at || "").startsWith(todayKey),
  ).length;
  const uniqueResources = new Set(downloads.map((item) => item.resource_id)).size;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Total downloads", value: downloads.length },
          { label: "Today", value: downloadsToday },
          { label: "Files opened", value: uniqueResources },
        ].map((metric) => (
          <Card key={metric.label} className="flex items-center gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Download size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">
                {formatNumber(metric.value)}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Download records</h2>
            <p className="mt-1 text-sm text-slate-500">
              Real student clicks from the public file buttons.
            </p>
          </div>

          <label className="flex h-11 w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500 shadow-sm md:max-w-sm">
            <Search size={18} className="text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent font-medium outline-none placeholder:text-slate-400"
              placeholder="Search downloads"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Resource</th>
                <th className="px-6 py-3">Grade</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Downloaded</th>
                <th className="px-6 py-3">IP</th>
                <th className="px-6 py-3">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(filteredDownloads.length ? filteredDownloads : [{ id: "empty" }]).map((item) => {
                if (item.id === "empty") {
                  return (
                    <tr key="empty">
                      <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-500">
                        {isLoading
                          ? "Loading download records..."
                          : normalizedQuery
                            ? "No download records match your search."
                            : "No downloads recorded yet."}
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          <FileText size={18} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-950">
                            {item.resource_title}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {getSubjectLabel(item.resource_subject)} · {getTypeLabel(item.resource_file_type)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">
                      {item.resource_grade_level ? `Grade ${item.resource_grade_level}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {getCategoryLabel(item.resource_category)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDateTime(item.downloaded_at)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.ip_address || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={getDownloadPreviewUrl(item)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"
                      >
                        View
                        <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
