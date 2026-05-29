import React, { useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Headphones,
} from "lucide-react";

const footerContent = {
  km: {
    brand: "មជ្ឈមណ្ឌលឯកសារ Grade A",
    headlineLines: [
      "ស្វែងរកឯកសារ និងមេរៀន",
      "សម្រាប់ការសិក្សារបស់អ្នក",
    ],
    description:
      "ចូលប្រើឯកសារ មេរៀនសំឡេង និងជំនួយវិញ្ញាសា សម្រាប់ថ្នាក់ទី ៩ ដល់ ១២ នៅកន្លែងតែមួយ ដោយមានការរៀបចំសាមញ្ញ និងងាយស្រួលប្រើ។",
    exploreTitle: "(ស្វែងរក)",
    contactTitle: "(ទំនាក់ទំនង)",
    exploreLinks: [
      { label: "ទំព័រដើម", href: "/#hero" },
      { label: "លំហូរសិក្សា", href: "/#study-flow" },
      { label: "ឯកសារ", href: "/#resources" },
    ],
    contactLinks: [
      { label: "បណ្ណាល័យសៀវភៅ", href: "/#resources", icon: BookOpen },
      { label: "ជំនួយសំឡេង", href: "/audio", icon: Headphones },
    ],
    noteCards: [
      {
        title: "ញញឹម",
        author: "អនាមិក",
        detail: "សម្រាកខ្លីៗ ហើយចាប់ផ្តើមមេរៀនបន្ទាប់ដោយចិត្តស្ងប់។",
        kind: "smile",
        rotate: "sm:-rotate-3",
      },
      {
        title: "បន្តរៀន",
        author: "Grade A",
        detail: "រៀនតិចៗរៀងរាល់ថ្ងៃ ងាយចាំជាងរៀនច្រើនក្នុងពេលតែមួយ។",
        kind: "squiggle",
        rotate: "sm:rotate-3",
      },
      {
        title: "ផ្កាយសិក្សា",
        author: "អនាមិក",
        detail: "កត់ត្រាចំណុចសំខាន់ ៣ ចំណុចបន្ទាប់ពីអានឯកសារនីមួយៗ។",
        kind: "star",
        rotate: "sm:-rotate-2",
      },
      {
        title: "សួស្តី",
        author: "អនាមិក",
        detail: "ចាប់ផ្តើមពីមុខវិជ្ជាដែលពិបាកជាងគេ ពេលថាមពលនៅល្អ។",
        kind: "spark",
        rotate: "sm:rotate-2",
      },
      {
        title: "អ្នកធ្វើបាន",
        author: "Grade A",
        detail: "បើមិនទាន់យល់ សាកល្បងស្តាប់សំឡេង ឬមើលឯកសារម្តងទៀត។",
        kind: "heart",
        rotate: "sm:-rotate-3",
      },
      {
        title: "ជួបគ្នាម្តងទៀត",
        author: "អនាមិក",
        detail: "រក្សាឯកសារដែលចូលចិត្ត ហើយត្រឡប់មករៀនឡើងវិញថ្ងៃស្អែក។",
        kind: "plane",
        rotate: "sm:rotate-3",
      },
    ],
    tipTitle: "គន្លឹះសិក្សា",
    credit: "បង្កើតដោយ : Se Piseth",
    footerLine: "ឯកសារ មេរៀនសំឡេង និងជំនួយវិញ្ញាសា នៅកន្លែងតែមួយ។",
  },
  en: {
    brand: "Grade A Resource Hub",
    headingTop: "Ready to create",
    headingTopAccent: "something useful",
    headingBottomIntro: "or just explore",
    headingBottomAccent: "the study library",
    description:
      "Clean access to documents, audio lessons, and exam support for Grades 9 to 12 with a soft white footer that keeps the same calm texture as the rest of the page.",
    exploreTitle: "(Explore)",
    contactTitle: "(Contact)",
    exploreLinks: [
      { label: "HOME", href: "/#hero" },
      { label: "STUDY FLOW", href: "/#study-flow" },
      { label: "RESOURCES", href: "/#resources" },
    ],
    contactLinks: [
      { label: "BOOK LIBRARY", href: "/#resources", icon: BookOpen },
      { label: "AUDIO SUPPORT", href: "/audio", icon: Headphones },
    ],
    noteCards: [
      {
        title: "happy face",
        author: "Anonymous",
        detail: "Take a short pause, then begin the next lesson with a clear mind.",
        kind: "smile",
        rotate: "sm:-rotate-3",
      },
      {
        title: "keep learning",
        author: "Grade A",
        detail: "A little study every day is easier to remember than one long session.",
        kind: "squiggle",
        rotate: "sm:rotate-3",
      },
      {
        title: "study star",
        author: "Anonymous",
        detail: "Write down three key points after each file you read.",
        kind: "star",
        rotate: "sm:-rotate-2",
      },
      {
        title: "hello",
        author: "Anonymous",
        detail: "Start with the hardest subject while your energy is still strong.",
        kind: "spark",
        rotate: "sm:rotate-2",
      },
      {
        title: "you can do it",
        author: "Grade A",
        detail: "If it is unclear, listen again or reopen the document later.",
        kind: "heart",
        rotate: "sm:-rotate-3",
      },
      {
        title: "see you",
        author: "Anonymous",
        detail: "Keep the useful files close and review them again tomorrow.",
        kind: "plane",
        rotate: "sm:rotate-3",
      },
    ],
    tipTitle: "Study Tip",
    credit: "Created by : Se Piseth",
    footerLine: "Study materials, audio lessons, and exam support in one place.",
  },
};

