import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
      "ទាញយក កំណេរលំហាត់ រូបមន្ត វិញ្ញាសា ឯកសារ និង E-book ដែលប្រមូលពី channel Telegram bacii26w បាននៅកន្លែងតែមួយ។",
    descriptionEn:
      "Download exercises, formulas, exam papers, documents, and e-books collected from the bacii26w Telegram channel in one place.",
    image: "/learning-steps/step-2.jpg",
  },
  {
    id: "03",
    title: "ស្តាប់សំឡេងមេរៀន",
    titleEn: "Listen To Audio",
    description:
      "ស្តាប់សំឡេងមេរៀនពីប្រភព Telegram channel ដើម្បីជួយក្នុងការស្វ័យសិក្សា និងការរំលឹកមេរៀនឡើងវិញ។",
    descriptionEn:
      "Listen to lesson audio from the Telegram source to support self-study and reinforce revision.",
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

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + SERVICES.length) % SERVICES.length);
  }, []);

  const handleTabClick = (index) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setIsPaused(false);
  };

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
        <div className="grid w-full grid-cols-1 items-center gap-7 md:gap-9 lg:grid-cols-[0.86fr_1.14fr] lg:gap-12 xl:gap-14">
          {/* Left Column: Content */}
          <div className="order-2 flex flex-col justify-center pt-0 lg:order-1 lg:pt-2">
            <div className="mb-5 space-y-2 md:mb-6">
              <h2 className="text-balance text-3xl font-bold leading-tight text-black md:text-4xl">
                {isKhmer
                  ? "របៀបប្រើប្រាស់វេទិកា"
                  : "How students use the platform"}
              </h2>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.26em] text-black/45">
                {isKhmer
                  ? "(ជំហានសិក្សា និងទាញយកឯកសារ)"
                  : "(STUDY AND DOWNLOAD FLOW)"}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {SERVICES.map((service, index) => {
                const isActive = activeIndex === index;
                return (
                  <button
                    key={service.id}
                    onClick={() => handleTabClick(index)}
                    className={cn(
                      "group relative flex items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-500 md:gap-4 md:px-5",
                      isActive
                        ? "border-black/10 bg-white/90 text-black shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
                        : "border-transparent bg-transparent text-black/45 hover:border-black/10 hover:bg-white/60 hover:text-black",
                    )}
                  >
                    {/* Progress bar indicator */}
                    <div className="absolute bottom-4 left-0 top-4 w-[3px] rounded-full bg-black/10">
                      {isActive && (
                        <motion.div
                          key={`progress-${index}-${isPaused}`}
                          className="absolute left-0 top-0 w-full origin-top rounded-full bg-black"
                          initial={{ height: "0%" }}
                          animate={
                            isPaused ? { height: "0%" } : { height: "100%" }
                          }
                          transition={{
                            duration: AUTO_PLAY_DURATION / 1000,
                            ease: "linear",
                          }}
                        />
                      )}
                    </div>

                    <span className="mt-1 text-[10px] font-semibold tabular-nums opacity-60">
                      /{service.id}
                    </span>

                    <div className="flex flex-1 flex-col gap-2">
                      <span
                        className={cn(
                          "text-lg font-bold leading-tight transition-colors duration-500 md:text-xl",
                          isActive ? "text-black" : "",
                        )}
                      >
                        {isKhmer ? service.title : service.titleEn}
                      </span>

                      <AnimatePresence mode="wait">
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                              duration: 0.3,
                              ease: [0.23, 1, 0.32, 1],
                            }}
                            className="overflow-hidden"
                          >
                            <p className="max-w-md pb-1 text-sm font-normal leading-7 text-black/60">
                              {isKhmer
                                ? service.description
                                : service.descriptionEn}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Image Gallery */}
          <div className="order-1 flex h-full flex-col justify-center lg:order-2">
            <div
              className="group/gallery relative mx-auto w-full max-w-[780px]"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="absolute -inset-4 rounded-2xl bg-white/58 blur-2xl" />
              <div className="relative aspect-[16/10] min-h-[220px] overflow-hidden rounded-2xl bg-[#dfe8ef] shadow-[0_24px_70px_rgba(15,23,42,0.14)] sm:min-h-[300px] md:min-h-[360px] lg:min-h-[420px]">
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

                <div className="absolute left-4 top-4 z-20 rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-xs font-semibold text-black/70 shadow-sm backdrop-blur-xl md:left-5 md:top-5">
                  /{activeService.id}
                </div>

                <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 rounded-full border border-white/60 bg-white/80 px-4 py-3 shadow-[0_16px_34px_rgba(15,23,42,0.14)] backdrop-blur-xl md:bottom-5 md:px-5">
                  {/* Dot indicators */}
                  <div className="flex gap-1.5">
                    {SERVICES.map((service, i) => (
                      <button
                        key={service.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTabClick(i);
                        }}
                        className={cn(
                          "rounded-full transition-all duration-300",
                          i === activeIndex
                            ? "h-2 w-7 bg-black"
                            : "h-2 w-2 bg-black/20 hover:bg-black/45",
                        )}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/92 text-black transition-all hover:bg-white active:scale-90 md:h-10 md:w-10"
                      aria-label="Previous"
                    >
                      <ChevronLeft size={19} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/92 text-black transition-all hover:bg-white active:scale-90 md:h-10 md:w-10"
                      aria-label="Next"
                    >
                      <ChevronRight size={19} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
