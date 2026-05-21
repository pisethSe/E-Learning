import React, { useEffect, useState } from "react";
import TextType from "../TextType";
import CardSwap, { Card } from "../CardSwap";
import InfiniteSlider from "@/components/core/InfiniteSlider";

const heroTextureStyle = {
  backgroundImage: `
    linear-gradient(to right, #d1d5db 1px, transparent 1px),
    linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
  `,
  backgroundSize: "32px 32px",
  WebkitMaskImage:
    "radial-gradient(ellipse 80% 80% at 0% 100%, #000 50%, transparent 90%)",
  maskImage:
    "radial-gradient(ellipse 80% 80% at 0% 100%, #000 50%, transparent 90%)",
};

const textbookCovers = [
  {
    src: "/book-covers/grade-9-social-studies.png",
    alt: "Grade 9 social studies textbook cover",
  },
  {
    src: "/book-covers/grade-9-science.jpg",
    alt: "Grade 9 science textbook cover",
  },
  {
    src: "/book-covers/grade-9-math.png",
    alt: "Grade 9 mathematics textbook cover",
  },
  {
    src: "/book-covers/grade-9-khmer.jpg",
    alt: "Grade 9 Khmer literature textbook cover",
  },
  {
    src: "/book-covers/grade-9-english.webp",
    alt: "Grade 9 English textbook cover",
  },
  {
    src: "/book-covers/grade-10-khmer.jpg",
    alt: "Grade 10 Khmer literature textbook cover",
  },
  {
    src: "/book-covers/grade-10-physics.png",
    alt: "Grade 10 physics textbook cover",
  },
  {
    src: "/book-covers/grade-10-social-studies.png",
    alt: "Grade 10 social studies textbook cover",
  },
  {
    src: "/book-covers/grade-10-math.jpg",
    alt: "Grade 10 mathematics textbook cover",
  },
  {
    src: "/book-covers/grade-10-chemistry.webp",
    alt: "Grade 10 chemistry textbook cover",
  },
  {
    src: "/book-covers/grade-10-earth-science.webp",
    alt: "Grade 10 earth science textbook cover",
  },
  {
    src: "/book-covers/grade-11-biology.jpg",
    alt: "Grade 11 biology textbook cover",
  },
  {
    src: "/book-covers/grade-11-math.webp",
    alt: "Grade 11 mathematics textbook cover",
  },
  {
    src: "/book-covers/grade-11-civics.webp",
    alt: "Grade 11 civics textbook cover",
  },
  {
    src: "/book-covers/grade-11-geography.webp",
    alt: "Grade 11 geography textbook cover",
  },
  {
    src: "/book-covers/grade-11-khmer.webp",
    alt: "Grade 11 Khmer literature textbook cover",
  },
  {
    src: "/book-covers/grade-11-history.png",
    alt: "Grade 11 history textbook cover",
  },
  {
    src: "/book-covers/grade-12-chemistry.png",
    alt: "Grade 12 chemistry textbook cover",
  },
  {
    src: "/book-covers/grade-12-khmer.webp",
    alt: "Grade 12 Khmer literature textbook cover",
  },
  {
    src: "/book-covers/grade-12-math.jpg",
    alt: "Grade 12 mathematics textbook cover",
  },
  {
    src: "/book-covers/grade-12-geography.jpg",
    alt: "Grade 12 geography textbook cover",
  },
  {
    src: "/book-covers/grade-12-civics.webp",
    alt: "Grade 12 civics textbook cover",
  },
  {
    src: "/book-covers/grade-12-physics.webp",
    alt: "Grade 12 physics textbook cover",
  },
];