const footerGridStyle = {
  backgroundImage: `
    linear-gradient(to right, #d1d5db 1px, transparent 1px),
    linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
  `,
  backgroundSize: "32px 32px",
};

const footerGridLeftStyle = {
  ...footerGridStyle,
  WebkitMaskImage:
    "radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)",
  maskImage:
    "radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)",
};

const footerGridRightStyle = {
  ...footerGridStyle,
  WebkitMaskImage:
    "radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)",
  maskImage:
    "radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)",
};

function FooterLink({
  href,
  label,
  external = false,
  icon: Icon,
  isKhmer = false,
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={`group flex items-center gap-2 text-black/80 transition-all duration-300 hover:translate-x-1 hover:text-black ${
        isKhmer ? "text-sm font-bold tracking-normal" : "text-base font-medium tracking-wide"
      }`}
    >
      {Icon ? <Icon className="h-4 w-4 text-black/40 transition-colors group-hover:text-black" /> : null}
      <span>{label}</span>
      {external ? (
        <ArrowUpRight className="h-4 w-4 text-black/45 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-black" />
      ) : null}
    </a>
  );
}

const burstPalette = {
  smile: "#d4a514",
  squiggle: "#343434",
  star: "#e85aa8",
  spark: "#343434",
  heart: "#e39f55",
  plane: "#343434",
};

const burstParticles = [
  { dx: -88, dy: -62, scale: 0.56, rotate: -18, delay: 0 },
  { dx: -58, dy: -108, scale: 0.42, rotate: 14, delay: 24 },
  { dx: 0, dy: -126, scale: 0.5, rotate: -8, delay: 8 },
  { dx: 64, dy: -98, scale: 0.46, rotate: 18, delay: 34 },
  { dx: 94, dy: -34, scale: 0.58, rotate: 26, delay: 12 },
  { dx: 68, dy: 52, scale: 0.4, rotate: -16, delay: 42 },
  { dx: -16, dy: 82, scale: 0.48, rotate: 12, delay: 18 },
  { dx: -82, dy: 28, scale: 0.44, rotate: -28, delay: 32 },
];

function Doodle({ kind, className = "h-16 w-16" }) {
  const props = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "4",
  };

  if (kind === "smile") {
    return (
      <svg viewBox="0 0 120 120" className={`${className} text-[#d4a514]`}>
        <circle cx="60" cy="60" r="38" {...props} />
        <circle cx="47" cy="50" r="3" fill="currentColor" stroke="none" />
        <circle cx="73" cy="50" r="3" fill="currentColor" stroke="none" />
        <path d="M42 72c6 9 30 9 36 0" {...props} />
      </svg>
    );
  }

  if (kind === "star") {
    return (
      <svg viewBox="0 0 120 120" className={`${className} text-[#e85aa8]`}>
        <path
          d="M60 18 71 45l29 2-22 18 7 29-25-16-25 16 7-29-22-18 29-2z"
          {...props}
        />
      </svg>
    );
  }

  if (kind === "heart") {
    return (
      <svg viewBox="0 0 120 120" className={`${className} text-[#e39f55]`}>
        <path
          d="M60 90 26 56c-9-9-9-24 0-33 9-9 24-9 33 0l1 1 1-1c9-9 24-9 33 0 9 9 9 24 0 33z"
          {...props}
        />
      </svg>
    );
  }

  if (kind === "plane") {
    return (
      <svg viewBox="0 0 120 120" className={`${className} text-black/80`}>
        <path d="M20 65 98 28 74 95 58 68z" {...props} />
        <path d="M58 68 44 84" {...props} />
      </svg>
    );
  }

  if (kind === "spark") {
    return (
      <svg viewBox="0 0 120 120" className={`${className} text-black/80`}>
        <path d="M60 18v18" {...props} />
        <path d="M60 84v18" {...props} />
        <path d="M18 60h18" {...props} />
        <path d="M84 60h18" {...props} />
        <path d="m34 34 12 12" {...props} />
        <path d="m74 74 12 12" {...props} />
        <path d="m86 34-12 12" {...props} />
        <path d="M46 74 34 86" {...props} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 120" className={`${className} text-black/80`}>
      <path d="M20 74c10-18 22-28 34-28s20 9 29 9c8 0 13-6 17-13" {...props} />
      <path d="M24 94c17-16 33-18 46-10 12 8 23 6 30-8" {...props} />
    </svg>
  );
}

