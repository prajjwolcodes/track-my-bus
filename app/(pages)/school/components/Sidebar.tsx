"use client";

import { useAuth } from "@/app/context/authContext";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Bus,
  Users,
  Route,
  Activity,
  ChevronLeft,
  ChevronRight,
  X,
  UserRound,
  UserCircle2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

import {
  Libre_Baskerville,
  Nunito,
} from "next/font/google";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const Sidebar = ({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (open: boolean) => void }) => {
  const pathname = usePathname();
  const { user } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  const schoolName = user?.name?.split(" ")[0] || "School";

  const nav = [
    {
      name: "Dashboard",
      href: "/school",
      icon: LayoutDashboard,
    },
    {
      name: "Drivers",
      href: "/school/drivers",
      icon: UserRound,
    },
    {
      name: "Buses",
      href: "/school/buses",
      icon: Bus,
    },
    {
      name: "Students",
      href: "/school/students",
      icon: Users,
    },
    {
      name: "Routes",
      href: "/school/routes",
      icon: Route,
    },
    {
      name: "Live Tracking",
      href: "/school/live",
      icon: Activity,
    },

  ];

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setMobileOpen(false);
      }
    }

    if (mobileOpen) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [mobileOpen]);

  useEffect(() => {
    function handleAccountOutsideClick(event: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    }

    if (accountOpen) {
      document.addEventListener("mousedown", handleAccountOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleAccountOutsideClick);
    };
  }, [accountOpen]);

  return (
    <>
      {mobileOpen && (
        <div
          className="
            fixed inset-0 z-50
            bg-black/50 backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      <aside
        ref={sidebarRef}
        className={`
          fixed lg:sticky top-0 left-0 z-50
          h-screen
          flex flex-col
          border-r border-blue-900/60
          bg-linear-to-b from-[#041C3B] via-[#06264F] to-[#03152D]
          shadow-2xl
          transition-all duration-300 ease-in-out

          ${collapsed
            ? "w-22"
            : "w-72"
          }

          ${mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* HEADER */}
        <div
          className={`
            flex items-center
            border-b border-blue-900/40
            px-4 py-5
            ${collapsed
              ? "justify-center"
              : "justify-between"
            }
          `}
        >
          {!collapsed && (
            <div>
              <h1
                className={`
                  text-xl font-bold text-white
                  tracking-wide
                  ${libreBaskerville.className}
                `}
              >
                School Panel
              </h1>

              <p
                className={`
                  text-xs text-blue-200/70 mt-1
                  ${nunito.className}
                `}
              >
                Transport Management
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* DESKTOP COLLAPSE */}
            <button
              onClick={() =>
                setCollapsed(!collapsed)
              }
              className="
                hidden lg:flex
                items-center justify-center
                w-9 h-9
                rounded-xl
                bg-white/10
                hover:bg-white/20
                text-blue-100
                transition
              "
            >
              {collapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>

            <button
              onClick={() => setMobileOpen(false)}
              className="
                lg:hidden
                flex items-center justify-center
                w-9 h-9
                rounded-xl
                bg-white/10
                hover:bg-white/20
                text-blue-100
                transition
              "
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {nav.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  setMobileOpen(false)
                }
                className={`
                  group relative
                  flex items-center
                  rounded-2xl
                  transition-all duration-200

                  ${collapsed
                    ? "justify-center px-3 py-4"
                    : "gap-4 px-4 py-3.5"
                  }

                  ${active
                    ? `
                        bg-blue-500/15
                        text-blue-100
                        border border-blue-400/20
                        shadow-lg shadow-blue-950/30
                      `
                    : `
                        text-blue-100/70
                        hover:bg-white/10
                        hover:text-white
                      `
                  }
                `}
              >
                {/* ACTIVE INDICATOR */}
                {active && (
                  <div
                    className="
                      absolute left-0 top-1/2
                      -translate-y-1/2
                      h-8 w-1
                      rounded-r-full
                      bg-blue-300
                    "
                  />
                )}

                {/* ICON */}
                <Icon
                  size={20}
                  className="
                    shrink-0
                  "
                />

                {/* TEXT */}
                {!collapsed && (
                  <span
                    className={`
                      text-sm font-semibold tracking-wide
                      ${nunito.className}
                    `}
                  >
                    {item.name}
                  </span>
                )}

                {/* TOOLTIP */}
                {collapsed && (
                  <div
                    className="
                      absolute left-20
                      top-1/2 -translate-y-1/2
                      px-3 py-2
                      rounded-xl
                      bg-slate-900
                      border border-slate-700
                      text-white text-xs
                      whitespace-nowrap
                      opacity-0 invisible
                      group-hover:opacity-100
                      group-hover:visible
                      transition-all duration-200
                      pointer-events-none
                      shadow-2xl
                    "
                  >
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}


        </nav>

        <div className="border-t border-blue-900/40 p-3" ref={accountRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen((prev) => !prev)}
              className={`
                w-full
                rounded-2xl
                bg-white/10
                hover:bg-white/20
                text-blue-50
                transition
                ${collapsed ? "p-2.5 flex justify-center" : "px-3 py-2.5 flex items-center justify-between"}
              `}
            >
              <div className="flex items-center gap-2 min-w-0">
                <UserCircle2 size={24} className="shrink-0" />

                {!collapsed && (
                  <div className="min-w-0 text-left">
                    <p className={`truncate text-sm font-semibold ${nunito.className}`}>
                      {schoolName}
                    </p>
                    <p className={`truncate text-xs text-blue-200/80 ${nunito.className}`}>
                      School Account
                    </p>
                  </div>
                )}
              </div>

              {!collapsed && (
                accountOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />
              )}
            </button>

            {accountOpen && (
              <div
                className={`
                  absolute bottom-full mb-2
                  rounded-2xl border border-blue-800/60
                  bg-[#06264F]
                  shadow-2xl
                  p-3
                  z-50
                  ${collapsed ? "left-full ml-2 w-56" : "left-0 right-0"}
                `}
              >
                <div className="mb-3 border-b border-blue-900/50 pb-3">
                  <p className={`text-sm font-semibold text-white ${nunito.className}`}>
                    {user?.name || "School Account"}
                  </p>
                  <p className={`text-xs text-blue-200/80 ${nunito.className}`}>
                    {user?.email || "No email"}
                  </p>
                </div>

                <LogoutButton />
              </div>
            )}
          </div>
        </div>
      </aside>

      <button
        onClick={() =>
          setMobileOpen(true)
        }
        className="
          fixed bottom-5 right-5 z-50
          lg:hidden
          w-14 h-14
          rounded-2xl
          bg-[#041C3B]
          text-white
          shadow-2xl
          flex items-center justify-center
          hover:scale-105
          transition
        "
      >
        <LayoutDashboard size={22} />
      </button>
    </>
  );
};

export default Sidebar;