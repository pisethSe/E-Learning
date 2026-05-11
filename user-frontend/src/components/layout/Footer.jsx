import React from "react";
import {
  ArrowUpRight,
  BookOpen,
  Headphones,
  Star,
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
      { title: "ញញឹម", author: "អនាមិក", kind: "smile", rotate: "-rotate-6" },
      { title: "បន្តរៀន", author: "Grade A", kind: "squiggle", rotate: "rotate-12" },
      { title: "ផ្កាយសិក្សា", author: "អនាមិក", kind: "star", rotate: "-rotate-3" },
      { title: "សួស្តី", author: "អនាមិក", kind: "spark", rotate: "rotate-6" },
      { title: "អ្នកធ្វើបាន", author: "Grade A", kind: "heart", rotate: "-rotate-12" },
      { title: "ជួបគ្នាម្តងទៀត", author: "អនាមិក", kind: "plane", rotate: "rotate-9" },
    ],
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
      { title: "happy face", author: "Anonymous", kind: "smile", rotate: "-rotate-6" },
      { title: "keep learning", author: "Grade A", kind: "squiggle", rotate: "rotate-12" },
      { title: "study star", author: "Anonymous", kind: "star", rotate: "-rotate-3" },
      { title: "hello", author: "Anonymous", kind: "spark", rotate: "rotate-6" },
      { title: "you can do it", author: "Grade A", kind: "heart", rotate: "-rotate-12" },
      { title: "see you", author: "Anonymous", kind: "plane", rotate: "rotate-9" },
    ],
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
      className={`group flex items-center gap-2 tracking-wide text-black/80 transition-all duration-300 hover:translate-x-1 hover:text-black ${
        isKhmer ? "text-sm font-bold" : "text-base font-medium"
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

function Doodle({ kind }) {
  const props = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "4",
  };

  if (kind === "smile") {
    return (
      <svg viewBox="0 0 120 120" className="h-16 w-16 text-[#d4a514]">
        <circle cx="60" cy="60" r="38" {...props} />
        <circle cx="47" cy="50" r="3" fill="currentColor" stroke="none" />
        <circle cx="73" cy="50" r="3" fill="currentColor" stroke="none" />
        <path d="M42 72c6 9 30 9 36 0" {...props} />
      </svg>
    );
  }

  if (kind === "star") {
    return (
      <svg viewBox="0 0 120 120" className="h-16 w-16 text-[#e85aa8]">
        <path
          d="M60 18 71 45l29 2-22 18 7 29-25-16-25 16 7-29-22-18 29-2z"
          {...props}
        />
      </svg>
    );
  }

  if (kind === "heart") {
    return (
      <svg viewBox="0 0 120 120" className="h-16 w-16 text-[#e39f55]">
        <path
          d="M60 90 26 56c-9-9-9-24 0-33 9-9 24-9 33 0l1 1 1-1c9-9 24-9 33 0 9 9 9 24 0 33z"
          {...props}
        />
      </svg>
    );
  }

  if (kind === "plane") {
    return (
      <svg viewBox="0 0 120 120" className="h-16 w-16 text-black/80">
        <path d="M20 65 98 28 74 95 58 68z" {...props} />
        <path d="M58 68 44 84" {...props} />
      </svg>
    );
  }

  if (kind === "spark") {
    return (
      <svg viewBox="0 0 120 120" className="h-16 w-16 text-black/80">
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
    <svg viewBox="0 0 120 120" className="h-16 w-16 text-black/80">
      <path d="M20 74c10-18 22-28 34-28s20 9 29 9c8 0 13-6 17-13" {...props} />
      <path d="M24 94c17-16 33-18 46-10 12 8 23 6 30-8" {...props} />
    </svg>
  );
}

function NoteCard({ title, author, kind, rotate, isKhmer = false }) {
  return (
    <article
      className={`group flex h-[132px] w-[112px] flex-col justify-between rounded-sm border border-black/10 bg-[#fffdf8] p-3 shadow-[0_18px_32px_rgba(15,23,42,0.08)] transition-transform duration-300 hover:-translate-y-2 hover:rotate-0 sm:h-[150px] sm:w-[128px] ${rotate}`}
    >
      <div className="flex justify-center pt-1">
        <Doodle kind={kind} />
      </div>
      <div
        className={`border-t border-black/10 ${
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
          className={`tracking-[0.2em] text-black/35 ${
            isKhmer
              ? "text-[9px] font-semibold leading-[1.25]"
              : "text-[10px] uppercase"
          }`}
        >
          {author}
        </p>
      </div>
    </article>
  );
}

export default function Footer({ language = "km" }) {
  const content = footerContent[language] ?? footerContent.km;
  const isKhmer = language === "km";

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
          className={`flex items-center tracking-[0.18em] text-black/55 ${
            isKhmer
              ? "gap-2.5 text-xs font-bold"
              : "gap-3 text-sm font-semibold uppercase"
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
                className="text-[clamp(2.35rem,5vw,4rem)] font-bold leading-[1.14] tracking-[-0.025em] text-black"
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
                className={`tracking-[0.18em] text-black/45 ${
                  isKhmer ? "text-xs font-bold" : "text-sm font-semibold uppercase"
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
                className={`tracking-[0.18em] text-black/45 ${
                  isKhmer ? "text-xs font-bold" : "text-sm font-semibold uppercase"
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

        <div
          className={`relative flex flex-wrap items-end ${
            isKhmer
              ? "mt-12 gap-3.5 sm:gap-4.5 lg:gap-5"
              : "mt-16 gap-4 sm:gap-5 lg:gap-6"
          }`}
        >
          {content.noteCards.map((card) => (
            <NoteCard key={card.title} isKhmer={isKhmer} {...card} />
          ))}

          <div className="absolute -bottom-3 right-0 hidden rotate-[-14deg] lg:flex">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-black/10 bg-[#fffdf8] shadow-[0_18px_32px_rgba(15,23,42,0.08)]">
              <Star className="h-10 w-10 text-black/65" />
            </div>
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
