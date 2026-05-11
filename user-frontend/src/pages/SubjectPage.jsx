import React from "react";

export default function SubjectPage({ subject = "Subject" }) {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-28 sm:pt-32">
      <h1 className="text-3xl font-bold text-black">{subject}</h1>
      <p className="mt-3 text-black/65">
        Subject-specific resources can be rendered here.
      </p>
    </main>
  );
}
