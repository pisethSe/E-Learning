import React, { useState } from "react";
import ResourceUploadForm from "../components/forms/ResourceUploadForm";
import ResourceTable from "../components/tables/ResourceTable";

export default function ResourcesPage({
  mode = "file",
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
    <section className="space-y-6">
      <ResourceUploadForm
        key={editingResource ? `resource-${editingResource.id}` : `${mode}-new`}
        mode={mode}
        resource={editingResource}
        onSubmit={handleSave}
        onCancel={() => setEditingResource(null)}
        isSaving={isSaving}
      />

      <ResourceTable
        mode={mode}
        resources={resources}
        onEdit={handleEdit}
        onDelete={onDelete}
        isLoading={isLoading}
      />
    </section>
  );
}
