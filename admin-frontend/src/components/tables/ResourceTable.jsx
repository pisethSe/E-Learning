import React from "react";
import { ExternalLink, MoreVertical } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { resolveAssetUrl } from "../../services/api";

function getSourceLink(resource) {
  return resource.external_url || resolveAssetUrl(resource.file_path);
}

export default function ResourceTable({
  resources,
  onEdit,
  onDelete,
  isLoading,
}) {
  const liveCount = (resources || []).filter((resource) => resource.is_published).length;

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Resource library
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            {resources.length} items ready for the website
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Edit metadata, review publishing status, or open uploaded files.
          </p>
        </div>
        <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          {liveCount} live
        </span>
      </div>

      {isLoading ? (
        <div className="px-6 py-10 text-sm text-slate-500">Loading resources...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Grade</th>
                <th className="px-6 py-3 font-medium">Subject</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Open</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(resources.length ? resources : [{ id: "empty" }]).map((resource) => {
                if (resource.id === "empty") {
                  return (
                    <tr key="empty">
                      <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                        No resources uploaded yet.
                      </td>
                    </tr>
                  );
                }

                const sourceLink = getSourceLink(resource);

                return (
                  <tr key={resource.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{resource.title}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {resource.category || "general"}
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-600">{resource.file_type}</td>
                    <td className="px-6 py-4 text-slate-600">{resource.grade_level}</td>
                    <td className="px-6 py-4 text-slate-600">{resource.subject}</td>
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
                    <td className="px-6 py-4">
                      {sourceLink ? (
                        <a
                          href={sourceLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"
                        >
                          View
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="text-slate-400">No file</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(resource)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => onDelete(resource.id)}
                        >
                          Delete
                        </Button>
                        <button
                          type="button"
                          className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
