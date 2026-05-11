import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  BarChart3,
  CalendarRange,
  ChevronDown,
  FileStack,
  Layers,
  LayoutDashboard,
  Menu,
  Settings,
  UploadCloud,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  {
    path: "/",
    name: "Overview",
    icon: LayoutDashboard,
  },
  {
    path: "/upload",
    name: "Upload",
    icon: UploadCloud,
    subItems: [
      {
        path: "/upload?tab=resources",
        name: "Resources",
        icon: FileStack,
      },
      {
        path: "/upload?tab=events",
        name: "Events",
        icon: CalendarRange,
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

export default function AdminSidebar({ adminName = "Admin" }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUploadExpanded, setIsUploadExpanded] = useState(true);
  const location = useLocation();

  const toggleMobile = () => setIsMobileOpen((current) => !current);

  const sidebarContent = (
    <div className="flex h-full flex-col border-r border-slate-800 bg-slate-900">
      <div className="flex items-center gap-3 p-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm">
          <Layers size={18} />
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Grade A
          </span>
          <span className="text-xl font-bold tracking-tight text-white">
            Nexus Admin
          </span>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-4">
        {NAV_ITEMS.map((item) => {
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
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        size={18}
                        className={isActive ? "text-primary-400" : "text-slate-400"}
                      />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
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
                        <div className="space-y-1 py-1 pl-10 pr-3">
                          {item.subItems.map((subItem) => {
                            const query = subItem.path.split("?")[1] || "";
                            const isSubActive =
                              location.pathname === "/upload" &&
                              location.search.replace(/^\?/, "") === query;

                            return (
                              <NavLink
                                key={subItem.name}
                                to={subItem.path}
                                onClick={() => setIsMobileOpen(false)}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                                  isSubActive
                                    ? "bg-primary-600/10 text-primary-400"
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
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
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      linkActive
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`
                  }
                >
                  <item.icon
                    size={18}
                    className={
                      location.pathname === item.path
                        ? "text-primary-400"
                        : "text-slate-400"
                    }
                  />
                  <span>{item.name}</span>
                </NavLink>
              )}
            </div>
          );
        })}
      </nav>

      <div className="m-4 rounded-lg border border-slate-700 bg-slate-800 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-700 text-sm font-semibold text-white">
            {(adminName || "A").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{adminName}</p>
            <p className="text-xs text-slate-400">Content manager</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary-600 text-white">
            <Layers size={14} />
          </div>
          <span className="text-lg font-bold text-white">Nexus</span>
        </div>
        <button
          type="button"
          onClick={toggleMobile}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"
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
              className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm md:hidden"
            />
            <Motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 w-64 md:hidden"
            >
              {sidebarContent}
            </Motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <aside className="fixed inset-y-0 left-0 hidden w-64 md:block">{sidebarContent}</aside>
    </>
  );
}
