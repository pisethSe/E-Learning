import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  BarChart3,
  ChevronDown,
  FileText,
  Headphones,
  ImagePlus,
  Layers,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  UploadCloud,
  Video,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  {
    path: "/",
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/upload",
    name: "Uploads",
    icon: UploadCloud,
    subItems: [
      {
        path: "/upload/photo",
        name: "Image Files",
        icon: ImagePlus,
      },
      {
        path: "/upload/file",
        name: "Files",
        icon: FileText,
      },
      {
        path: "/upload/audio",
        name: "Audio",
        icon: Headphones,
      },
      {
        path: "/upload/events",
        name: "Event Videos",
        icon: Video,
      },
    ],
  },
  {
    path: "/analytics",
    name: "Analytics",
    icon: BarChart3,
  },
  {
    path: "/settings",
    name: "Settings",
    icon: Settings,
  },
];

function isUploadSubItemActive(location, subItem) {
  const legacyTab = subItem.path.split("/").pop();
  const searchTab = location.search.replace(/^\?tab=/, "");

  return (
    location.pathname === subItem.path ||
    (location.pathname === "/upload" &&
      (!searchTab
        ? legacyTab === "photo"
        : searchTab === legacyTab ||
          (legacyTab === "file" && searchTab === "resources") ||
          (legacyTab === "photo" && ["image", "images"].includes(searchTab))))
  );
}

export default function AdminSidebar({ adminName = "Admin" }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUploadExpanded, setIsUploadExpanded] = useState(true);
  const [navSearch, setNavSearch] = useState("");
  const searchInputRef = useRef(null);
  const location = useLocation();

  const initials = (adminName || "A").slice(0, 1).toUpperCase();
  const toggleMobile = () => setIsMobileOpen((current) => !current);
  const normalizedNavSearch = navSearch.trim().toLowerCase();
  const visibleNavItems = useMemo(
    () =>
      NAV_ITEMS.map((item) => {
        if (!normalizedNavSearch) {
          return item;
        }

        const itemMatches = item.name.toLowerCase().includes(normalizedNavSearch);
        const subItems = item.subItems
          ? itemMatches
            ? item.subItems
            : item.subItems.filter((subItem) =>
                subItem.name.toLowerCase().includes(normalizedNavSearch),
              )
          : undefined;

        return {
          ...item,
          subItems,
          isHidden: !itemMatches && (!subItems || subItems.length === 0),
        };
      }).filter((item) => !item.isHidden),
    [normalizedNavSearch],
  );

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  const sidebarContent = (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="px-6 pb-5 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-100 bg-violet-50 text-violet-700 shadow-sm">
            <Layers size={20} />
          </div>
          <div>
            <span className="block text-lg font-bold tracking-tight text-slate-950">
              Grade A
            </span>
            <span className="text-xs font-medium text-slate-500">
              Admin workspace
            </span>
          </div>
        </div>

        <label className="mt-6 flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-400 shadow-sm">
          <Search size={18} />
          <input
            ref={searchInputRef}
            value={navSearch}
            onChange={(event) => setNavSearch(event.target.value)}
            className="min-w-0 flex-1 bg-transparent font-medium text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Search"
          />
          <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs font-semibold text-slate-400">
            Ctrl K
          </span>
        </label>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-4">
        {visibleNavItems.length ? visibleNavItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === "/upload" && location.pathname.startsWith("/upload"));
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.name}>
              {hasSubItems ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setIsUploadExpanded((current) => !current)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-slate-100 text-slate-950"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        size={18}
                        className={isActive ? "text-violet-600" : "text-slate-400"}
                      />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform duration-200 ${
                        isUploadExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isUploadExpanded ? (
                      <Motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 py-1 pl-9 pr-2">
                          {item.subItems.map((subItem) => {
                            const isSubActive = isUploadSubItemActive(location, subItem);

                            return (
                              <NavLink
                                key={subItem.name}
                                to={subItem.path}
                                onClick={() => setIsMobileOpen(false)}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                  isSubActive
                                    ? "bg-violet-50 text-violet-700"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                              >
                                <subItem.icon size={16} />
                                <span>{subItem.name}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                      </Motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive: linkActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                      linkActive
                        ? "bg-slate-100 text-slate-950"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`
                  }
                >
                  <item.icon
                    size={18}
                    className={
                      location.pathname === item.path ? "text-violet-600" : "text-slate-400"
                    }
                  />
                  <span>{item.name}</span>
                </NavLink>
              )}
            </div>
          );
        }) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-sm font-medium text-slate-500">
            No matching navigation.
          </div>
        )}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-900 shadow-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">{adminName}</p>
              <p className="text-xs font-medium text-slate-500">Content manager</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-100 bg-violet-50 text-violet-700">
            <Layers size={16} />
          </div>
          <span className="text-lg font-bold text-slate-950">Grade A</span>
        </div>
        <button
          type="button"
          onClick={toggleMobile}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Toggle navigation"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileOpen ? (
          <>
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobile}
              className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm md:hidden"
            />
            <Motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 w-72 md:hidden"
            >
              {sidebarContent}
            </Motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <aside className="fixed inset-y-0 left-0 hidden w-72 md:block">
        {sidebarContent}
      </aside>
    </>
  );
}