const heroShowcaseImages = [
  {
    src: "/hero-showcase/subjects-poster.png",
    alt: "School subjects promotional poster",
  },
  {
    src: "/hero-showcase/study-platform-poster.png",
    alt: "Study platform welcome poster",
  },
  {
    src: "/hero-showcase/resource-access-poster.png",
    alt: "Study materials resource access poster",
  },
  {
    src: "/hero-showcase/study-platform.png",
    alt: "Study platform promotional poster",
  },
  {
    src: "/hero-showcase/subjects.png",
    alt: "Subjects promotional poster",
  },
  {
    src: "/hero-showcase/study-materials.png",
    alt: "Study materials promotional poster",
  },
  {
    src: "/book-covers/grade-12-math.jpg",
    alt: "Grade 12 mathematics textbook cover",
  },
  {
    src: "/book-covers/grade-11-biology.jpg",
    alt: "Grade 11 biology textbook cover",
  },
  {
    src: "/book-covers/grade-10-physics.png",
    alt: "Grade 10 physics textbook cover",
  },
];

const heroContent = {
  km: {
    title: "បណ្ណាល័យសិក្សាថ្នាក់ទី ៩-១២",
    quotes: [
      "ទាញយក កំណេរលំហាត់ រូបមន្ត វិញ្ញាសា ឯកសារ និង E-book បានយ៉ាងងាយស្រួល។",
      "ស្តាប់សំឡេងមេរៀនបានគ្រប់ពេល សម្រាប់ជំនួយការស្វ័យសិក្សា។",
      "សម្រាប់សិស្សថ្នាក់ទី ៩ ដល់ ១២ រៀបចំតាមថ្នាក់ និងមុខវិជ្ជា។",
      "មេរៀនសិក្សាដែលជួយត្រៀមប្រឡង និងពង្រឹងការយល់ដឹងប្រចាំថ្ងៃ។",
      "សិក្សាបានលឿន ស្វែងរកបានងាយ និងប្រើប្រាស់បានជារៀងរាល់ថ្ងៃ។",
    ],
    primaryButton: "ស្វែងរកឯកសារ",
    secondaryButton: "ស្តាប់សំឡេង",
    sourceLabel: "ប្រភពទិន្នន័យ",
    sourceValue: "Telegram channel @bacii26w",
    stats: [
      { value: "9-12", label: "ថ្នាក់សិក្សា" },
      { value: "5", label: "ប្រភេទឯកសារ" },
      { value: "Audio", label: "មេរៀនសំឡេង" },
    ],
    sliderEyebrow: "សៀវភៅ និង E-book",
    sliderTitle: "សៀវភៅសិក្សា និង E-book សម្រាប់ថ្នាក់ទី ៩ ដល់ ១២",
    sliderDescription:
      "ដាក់កណ្តុរលើគម្របសៀវភៅណាមួយ ដើម្បីឱ្យល្បឿនស្លាយថយចុះ និងមើលបណ្ណាល័យសិក្សាបានកាន់តែច្បាស់។",
  },
  en: {
    title: "Study Library For Grades 9-12",
    quotes: [
      "Download exercises, formulas, exam papers, documents, and e-books in one place.",
      "Listen to audio lessons anytime to support self-study and revision.",
      "Organized for Grade 9 to Grade 12 students by grade and subject.",
      "Built to help students prepare for exams and strengthen daily learning.",
      "Fast to browse, easy to search, and useful every day.",
    ],
    primaryButton: "Browse resources",
    secondaryButton: "Listen to audio",
    sourceLabel: "Source",
    sourceValue: "Telegram channel @bacii26w",
    stats: [
      { value: "9-12", label: "Grade levels" },
      { value: "5", label: "Resource types" },
      { value: "Audio", label: "Lesson support" },
    ],
    sliderEyebrow: "Books And E-books",
    sliderTitle: "Textbooks and e-books for Grade 9 to Grade 12 students",
    sliderDescription:
      "Hover over the row to slow the slider and browse the study library more comfortably.",
  },
};

