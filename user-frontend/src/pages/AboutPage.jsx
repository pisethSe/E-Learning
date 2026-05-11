import React from "react";
import { BookOpen, Headphones, Layers3, Sparkles } from "lucide-react";
import Footer from "@/components/layout/Footer";

const aboutContent = {
  km: {
    eyebrow: "អំពីវេទិកា",
    title: "វេទិកាសិក្សាសម្រាប់សិស្សថ្នាក់ទី ៩ ដល់ ១២",
    subtitle:
      "Grade A ត្រូវបានរៀបចំឡើងដើម្បីឱ្យសិស្សស្វែងរកឯកសារ និងសំឡេងមេរៀនបានលឿន ស្អាត និងងាយស្រួលប្រើ។",
    intro:
      "យើងប្រមូលឯកសារ វិញ្ញាសា លំហាត់ រូបមន្ត និងសំឡេងមេរៀនពីប្រភពដែលមានប្រយោជន៍ ហើយរៀបចំជាបទពិសោធន៍តែមួយដែលសិស្សអាចប្រើបានងាយទាំងលើទូរស័ព្ទ និងកុំព្យូទ័រ។",
    cards: [
      {
        title: "ឯកសាររៀបចំបានច្បាស់",
        description: "បែងចែកតាមថ្នាក់ មុខវិជ្ជា និងប្រភេទឯកសារ ដើម្បីឱ្យរកបានលឿន។",
      },
      {
        title: "សំឡេងមេរៀនងាយស្តាប់",
        description: "សិស្សអាចបើកស្តាប់មេរៀនបានភ្លាមៗពីទំព័រសំឡេងដោយមិនស្មុគស្មាញ។",
      },
      {
        title: "រចនាបថស្អាត និងទំនើប",
        description: "ផ្ទៃមុខត្រូវបានបង្កើតឱ្យសាមញ្ញ តែមានអារម្មណ៍ជាមុខងារដែលអាចទុកចិត្តបាន។",
      },
    ],
  },
  en: {
    eyebrow: "About The Platform",
    title: "A focused study hub for Grades 9 to 12",
    subtitle:
      "Grade A is designed to help students find documents and lesson audio quickly in a clean, easy-to-use experience.",
    intro:
      "We organize exam papers, exercises, formulas, documents, and audio lessons into one calm interface that feels professional on both desktop and mobile.",
    cards: [
      {
        title: "Clear resource structure",
        description: "Materials are organized by grade, subject, and resource type for faster access.",
      },
      {
        title: "Easy audio listening",
        description: "Students can open the audio page and start listening right away with less friction.",
      },
      {
        title: "Clean modern interface",
        description: "The product is intentionally simple, polished, and comfortable for everyday study use.",
      },
    ],
  },
};

const cardIcons = [BookOpen, Headphones, Layers3];

export default function AboutPage({ language = "km" }) {
  const content = aboutContent[language] ?? aboutContent.km;

  return (
    <>
      <main className="relative overflow-hidden px-4 pb-12 pt-28 sm:pt-28 md:px-8 lg:px-10 lg:pt-32 xl:px-16">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(226,232,240,0.9) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(226,232,240,0.9) 1px, transparent 1px)
            `,
            backgroundSize: "22px 28px",
            WebkitMaskImage:
              "radial-gradient(ellipse 72% 68% at 50% 18%, #000 60%, transparent 100%)",
            maskImage:
              "radial-gradient(ellipse 72% 68% at 50% 18%, #000 60%, transparent 100%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl">
          <section className="overflow-hidden rounded-[1.4rem] border border-black/10 bg-white/86 shadow-[0_28px_90px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:rounded-[2rem]">
            <div className="relative border-b border-black/10 px-4 py-6 sm:px-6 sm:py-7 md:px-8 md:py-8 lg:px-10">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white via-white/70 to-transparent" />

              <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)] lg:items-end">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/95 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-black/55 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    {content.eyebrow}
                  </div>

                  <h1 className="mt-5 text-3xl font-bold leading-tight text-black md:text-4xl lg:text-5xl">
                    {content.title}
                  </h1>

                  <p className="mt-4 max-w-3xl text-lg leading-8 text-black/68 md:text-xl">
                    {content.subtitle}
                  </p>
                </div>

                <div className="rounded-[1.6rem] border border-black/10 bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/42">
                    Grade A
                  </p>
                  <p className="mt-4 text-3xl font-bold tracking-tight text-black">
                    9-12
                  </p>
                  <p className="mt-2 text-sm leading-7 text-black/58">
                    {language === "km"
                      ? "ផ្តោតលើការរៀនសូត្រដែលមានរចនាសម្ព័ន្ធ សាមញ្ញ និងអាចប្រើបានជារៀងរាល់ថ្ងៃ។"
                      : "Focused on structured, simple, everyday learning support."}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:px-10">
              <div className="rounded-[1.7rem] border border-black/10 bg-[#fbfcfd] p-6 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
                <h2 className="text-xl font-bold text-black md:text-2xl">
                  {language === "km" ? "គោលបំណងរបស់យើង" : "Our purpose"}
                </h2>
                <p className="mt-4 text-[15px] leading-8 text-black/64 md:text-base">
                  {content.intro}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {content.cards.map((card, index) => {
                  const Icon = cardIcons[index];

                  return (
                    <article
                      key={card.title}
                      className="rounded-[1.55rem] border border-black/10 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)]"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-lg font-bold text-black">
                        {card.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-black/60">
                        {card.description}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer language={language} />
    </>
  );
}