function NoteBurst({ burst }) {
  if (!burst) return null;

  const color = burstPalette[burst.kind] ?? burstPalette.spark;
  const sharedStyle = {
    "--burst-x": `${burst.x}px`,
    "--burst-y": `${burst.y}px`,
    "--burst-color": color,
  };

  return (
    <div key={burst.id} className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <span className="footer-note-burst-ring" style={sharedStyle} />
      <span className="footer-note-burst-glow" style={sharedStyle} />
      <span className="footer-note-burst-hero" style={sharedStyle}>
        <Doodle kind={burst.kind} className="h-12 w-12" />
      </span>
      {burstParticles.map((particle, index) => (
        <span
          key={`${burst.id}-${index}`}
          className="footer-note-burst-particle"
          style={{
            ...sharedStyle,
            "--burst-dx": `${particle.dx}px`,
            "--burst-dy": `${particle.dy}px`,
            "--burst-scale": particle.scale,
            "--burst-rotate": `${particle.rotate}deg`,
            "--burst-delay": `${particle.delay}ms`,
          }}
        >
          <Doodle kind={burst.kind} className="h-7 w-7" />
        </span>
      ))}
    </div>
  );
}

function NoteCard({
  title,
  author,
  kind,
  rotate,
  isActive = false,
  isKhmer = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`group relative flex min-h-[118px] w-full flex-col justify-between overflow-hidden rounded-xl border p-3 text-left shadow-[0_12px_26px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:rotate-0 active:scale-[0.985] sm:min-h-[150px] sm:rounded-sm ${
        isActive
          ? "border-black bg-white text-black shadow-[0_18px_38px_rgba(15,23,42,0.10)]"
          : "border-black/10 bg-[#fffdf8] text-black hover:border-black/18"
      } ${rotate}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-8 h-20 w-20 -translate-x-1/2 rounded-full opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-25 ${
          isActive ? "bg-black/10" : "bg-white"
        }`}
      />
      <div className="relative flex justify-center pt-0.5 sm:pt-1">
        <span className={isActive ? "footer-note-active-doodle" : "transition-transform duration-300 group-hover:scale-110"}>
          <Doodle kind={kind} />
        </span>
      </div>
      <div
        className={`relative border-t border-black/10 ${
          isKhmer ? "space-y-0.5 pt-1.5" : "space-y-1 pt-2"
        }`}
      >
        <p
          className={`leading-4 text-black/80 ${
            isKhmer
              ? "text-[10px] font-bold leading-[1.35]"
              : "text-[11px] font-semibold"
          }`}
        >
          {title}
        </p>
        <p
          className={`text-black/35 ${
            isKhmer
              ? "text-[9px] font-semibold leading-[1.25] tracking-normal"
              : "text-[10px] uppercase tracking-[0.2em]"
          }`}
        >
          {author}
        </p>
      </div>
    </button>
  );
}

