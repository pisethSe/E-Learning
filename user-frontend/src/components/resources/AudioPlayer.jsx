import React from "react";
import { Volume2 } from "lucide-react";

export default function AudioPlayer({
  src = "",
  title = "Audio lesson",
  className = "",
}) {
  if (!src) {
    return (
      <div
        className={`rounded-2xl border border-dashed border-black/15 bg-white/80 p-4 text-sm text-black/60 ${className}`.trim()}
      >
        <div className="mb-2 flex items-center gap-2 font-semibold text-black">
          <Volume2 className="h-4 w-4" />
          {title}
        </div>
        <p>Audio source is not available yet.</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-black/10 bg-white/90 p-4 shadow-sm ${className}`.trim()}
    >
      <div className="mb-3 flex items-center gap-2 font-semibold text-black">
        <Volume2 className="h-4 w-4" />
        {title}
      </div>
      <audio className="w-full" controls preload="none" src={src}>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
