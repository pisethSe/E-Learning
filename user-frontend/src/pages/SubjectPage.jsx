import React from "react";
import ResourceLibraryPage from "@/components/resources/ResourceLibraryPage";
import { getSubjectLabel } from "@/data/learningCatalog";

export default function SubjectPage({ subject = "Subject", language = "km" }) {
  const isKhmer = language === "km";
  const subjectLabel = getSubjectLabel(subject, language);

  return (
    <ResourceLibraryPage
      language={language}
      fixedSubject={subject}
      eyebrow={isKhmer ? "រៀបតាមមុខវិជ្ជា" : "Subject resources"}
      title={subjectLabel}
      description={
        isKhmer
          ? `ឯកសារ ${subjectLabel} សម្រាប់ថ្នាក់ទី ៩ ដល់ ១២។ អាចតម្រៀបតាមថ្នាក់ និងប្រភេទឯកសារដើម្បីរកមេរៀនបានឆាប់។`
          : `${subject} resources for Grades 9 to 12. Filter by grade and category to find the right material quickly.`
      }
    />
  );
}
