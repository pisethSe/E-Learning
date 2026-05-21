import React from "react";
import ResourceLibraryPage from "@/components/resources/ResourceLibraryPage";

export default function SearchPage({ query = "", language = "km" }) {
  const isKhmer = language === "km";

  return (
    <ResourceLibraryPage
      key={query}
      language={language}
      initialQuery={query}
      eyebrow={isKhmer ? "ស្វែងរក" : "Search"}
      title={isKhmer ? "ស្វែងរកឯកសារសិក្សា" : "Search Study Resources"}
      description={
        query
          ? isKhmer
            ? `លទ្ធផលសម្រាប់ "${query}"។ អ្នកអាចបន្ថែមតម្រៀបតាមថ្នាក់ មុខវិជ្ជា និងប្រភេទឯកសារ។`
            : `Results for "${query}". You can refine by grade, subject, and category.`
          : isKhmer
            ? "ស្វែងរកឯកសារតាមចំណងជើង មុខវិជ្ជា ថ្នាក់ ឬប្រភេទឯកសារ។"
            : "Search by title, subject, grade, or resource category."
      }
    />
  );
}