const getHeroCardConfig = () => {
  if (typeof window === "undefined") {
    return {
      width: 450,
      height: 600,
      cardDistance: 14,
      verticalDistance: 14,
      skewAmount: 2,
      containerClassName:
        "-translate-x-[13%] translate-y-[2%] scale-100 max-[1280px]:-translate-x-[14%] max-[1280px]:scale-[0.94] max-[1024px]:-translate-x-[5%] max-[1024px]:translate-y-[1%] max-[1024px]:scale-[0.8] max-[768px]:translate-x-[18%] max-[768px]:translate-y-[8%] max-[768px]:scale-[0.58]",
    };
  }

  const viewportWidth = window.innerWidth;

  if (viewportWidth <= 380) {
    return {
      width: 244,
      height: 325,
      cardDistance: 0,
      verticalDistance: 0,
      skewAmount: 0,
      containerClassName:
        "right-1/2 translate-x-1/2 translate-y-[1%] scale-100 origin-bottom",
    };
  }

  if (viewportWidth <= 640) {
    return {
      width: 280,
      height: 373,
      cardDistance: 0,
      verticalDistance: 0,
      skewAmount: 0,
      containerClassName:
        "right-1/2 translate-x-1/2 translate-y-[1%] scale-100 origin-bottom",
    };
  }

  return {
    width: 450,
    height: 600,
    cardDistance: 14,
    verticalDistance: 14,
    skewAmount: 2,
    containerClassName:
      "-translate-x-[13%] translate-y-[2%] scale-100 max-[1280px]:-translate-x-[14%] max-[1280px]:scale-[0.94] max-[1024px]:-translate-x-[5%] max-[1024px]:translate-y-[1%] max-[1024px]:scale-[0.8] max-[768px]:translate-x-[18%] max-[768px]:translate-y-[8%] max-[768px]:scale-[0.58]",
  };
};

const useHeroCardConfig = () => {
  const [config, setConfig] = useState(getHeroCardConfig);

  useEffect(() => {
    const updateConfig = () => setConfig(getHeroCardConfig());

    updateConfig();
    window.addEventListener("resize", updateConfig);

    return () => window.removeEventListener("resize", updateConfig);
  }, []);

  return config;
};

