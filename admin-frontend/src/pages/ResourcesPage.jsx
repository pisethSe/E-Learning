import React, { useState } from "react";
import ResourceUploadForm from "../components/forms/ResourceUploadForm";
import ResourceTable from "../components/tables/ResourceTable";

export default function ResourcesPage({
  resources,
  isLoading,
  isSaving,
  onSave,
  onDelete,
}) {
  const [editingResource, setEditingResource] = useState(null);

  function handleEdit(resource) {
    setEditingResource(resource);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave(payload) {
    const wasSaved = await onSave(payload);
    if (wasSaved) {
      setEditingResource(null);
    }
    return wasSaved;
  }

  return (
    <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[380px,1fr]">
      <ResourceUploadForm
        key={editingResource ? `resource-${editingResource.id}` : "resource-new"}
        resource={editingResource}
        onSubmit={handleSave}
        onCancel={() => setEditingResource(null)}
        isSaving={isSaving}
      />

      <ResourceTable
        resources={resources}
        onEdit={handleEdit}
        onDelete={onDelete}
        isLoading={isLoading}
      />
    </section>
  );
}
