import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "./components/Navbar";
import "./index.css";

const HomePage = lazy(() => import("./pages/HomePage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const AudioPage = lazy(() => import("./pages/AudioPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const GradePage = lazy(() => import("./pages/GradePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const SubjectPage = lazy(() => import("./pages/SubjectPage"));

const textureStyle = {
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

function normalizePathname(pathname = "/") {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function getLocationState() {
  return {
    pathname: normalizePathname(window.location.pathname),
    search: window.location.search,
    hash: window.location.hash,
  };
}

function resolveRoute(locationState) {
  const pathname = normalizePathname(locationState.pathname);
  const searchParams = new URLSearchParams(locationState.search);

  if (pathname === "/") {
    return { name: "home" };
  }

  if (pathname === "/audio") {
    return { name: "audio" };
  }

  if (pathname === "/events") {
    return { name: "events" };
  }

  if (pathname === "/about") {
    return { name: "about" };
  }

  const gradeMatch = pathname.match(/^\/grade\/(\d+)$/);
  if (gradeMatch) {
    return { name: "grade", grade: gradeMatch[1] };
  }

  const subjectMatch = pathname.match(/^\/subject\/([^/]+)$/);
  if (subjectMatch) {
    return {
      name: "subject",
      subject: decodeURIComponent(subjectMatch[1]),
    };
  }

  if (pathname === "/search") {
    return {
      name: "search",
      query: searchParams.get("q") || "",
    };
  }

  return { name: "not-found" };
}

function getActiveNavItem(route, hash = "") {
  if (route.name === "events") {
    return "events";
  }

  if (route.name === "audio") {
    return "audio";
  }

  if (route.name === "about") {
    return "about";
  }

  if (route.name !== "home") {
    return "";
  }

  if (hash === "#resources") {
    return "events";
  }

  if (hash === "#footer") {
    return "about";
  }

  return "home";
}

function getHashTarget(hash) {
  if (!hash || hash === "#") {
    return null;
  }

  const rawId = hash.slice(1);
  let decodedId = rawId;

  try {
    decodedId = decodeURIComponent(rawId);
  } catch {
    decodedId = rawId;
  }
  const targetById = document.getElementById(decodedId);

  if (targetById) {
    return targetById;
  }

  try {
    return document.querySelector(hash);
  } catch {
    return null;
  }
}

function PageLoader() {
  return (
    <main
      aria-busy="true"
      className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4 py-28 text-sm font-medium text-black/55"
    >
      Loading...
    </main>
  );
}

function NotFoundPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-28">
      <h1 className="text-3xl font-bold text-black">Page not found</h1>
      <p className="mt-3 text-black/65">
        The page you requested does not exist in the current frontend routes.
      </p>
    </main>
  );
}

function App() {
  const [language, setLanguage] = useState("km");
  const [locationState, setLocationState] = useState(getLocationState);

  useEffect(() => {
    const syncLocation = () => {
      setLocationState(getLocationState());
    };

    window.addEventListener("popstate", syncLocation);
    window.addEventListener("hashchange", syncLocation);

    return () => {
      window.removeEventListener("popstate", syncLocation);
      window.removeEventListener("hashchange", syncLocation);
    };
  }, []);

  const handleNavigate = useCallback((href) => {
    const nextUrl = new URL(href, window.location.origin);
    const nextLocation = {
      pathname: normalizePathname(nextUrl.pathname),
      search: nextUrl.search,
      hash: nextUrl.hash,
    };
    const currentLocation = getLocationState();

    const isSameLocation =
      currentLocation.pathname === nextLocation.pathname &&
      currentLocation.search === nextLocation.search &&
      currentLocation.hash === nextLocation.hash;

    if (isSameLocation) {
      if (nextLocation.hash) {
        getHashTarget(nextLocation.hash)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    window.history.pushState({}, "", nextUrl);
    setLocationState(nextLocation);
  }, []);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.origin);
      if (nextUrl.origin !== window.location.origin) {
        return;
      }

      event.preventDefault();
      handleNavigate(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [handleNavigate]);

  useEffect(() => {
    if (!locationState.hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    let attempts = 0;

    const scrollToTarget = () => {
      const target = getHashTarget(locationState.hash);

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      attempts += 1;
      if (attempts < 8) {
        window.requestAnimationFrame(scrollToTarget);
      }
    };

    scrollToTarget();
  }, [locationState]);

  const route = resolveRoute(locationState);
  const currentPage = getActiveNavItem(route, locationState.hash);
  const page = useMemo(() => {
    switch (route.name) {
      case "home":
        return <HomePage language={language} />;
      case "events":
        return <EventsPage language={language} />;
      case "audio":
        return <AudioPage language={language} />;
      case "about":
        return <AboutPage language={language} />;
      case "grade":
        return <GradePage grade={route.grade} />;
      case "subject":
        return <SubjectPage subject={route.subject} />;
      case "search":
        return <SearchPage query={route.query} />;
      default:
        return <NotFoundPage />;
    }
  }, [language, route]);

  return (
    <TooltipProvider>
      <div className="relative w-full overflow-x-hidden bg-[#f9fafb] text-black">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={textureStyle}
        />
        <div className="relative z-10">
          <Navbar
            language={language}
            setLanguage={setLanguage}
            currentPage={currentPage}
            onNavigate={handleNavigate}
          />
          <Suspense fallback={<PageLoader />}>{page}</Suspense>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default App;
