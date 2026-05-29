import React, { useCallback, useId, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const ELLIPSIS = "ellipsis";
const STAGGER_DELAY = 0.03;

const SPRING_DEFAULT = {
  type: "spring",
  stiffness: 260,
  damping: 24,
  mass: 0.7,
};

const SPRING_INDICATOR = {
  type: "spring",
  duration: 0.25,
  bounce: 0.05,
};

function buildPageRange(page, totalPages, siblings) {
  const totalSlots = siblings * 2 + 5;

  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const leftSibling = Math.max(page - siblings, 2);
  const rightSibling = Math.min(page + siblings, totalPages - 1);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;
  const items = [1];

  if (showLeftEllipsis) {
    items.push(ELLIPSIS);
  } else {
    for (let index = 2; index < leftSibling; index += 1) {
      items.push(index);
    }
  }

  for (let index = leftSibling; index <= rightSibling; index += 1) {
    items.push(index);
  }

  if (showRightEllipsis) {
    items.push(ELLIPSIS);
  } else {
    for (let index = rightSibling + 1; index < totalPages; index += 1) {
      items.push(index);
    }
  }

  items.push(totalPages);

  return items;
}

function PaginationButton({
  children,
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "relative inline-flex h-9 shrink-0 items-center justify-center rounded-lg px-2.5 text-sm font-semibold transition-colors",
        "text-black/65 hover:bg-black/[0.06] hover:text-black focus:outline-none focus:ring-2 focus:ring-black/15",
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  siblings = 1,
  className,
}) {
  const shouldReduceMotion = useReducedMotion();
  const generatedId = useId();
  const layoutId = `pagination-active-${generatedId}`;

  const pageItems = useMemo(
    () => buildPageRange(page, totalPages, siblings),
    [page, totalPages, siblings],
  );

  const handlePrev = useCallback(() => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  }, [onPageChange, page]);

  const handleNext = useCallback(() => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  }, [onPageChange, page, totalPages]);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
    >
      <ul className="flex flex-row items-center gap-1 rounded-2xl border border-black/10 bg-white/85 p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur">
        <li>
          <PaginationButton
            aria-label="Go to previous page"
            className="gap-1"
            disabled={page <= 1}
            onClick={handlePrev}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:block">Previous</span>
          </PaginationButton>
        </li>

        {pageItems.map((item, index) => {
          if (item === ELLIPSIS) {
            return (
              <li
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center"
                key={`ellipsis-${index}`}
              >
                <Motion.span
                  animate={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : { opacity: 1, transform: "translateY(0px)" }
                  }
                  className="text-sm text-black/42"
                  initial={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : { opacity: 0, transform: "translateY(4px)" }
                  }
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { ...SPRING_DEFAULT, delay: index * STAGGER_DELAY }
                  }
                >
                  ...
                </Motion.span>
              </li>
            );
          }

          const isActive = item === page;

          return (
            <Motion.li
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { opacity: 1, transform: "translateY(0px)" }
              }
              initial={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { opacity: 0, transform: "translateY(4px)" }
              }
              key={item}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { ...SPRING_DEFAULT, delay: index * STAGGER_DELAY }
              }
            >
              <PaginationButton
                aria-current={isActive ? "page" : undefined}
                aria-label={`Go to page ${item}`}
                className={cn(
                  "h-9 w-9 px-0",
                  isActive ? "text-black" : "text-black/55",
                )}
                onClick={() => onPageChange(item)}
              >
                {isActive && (
                  <Motion.span
                    className="absolute inset-0 rounded-lg border border-black/10 bg-white shadow-sm"
                    layout
                    layoutId={layoutId}
                    style={{ originY: "0px" }}
                    transition={
                      shouldReduceMotion ? { duration: 0 } : SPRING_INDICATOR
                    }
                  />
                )}
                <span className="relative z-10">{item}</span>
              </PaginationButton>
            </Motion.li>
          );
        })}

        <li>
          <PaginationButton
            aria-label="Go to next page"
            className="gap-1"
            disabled={page >= totalPages}
            onClick={handleNext}
          >
            <span className="hidden sm:block">Next</span>
            <ChevronRight className="h-4 w-4" />
          </PaginationButton>
        </li>
      </ul>
    </nav>
  );
}
