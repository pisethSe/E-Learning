import React from "react";

export default function GradePage({ grade }) {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-28 sm:pt-32">
      <h1 className="text-3xl font-bold text-black">
        {grade ? `Grade ${grade}` : "Grade"}
      </h1>
      <p className="mt-3 text-black/65">
        Grade-specific resources can be rendered here.
      </p>
    </main>
  );
}
