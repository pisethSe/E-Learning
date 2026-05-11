import React from "react";

export default function SearchPage({ query = "" }) {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-28 sm:pt-32">
      <h1 className="text-3xl font-bold text-black">Search</h1>
      <p className="mt-3 text-black/65">
        {query ? `Showing results for "${query}".` : "Search results will appear here."}
      </p>
    </main>
  );
}
