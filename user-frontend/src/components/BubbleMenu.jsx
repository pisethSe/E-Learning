import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const DEFAULT_ITEMS = [
  {
    label: "home",
    href: "#",
    ariaLabel: "Home",
    rotation: -8,
    hoverStyles: { bgColor: "#3b82f6", textColor: "#ffffff" },
  },
  {
    label: "about",
    href: "#",
    ariaLabel: "About",
    rotation: 8,
    hoverStyles: { bgColor: "#10b981", textColor: "#ffffff" },
  },
  {
    label: "projects",
    href: "#",
    ariaLabel: "Projects",
    rotation: 8,
    hoverStyles: { bgColor: "#f59e0b", textColor: "#ffffff" },
  },
  {
    label: "blog",
    href: "#",
    ariaLabel: "Blog",
    rotation: 8,
    hoverStyles: { bgColor: "#ef4444", textColor: "#ffffff" },
  },
  {
    label: "contact",
    href: "#",
    ariaLabel: "Contact",
    rotation: -8,
    hoverStyles: { bgColor: "#8b5cf6", textColor: "#ffffff" },
  },
];

export default function BubbleMenu({
  logo,
  onMenuClick,
  className,
  style,
  menuAriaLabel = "Toggle menu",
  menuBg = "#fff",
  menuContentColor = "#111",
  useFixedPosition = false,
  items,
  animationEase = "back.out(1.5)",
  animationDuration = 0.5,
  staggerDelay = 0.12,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const overlayRef = useRef(null);
  const bubblesRef = useRef([]);
  const labelRefs = useRef([]);

  const menuItems = items?.length ? items : DEFAULT_ITEMS;

  const containerClassName = [
    "bubble-menu",
    useFixedPosition ? "fixed" : "absolute",
    "left-0 right-0 top-3",
    "w-full",
    "flex items-center justify-between",
    "gap-3 px-4 sm:px-6",
    "pointer-events-none",
    "z-[1001]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    onMenuClick?.(false);
  }, [onMenuClick]);

  const handleToggle = () => {
    const nextState = !isMenuOpen;
    if (nextState) setShowOverlay(true);
    setIsMenuOpen(nextState);
    onMenuClick?.(nextState);
  };

  const handleItemClick = (event, item) => {
    if (item.onClick) {
      event.preventDefault();
      item.onClick(event);
    }

    closeMenu();
  };

  useEffect(() => {
    const overlay = overlayRef.current;
    const bubbles = bubblesRef.current.filter(Boolean);
    const labels = labelRefs.current.filter(Boolean);
    if (!overlay || !bubbles.length) return;

    if (isMenuOpen) {
      gsap.set(overlay, { display: "flex" });
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.set(bubbles, { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(labels, { y: 24, autoAlpha: 0 });

      bubbles.forEach((bubble, i) => {
        const delay = i * staggerDelay + gsap.utils.random(-0.05, 0.05);
        const timeline = gsap.timeline({ delay });

        timeline.to(bubble, {
          scale: 1,
          duration: animationDuration,
          ease: animationEase,
        });

        if (labels[i]) {
          timeline.to(
            labels[i],
            {
              y: 0,
              autoAlpha: 1,
              duration: animationDuration,
              ease: "power3.out",
            },
            `-=${animationDuration * 0.9}`,
          );
        }
      });
    } else if (showOverlay) {
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.to(labels, {
        y: 24,
        autoAlpha: 0,
        duration: 0.2,
        ease: "power3.in",
      });
      gsap.to(bubbles, {
        scale: 0,
        duration: 0.2,
        ease: "power3.in",
        onComplete: () => {
          gsap.set(overlay, { display: "none" });
          setShowOverlay(false);
        },
      });
    }
  }, [
    isMenuOpen,
    showOverlay,
    animationEase,
    animationDuration,
    staggerDelay,
  ]);

  useEffect(() => {
    const handleResize = () => {
      if (!isMenuOpen) return;

      const bubbles = bubblesRef.current.filter(Boolean);
      const isDesktop = window.innerWidth >= 900;
      bubbles.forEach((bubble, i) => {
        const item = menuItems[i];
        if (bubble && item) {
          const rotation = isDesktop ? (item.rotation ?? 0) : 0;
          gsap.set(bubble, { rotation });
        }
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen, menuItems]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeMenu, isMenuOpen]);

  return (
    <>
      <style>{`
        .bubble-menu .menu-line {
          transition: transform 0.3s ease, opacity 0.3s ease;
          transform-origin: center;
        }
        .bubble-menu-items {
          background: transparent;
          backdrop-filter: none;
        }
        .bubble-menu-items .pill-list .pill-col:nth-child(4):nth-last-child(2) {
          margin-left: calc(100% / 6);
        }
        .bubble-menu-items .pill-list .pill-col:nth-child(4):last-child {
          margin-left: calc(100% / 3);
        }
        @media (min-width: 900px) {
          .bubble-menu-items .pill-link {
            transform: rotate(var(--item-rot));
          }
          .bubble-menu-items .pill-link:hover {
            transform: rotate(var(--item-rot)) scale(1.04);
            background: var(--hover-bg) !important;
            color: var(--hover-color) !important;
          }
          .bubble-menu-items .pill-link:active {
            transform: rotate(var(--item-rot)) scale(.96);
          }
        }
        @media (max-width: 899px) {
          .bubble-menu-items {
            padding-top: 6.25rem;
            align-items: flex-start;
          }
          .bubble-menu-items .pill-list {
            row-gap: 0.875rem;
          }
          .bubble-menu-items .pill-list .pill-col {
            flex: 0 0 100% !important;
            margin-left: 0 !important;
            overflow: visible;
          }
          .bubble-menu-items .pill-link {
            font-size: clamp(1.15rem, 5vw, 1.8rem);
            padding: 1rem 1.25rem;
            min-height: 4.75rem !important;
          }
          .bubble-menu-items .pill-link:hover {
            transform: scale(1.025);
            background: var(--hover-bg);
            color: var(--hover-color);
          }
          .bubble-menu-items .pill-link:active {
            transform: scale(.97);
          }
        }
      `}</style>

      <nav className={containerClassName} style={style} aria-label="Mobile navigation">
        <div
          className={[
            "bubble logo-bubble",
            "inline-flex items-center justify-center",
            "rounded-full bg-white",
            "shadow-[0_12px_34px_rgba(45,56,98,0.14)]",
            "ring-1 ring-black/5",
            "pointer-events-auto",
            "h-14 px-4",
            "max-w-[10.5rem]",
            "shrink-0",
            "will-change-transform",
          ].join(" ")}
          aria-label="Logo"
          style={{
            background: menuBg,
            minHeight: "56px",
            borderRadius: "9999px",
          }}
        >
          <span className="logo-content inline-flex h-full min-w-[3.8rem] items-center justify-center overflow-hidden">
            {typeof logo === "string" ? (
              <img
                src={logo}
                alt="Logo"
                className="bubble-logo block max-h-[72%] max-w-full object-contain"
              />
            ) : (
              logo
            )}
          </span>
        </div>

        <button
          type="button"
          className={[
            "bubble toggle-bubble menu-btn",
            isMenuOpen ? "open" : "",
            "inline-flex flex-col items-center justify-center",
            "rounded-full bg-white",
            "shadow-[0_12px_34px_rgba(45,56,98,0.14)]",
            "ring-1 ring-black/5",
            "pointer-events-auto",
            "h-14 w-14",
            "shrink-0",
            "border-0 cursor-pointer p-0",
            "will-change-transform",
            "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-black/15",
          ].join(" ")}
          onClick={handleToggle}
          aria-label={menuAriaLabel}
          aria-pressed={isMenuOpen}
          style={{ background: menuBg }}
        >
          <span
            className="menu-line block rounded-[2px]"
            style={{
              width: 26,
              height: 2,
              background: menuContentColor,
              transform: isMenuOpen ? "translateY(4px) rotate(45deg)" : "none",
            }}
          />
          <span
            className="menu-line block rounded-[2px]"
            style={{
              marginTop: "6px",
              width: 26,
              height: 2,
              background: menuContentColor,
              transform: isMenuOpen
                ? "translateY(-4px) rotate(-45deg)"
                : "none",
            }}
          />
        </button>
      </nav>

      {showOverlay && (
        <div
          ref={overlayRef}
          className={[
            "bubble-menu-items",
            useFixedPosition ? "fixed" : "absolute",
            "inset-0",
            "flex items-center justify-center",
            "pointer-events-none",
            "z-[1000]",
          ].join(" ")}
          aria-hidden={!isMenuOpen}
        >
          <ul
            className={[
              "pill-list",
              "list-none m-0 px-5",
              "w-full max-w-[84rem] mx-auto",
              "flex flex-wrap",
              "gap-x-0 gap-y-1",
              "pointer-events-auto",
            ].join(" ")}
            role="menu"
            aria-label="Menu links"
          >
            {menuItems.map((item, idx) => (
              <li
                key={`${item.label}-${idx}`}
                role="none"
                className={[
                  "pill-col",
                  "flex justify-center items-stretch",
                  "[flex:0_0_calc(100%/3)]",
                  "box-border",
                ].join(" ")}
              >
                <a
                  role="menuitem"
                  href={item.href}
                  target={item.target}
                  rel={item.rel}
                  aria-label={item.ariaLabel || item.label}
                  onClick={(event) => handleItemClick(event, item)}
                  className={[
                    "pill-link",
                    "w-full rounded-[999px]",
                    "no-underline",
                    "bg-white text-inherit",
                    "shadow-[0_12px_28px_rgba(45,56,98,0.12)]",
                    "ring-1 ring-black/5",
                    "flex items-center justify-center",
                    "relative",
                    "transition-[background,color,transform] duration-300 ease-in-out",
                    "box-border",
                    "whitespace-nowrap overflow-hidden",
                    "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-black/15",
                  ].join(" ")}
                  style={{
                    "--item-rot": `${item.rotation ?? 0}deg`,
                    "--pill-bg": menuBg,
                    "--pill-color": menuContentColor,
                    "--hover-bg": item.hoverStyles?.bgColor || "#f3f4f6",
                    "--hover-color":
                      item.hoverStyles?.textColor || menuContentColor,
                    background: "var(--pill-bg)",
                    color: "var(--pill-color)",
                    minHeight: "var(--pill-min-h, 8.75rem)",
                    padding: "clamp(1.5rem, 3vw, 4.5rem) 0",
                    fontSize: "clamp(1.35rem, 4vw, 3.5rem)",
                    fontWeight: 700,
                    lineHeight: 1,
                    willChange: "transform",
                  }}
                  ref={(el) => {
                    if (el) bubblesRef.current[idx] = el;
                  }}
                >
                  <span
                    className="pill-label inline-block"
                    style={{
                      willChange: "transform, opacity",
                      lineHeight: 1.2,
                    }}
                    ref={(el) => {
                      if (el) labelRefs.current[idx] = el;
                    }}
                  >
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
