import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars

const SERVICES = [
  {
    id: "01",
    title: "ជ្រើសរើសតាមថ្នាក់",
    titleEn: "Choose by Grade",
    description:
      "សិស្សអាចស្វែងរកឯកសារតាមថ្នាក់ទី ៩ ១០ ១១ និង ១២ បានយ៉ាងឆាប់រហ័ស។",
    descriptionEn:
      "Students can quickly browse resources for Grades 9, 10, 11, and 12.",
    image: "/learning-steps/step-1.jpg",
  },
  {
    id: "02",
    title: "ទាញយកឯកសារ",
    titleEn: "Download Files",
    description:
      "ទាញយក កំណែលំហាត់ រូបមន្ត វិញ្ញាសា ឯកសារ និង E-book ដែល admin បានបញ្ចូលនៅកន្លែងតែមួយ។",
    descriptionEn:
      "Download answer keys, formulas, exam papers, documents, and e-books uploaded from the admin dashboard.",
    image: "/learning-steps/step-2.jpg",
  },
  {
    id: "03",
    title: "ស្តាប់សំឡេងមេរៀន",
    titleEn: "Listen To Audio",
    description:
      "ស្តាប់សំឡេងរឿងអក្សរសាស្ត្រខ្មែរ ដើម្បីជួយក្នុងការតែងសេចក្ដី និងការរំលឹកមេរៀនឡើងវិញ។",
    descriptionEn:
      "Listen to Khmer Literature story audio to support essay writing and revision.",
    image: "/learning-steps/step-3.jpg",
  },
  {
    id: "04",
    title: "ស្វែងរកតាមមុខវិជ្ជា",
    titleEn: "Find By Subject",
    description:
      "រៀបចំតាមមុខវិជ្ជាសំខាន់ៗ ដូចជា ខ្មែរ គណិតវិទ្យា គីមីវិទ្យា ជីវវិទ្យា និងផ្សេងៗ។",
    descriptionEn:
      "Resources are organized by key school subjects such as Khmer, Mathematics, Chemistry, Biology, and more.",
    image: "/learning-steps/step-4.jpg",
  },
  {
    id: "05",
    title: "ត្រៀមប្រឡងបានល្អ",
    titleEn: "Prepare Better",
    description:
      "ជួយសិស្សរៀនឡើងវិញ និងត្រៀមប្រឡងបានកាន់តែមានទំនុកចិត្តជាមួយឯកសារសំខាន់ៗ។",
    descriptionEn:
      "Help students revise and prepare for exams with the study materials they need most.",
    image: "/learning-steps/step-5.jpg",
  },
];

const AUTO_PLAY_DURATION = 5000;

export default function VerticalTabs({ language = "km" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeService = SERVICES[activeIndex];

  const handleNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % SERVICES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      handleNext();
    }, AUTO_PLAY_DURATION);

    return () => clearInterval(interval);
  }, [activeIndex, isPaused, handleNext]);

  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? "10%" : "-10%",
      opacity: 0,
      scale: 1.04,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir) => ({
      zIndex: 0,
      x: dir > 0 ? "-8%" : "8%",
      opacity: 0,
      scale: 0.98,
    }),
  };

  const isKhmer = language === "km";
  const activeTitle = isKhmer ? activeService.title : activeService.titleEn;
  const activeDescription = isKhmer
    ? activeService.description
    : activeService.descriptionEn;

  const textVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 34 : -34,
      opacity: 0,
      filter: "blur(6px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: (dir) => ({
      x: dir > 0 ? -34 : 34,
      opacity: 0,
      filter: "blur(6px)",
    }),
  };

  return (
    <section
      id="study-flow"
      className="relative w-full scroll-mt-24 overflow-hidden bg-[#f9fafb] py-8 md:scroll-mt-24 md:py-10 lg:py-12"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #d1d5db 1px, transparent 1px),
            linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)",
        }}
      />
      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-7xl items-center px-4 md:px-8 lg:min-h-[calc(100dvh-7rem)] lg:px-10 xl:px-16">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-5 md:gap-6">
          <div className="space-y-2">
            <h2 className="text-balance text-3xl font-bold leading-tight text-black md:text-4xl">
              {isKhmer
                ? "របៀបប្រើប្រាស់វេទិកា"
                : "How students use the platform"}
            </h2>
            <span
              className={`block text-[10px] font-semibold text-black/45 ${
                isKhmer ? "tracking-normal" : "uppercase tracking-normal"
              }`}
            >
              {isKhmer
                ? "(ជំហានសិក្សា និងទាញយកឯកសារ)"
                : "(STUDY AND DOWNLOAD FLOW)"}
            </span>
          </div>

          <div
            className="relative overflow-hidden rounded-2xl border border-black/10 bg-white/90 px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] backdrop-blur sm:px-5 sm:py-[1.125rem] md:px-6 md:py-5"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={activeService.id}
                custom={direction}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 260, damping: 28 },
                  opacity: { duration: 0.22 },
                  filter: { duration: 0.22 },
                }}
                className="grid min-w-0 gap-2"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-black/45">
                    /{activeService.id}
                  </span>
                  <span className="min-w-0 text-xl font-bold leading-tight text-black sm:text-2xl">
                    {activeTitle}
                  </span>
                </div>
                <p className="text-sm leading-6 text-black/62 sm:text-base sm:leading-7">
                  {activeDescription}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-black/8">
              <motion.div
                key={`text-progress-${activeIndex}-${isPaused}`}
                className="h-full origin-left bg-black"
                initial={{ scaleX: 0 }}
                animate={isPaused ? { scaleX: 0 } : { scaleX: 1 }}
                transition={{
                  duration: AUTO_PLAY_DURATION / 1000,
                  ease: "linear",
                }}
              />
            </div>
          </div>

          <div
            className="group/gallery relative mx-auto w-full"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="absolute -inset-3 rounded-2xl bg-white/58 blur-2xl" />
            <div className="relative aspect-[16/10] min-h-[214px] overflow-hidden rounded-2xl bg-[#dfe8ef] shadow-[0_18px_48px_rgba(15,23,42,0.13)] sm:min-h-[300px] md:min-h-[390px] lg:min-h-[470px]">
                <AnimatePresence
                  initial={false}
                  custom={direction}
                  mode="popLayout"
                >
                  <motion.div
                    key={activeIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 230, damping: 28 },
                      opacity: { duration: 0.35 },
                      scale: { duration: 0.45 },
                    }}
                    className="absolute inset-0 h-full w-full cursor-pointer"
                    onClick={handleNext}
                  >
                    <div
                      className="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat blur-2xl transition-transform duration-700 group-hover/gallery:scale-[1.15]"
                      style={{ backgroundImage: `url(${activeService.image})` }}
                    />
                    <div className="absolute inset-0 bg-white/35" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.1),rgba(15,23,42,0.18))]" />

                    <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3 md:p-4">
                      <img
                        src={activeService.image}
                        alt={activeService.title}
                        decoding="async"
                        loading="lazy"
                        className="block h-full w-full rounded-xl object-cover object-center drop-shadow-[0_18px_50px_rgba(15,23,42,0.18)] transition-transform duration-700 group-hover/gallery:scale-[1.015] sm:rounded-2xl"
                      />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/18 via-black/4 to-transparent" />
                  </motion.div>
                </AnimatePresence>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}
