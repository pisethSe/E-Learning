import React from "react";
import {
  CalendarDays,
  Globe,
  Home,
  Info,
  Moon,
  Phone,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BubbleMenu from "@/components/BubbleMenu";
import Logo from "@/components/ui/Logo";

const TELEGRAM_CHANNEL_URL = "https://t.me/bacii26w";

const Navbar = ({
  language,
  setLanguage,
  currentPage = "home",
  onNavigate,
}) => {
  const navItems = [
    {
      id: "home",
      label: language === "km" ? "ទំព័រដើម" : "Home",
      href: "/",
      Icon: Home,
    },
    {
      id: "events",
      label: language === "km" ? "ព្រឹត្តិការណ៍" : "Events",
      href: "/events",
      Icon: CalendarDays,
    },
    {
      id: "audio",
      label: language === "km" ? "សំឡេង" : "Audio",
      href: "/audio",
      Icon: Volume2,
    },
    {
      id: "about",
      label: language === "km" ? "អំពីយើង" : "About",
      href: "/about",
      Icon: Info,
    },
  ];
  const contactLabel = language === "km" ? "ទំនាក់ទំនង" : "Contact";
  const mobileMenuItems = [
    ...navItems.map((item, index) => ({
      label: item.label,
      href: item.href,
      ariaLabel: item.label,
      rotation: index % 2 === 0 ? -8 : 8,
      hoverStyles: {
        bgColor: ["#2563eb", "#16a34a", "#f59e0b", "#ef4444"][index],
        textColor: "#ffffff",
      },
      onClick: () => handleNavigate(item.href),
    })),
    {
      label: contactLabel,
      href: TELEGRAM_CHANNEL_URL,
      ariaLabel: contactLabel,
      target: "_blank",
      rel: "noreferrer",
      rotation: -8,
      hoverStyles: { bgColor: "#8b5cf6", textColor: "#ffffff" },
    },
    {
      label: language === "km" ? "English" : "ខ្មែរ",
      href: "#language",
      ariaLabel:
        language === "km" ? "Switch to English" : "ប្ដូរទៅភាសាខ្មែរ",
      rotation: 8,
      hoverStyles: { bgColor: "#111827", textColor: "#ffffff" },
      onClick: () => setLanguage((l) => (l === "km" ? "en" : "km")),
    },
  ];

  const handleNavigate = (href) => {
    if (onNavigate) {
      onNavigate(href);
      return;
    }

    window.location.assign(href);
  };

  return (
    <>
      <div className="min-[900px]:hidden">
        <BubbleMenu
          logo={
            <button
              type="button"
              onClick={() => handleNavigate("/")}
              className="rounded-xl transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-black/15"
              aria-label={
                language === "km" ? "ទៅទំព័រដើម" : "Go to home page"
              }
            >
              <Logo className="h-11 w-[3.55rem]" />
            </button>
          }
          items={mobileMenuItems}
          menuAriaLabel={
            language === "km" ? "បើក/បិទម៉ឺនុយ" : "Toggle navigation"
          }
          menuBg="#ffffff"
          menuContentColor="#111111"
          useFixedPosition
          animationEase="back.out(1.5)"
          animationDuration={0.5}
          staggerDelay={0.09}
        />
      </div>

      <nav className="fixed left-0 right-0 top-0 z-50 hidden px-3 pt-2 sm:px-6 sm:pt-3 lg:px-8 lg:pt-4 min-[900px]:block">
      <div className="mx-auto max-w-[88rem]">
        <div className="flex h-16 items-center gap-3 overflow-x-auto rounded-2xl border border-white/80 bg-white/93 px-3 shadow-[0_18px_44px_rgba(45,56,98,0.14)] backdrop-blur-xl sm:h-[4.5rem] sm:gap-5 sm:rounded-[1.35rem] sm:px-5 lg:h-[4.75rem] lg:gap-7 lg:px-7">
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => handleNavigate("/")}
              className="rounded-xl transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-black/15"
              aria-label={language === "km" ? "ទៅទំព័រដើម" : "Go to home page"}
            >
              <Logo className="h-11 w-[3.55rem] sm:h-[3.25rem] sm:w-[4.2rem] lg:h-14 lg:w-[4.55rem]" />
            </button>
          </div>

          <div className="flex min-w-max flex-1 items-center justify-center gap-1.5 sm:gap-3 lg:gap-6">
            {navItems.map(({ id, label, href, Icon }) => {
              const isActive = currentPage === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleNavigate(href)}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-2 text-[13px] font-bold leading-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-black/15 sm:gap-2 sm:px-3 sm:text-sm lg:px-3.5 lg:text-[15px] ${
                    isActive
                      ? "bg-black/[0.045] text-black"
                      : "text-black/64 hover:bg-black/[0.04] hover:text-black"
                  }`}
                >
                  {React.createElement(Icon, {
                    className: "h-4 w-4 shrink-0 stroke-[2.35]",
                  })}
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              );
            })}
            <a
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-2 text-[13px] font-bold leading-none text-black/64 transition-all duration-200 hover:bg-black/[0.04] hover:text-black focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-black/15 sm:gap-2 sm:px-3 sm:text-sm lg:px-3.5 lg:text-[15px]"
            >
              <Phone className="h-4 w-4 shrink-0 stroke-[2.35]" />
              <span className="whitespace-nowrap">{contactLabel}</span>
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage((l) => (l === "km" ? "en" : "km"))}
              className="h-11 rounded-2xl px-2.5 text-black/62 hover:bg-black/[0.04] hover:text-black sm:px-3"
              aria-label={
                language === "km" ? "Switch to English" : "ប្ដូរទៅភាសាខ្មែរ"
              }
            >
              <Globe className="h-4 w-4 sm:mr-1" />
              <span className="hidden whitespace-nowrap text-sm font-bold sm:inline">
                {language === "km" ? "ខ្មែរ" : "EN"}
              </span>
            </Button>
            <button
              type="button"
              aria-label={language === "km" ? "របៀបងងឹត" : "Dark mode"}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-black shadow-[0_10px_28px_rgba(53,73,124,0.16)] ring-1 ring-black/5 transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-black/15"
            >
              <Moon className="h-5 w-5 fill-black stroke-[2.4]" />
            </button>
          </div>
        </div>
      </div>
      </nav>
    </>
  );
};

export default Navbar;