const HeroSection = ({ language = "km" }) => {
  const content = heroContent[language] ?? heroContent.km;
  const heroCardConfig = useHeroCardConfig();

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full scroll-mt-28 overflow-hidden bg-[#f9fafb] pt-[7.25rem] sm:scroll-mt-32 sm:min-h-[100svh] sm:pt-[7.75rem] md:scroll-mt-24 md:pt-[5.75rem] lg:pt-[5.25rem]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={heroTextureStyle}
      />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-7.25rem)] max-w-7xl flex-col px-4 pb-8 pt-4 sm:min-h-[calc(100svh-7.75rem)] sm:px-6 sm:pb-10 md:min-h-[calc(100svh-5.75rem)] md:px-8 lg:min-h-[calc(100svh-5.25rem)] lg:px-10 lg:pb-12 lg:pt-7">
        <div className="grid w-full min-w-0 max-w-full flex-1 items-center gap-8 sm:gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(430px,590px)] lg:gap-12 xl:grid-cols-[minmax(0,0.88fr)_minmax(470px,640px)]">
          <div className="min-w-0 max-w-full space-y-4 overflow-hidden sm:space-y-5">
            <h1 className="max-w-full break-words text-[1.65rem] font-bold leading-tight text-black min-[420px]:text-3xl sm:max-w-xl sm:text-4xl lg:text-[3.25rem] xl:text-[3.7rem]">
              <span className="block">{content.title}</span>
              <span
                aria-hidden="true"
                className="mt-4 block h-0.5 w-20 bg-black"
              />
            </h1>

            <div className="min-h-[62px] sm:min-h-[72px] lg:min-h-[78px]">
              <TextType
                key={language}
                text={content.quotes}
                as="p"
                typingSpeed={60}
                pauseDuration={2500}
                deletingSpeed={40}
                loop={true}
                showCursor={true}
                cursorCharacter="|"
                cursorClassName="text-black text-2xl"
                className="text-base leading-7 text-black/80 sm:text-lg sm:leading-relaxed lg:text-[1.15rem]"
                textColors={["#000000"]}
              />
            </div>

            <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-xl border border-black/10 bg-white/82 px-4 py-2.5 text-sm text-black/70 shadow-sm">
              <span className="font-semibold text-black">
                {content.sourceLabel}:
              </span>
              <span className="font-medium text-black">
                {content.sourceValue}
              </span>
            </div>

            <div className="grid w-full min-w-0 gap-3 pt-1 sm:flex sm:flex-wrap sm:gap-3">
              <a
                href="#resources"
                className="inline-flex min-w-0 max-w-full items-center justify-center rounded-lg border border-black bg-black px-5 py-3 text-center font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/85 sm:w-auto sm:px-6"
              >
                {content.primaryButton}
              </a>
              <a
                href="#study-flow"
                className="inline-flex min-w-0 max-w-full items-center justify-center rounded-lg border border-black/10 bg-white px-5 py-3 text-center font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:border-black/20 hover:bg-white/80 sm:w-auto sm:px-6"
              >
                {content.secondaryButton}
              </a>
            </div>

            <div className="flex w-full max-w-[340px] flex-wrap gap-3 pt-2 sm:max-w-none sm:gap-7 sm:pt-3">
              {content.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="min-w-0 flex-1 basis-[92px] text-center sm:flex-none sm:basis-auto sm:text-left"
                >
                  <div className="truncate text-xl font-bold text-black min-[360px]:text-2xl sm:text-[1.7rem]">
                    {stat.value}
                  </div>
                  <div className="text-xs leading-5 text-black/60 sm:text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[350px] min-w-0 overflow-hidden min-[381px]:h-[398px] sm:h-[444px] md:h-[520px] lg:h-[635px] lg:overflow-visible xl:h-[665px]">
            <CardSwap
              width={heroCardConfig.width}
              height={heroCardConfig.height}
              cardDistance={heroCardConfig.cardDistance}
              verticalDistance={heroCardConfig.verticalDistance}
              delay={5000}
              pauseOnHover={false}
              skewAmount={heroCardConfig.skewAmount}
              easing="smooth"
              containerClassName={heroCardConfig.containerClassName}
            >
              {heroShowcaseImages.map((image, index) => (
                <Card
                  key={image.src}
                  className="rounded-2xl border border-black/10 bg-white p-0 text-black shadow-[0_18px_42px_rgba(15,23,42,0.12)]"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    decoding="async"
                    fetchPriority={index < 3 ? "high" : "auto"}
                    loading={index < 3 ? "eager" : "lazy"}
                    className="block h-full w-full object-contain object-center"
                  />
                </Card>
              ))}
            </CardSwap>
          </div>
        </div>

        <div className="mt-7 border-t border-black/10 pt-6 lg:mt-8 lg:pt-7">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/50">
                {content.sliderEyebrow}
              </p>
              <h2 className="mt-2 text-xl font-bold leading-tight text-black sm:text-2xl lg:text-[1.65rem]">
                {content.sliderTitle}
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-black/60 lg:text-right">
              {content.sliderDescription}
            </p>
          </div>

          <InfiniteSlider
            speed={38}
            speedOnHover={72}
            gap={24}
            className="py-3"
          >
            {textbookCovers.map((book) => (
              <img
                key={book.src}
                src={book.src}
                alt={book.alt}
                decoding="async"
                loading="lazy"
                className="block aspect-[3/4] h-[142px] w-[101px] rounded-xl border border-black/10 bg-white object-cover object-center shadow-[0_16px_34px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-1 sm:h-[184px] sm:w-[130px] lg:h-[196px] lg:w-[139px]"
              />
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