export default function Footer({ language = "km" }) {
  const content = footerContent[language] ?? footerContent.km;
  const isKhmer = language === "km";
  const [activeNoteIndex, setActiveNoteIndex] = useState(1);
  const [burst, setBurst] = useState(null);
  const noteStageRef = useRef(null);
  const burstIdRef = useRef(0);
  const activeNote = content.noteCards[activeNoteIndex] ?? content.noteCards[0];

  const handleNotePress = (index, kind, event) => {
    setActiveNoteIndex(index);

    if (!noteStageRef.current) return;

    const stageRect = noteStageRef.current.getBoundingClientRect();
    burstIdRef.current += 1;
    setBurst({
      id: `${kind}-${burstIdRef.current}`,
      kind,
      x: event.clientX - stageRect.left,
      y: event.clientY - stageRect.top,
    });
  };

  return (
    <footer
      id="footer"
      className="relative w-full overflow-hidden border-t border-black/10 bg-[#f9fafb] text-black"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={footerGridLeftStyle}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={footerGridRightStyle}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-52 bg-[linear-gradient(to_bottom,rgba(249,250,251,0.3),rgba(249,250,251,0))]"
      />

      <div
        className={`relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${
          isKhmer ? "py-14 lg:py-20" : "py-16 lg:py-24"
        }`}
      >
        <div
          className={`flex items-center text-black/55 ${
            isKhmer
              ? "gap-2.5 text-xs font-bold tracking-normal"
              : "gap-3 text-sm font-semibold uppercase tracking-[0.18em]"
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-black" />
          <span>{content.brand}</span>
        </div>

        <div
          className={`grid lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,380px)] lg:items-start ${
            isKhmer ? "mt-6 gap-10 lg:gap-12" : "mt-8 gap-14"
          }`}
        >
          <div className="max-w-5xl">
            {isKhmer ? (
              <h2
                className="text-[clamp(2.35rem,5vw,4rem)] font-bold leading-[1.14] tracking-normal text-black"
                style={{ fontFamily: "var(--font-kantumruy)" }}
              >
                {content.headlineLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            ) : (
              <h2
                className="text-[clamp(3rem,7vw,5.75rem)] leading-[0.92] tracking-[-0.045em] text-black"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {content.headingTop} <span className="italic">{content.headingTopAccent}</span>{" "}
                together,
                <span className="mt-3 block">
                  {content.headingBottomIntro} <span className="italic">{content.headingBottomAccent}</span>
                </span>
              </h2>
            )}

            <p
              className={`max-w-2xl text-black/60 ${
                isKhmer
                  ? "mt-4 text-sm leading-[1.75] font-semibold sm:text-base"
                  : "mt-6 text-base leading-7 sm:text-lg"
              }`}
            >
              {content.description}
            </p>
          </div>

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              isKhmer ? "gap-8" : "gap-10"
            }`}
          >
            <div className={isKhmer ? "space-y-3.5" : "space-y-5"}>
              <p
                className={`text-black/45 ${
                  isKhmer
                    ? "text-xs font-bold tracking-normal"
                    : "text-sm font-semibold uppercase tracking-[0.18em]"
                }`}
              >
                {content.exploreTitle}
              </p>
              <div className={isKhmer ? "space-y-3" : "space-y-4"}>
                {content.exploreLinks.map((link) => (
                  <FooterLink key={link.label} isKhmer={isKhmer} {...link} />
                ))}
              </div>
            </div>

            <div className={isKhmer ? "space-y-3.5" : "space-y-5"}>
              <p
                className={`text-black/45 ${
                  isKhmer
                    ? "text-xs font-bold tracking-normal"
                    : "text-sm font-semibold uppercase tracking-[0.18em]"
                }`}
              >
                {content.contactTitle}
              </p>
              <div className={isKhmer ? "space-y-3" : "space-y-4"}>
                {content.contactLinks.map((link) => (
                  <FooterLink key={link.label} isKhmer={isKhmer} {...link} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={isKhmer ? "mt-12" : "mt-16"}>
          <div
            ref={noteStageRef}
            className="relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] lg:items-stretch lg:gap-6"
          >
            <NoteBurst burst={burst} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
              {content.noteCards.map((card, index) => (
                <NoteCard
                  key={card.title}
                  isKhmer={isKhmer}
                  isActive={activeNoteIndex === index}
                  onClick={(event) => handleNotePress(index, card.kind, event)}
                  {...card}
                />
              ))}
            </div>

            <aside className="flex min-h-[148px] flex-col justify-between rounded-2xl border border-black/10 bg-white/88 p-4 shadow-[0_18px_42px_rgba(15,23,42,0.07)] backdrop-blur sm:p-5">
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p
                    className={`font-bold text-black/45 ${
                      isKhmer
                        ? "text-xs tracking-normal"
                        : "text-xs uppercase tracking-normal"
                    }`}
                  >
                    {content.tipTitle}
                  </p>
                  <span
                    key={`${activeNote.kind}-${burst?.id ?? "initial"}`}
                    className="footer-note-tip-icon flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-[#fffdf8]"
                    style={{ "--burst-color": burstPalette[activeNote.kind] ?? burstPalette.spark }}
                  >
                    <Doodle kind={activeNote.kind} className="h-6 w-6" />
                  </span>
                </div>
                <h3 className="text-xl font-bold leading-tight text-black">
                  {activeNote.title}
                </h3>
                <p className="mt-3 text-sm font-semibold leading-7 text-black/62">
                  {activeNote.detail}
                </p>
              </div>
              <p className="mt-5 text-xs font-bold text-black/38">
                {activeNote.author}
              </p>
            </aside>
          </div>
        </div>

        <div
          className={`flex flex-col border-t border-black/10 text-black/55 sm:flex-row sm:items-center sm:justify-between ${
            isKhmer
              ? "mt-10 gap-2.5 pt-5 text-xs sm:text-sm"
              : "mt-14 gap-3 pt-6 text-sm"
          }`}
        >
          <p className={isKhmer ? "font-bold" : "font-medium"}>{content.credit}</p>
          <p className={isKhmer ? "font-semibold" : ""}>{content.footerLine}</p>
        </div>
      </div>
    </footer>
  );
}
