"use client";

import { useEffect, useRef, useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import { useAuth } from "@/app/context/authContext";

import {
  Bell,
  Menu,
  Settings,
  User,
  UserCircle2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  School,
  X,
} from "lucide-react";

import { Libre_Baskerville, Nunito } from "next/font/google";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const Navbar = ({ setMobileOpen }: { setMobileOpen: (open: boolean) => void }) => {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const schoolName =
    user?.name?.split(" ")[0] || "School";

  return (
    <>
      <header
        className="
          sticky top-0 z-40
          bg-white/80 backdrop-blur-xl
          border-b border-slate-200
          shadow-sm
        "
      >
        <div className="h-16 px-4 md:px-6 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <button
              onClick={() => {
                setOpen(!open);
                setMobileOpen(true)
              }
              }
              className="
                lg:hidden
                p-2 rounded-xl
                hover:bg-slate-100
                transition
              "
            >
              <Menu size={20} className="text-slate-700" />
            </button>

            {/* Title */}
            <div>
              <h2
                className={`text-xl md:text-2xl font-bold text-slate-900 ${libreBaskerville.className}`}
              >
                School Dashboard
              </h2>

              <p
                className={`
                  hidden sm:block
                  text-xs text-slate-500
                  ${nunito.className}
                `}
              >
                Transport Management System
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">

            {/* Notification */}
            <button
              className="
                relative
                p-2.5 rounded-xl
                hover:bg-slate-100
                transition
              "
            >
              <Bell size={20} className="text-slate-700" />

              <span
                className="
                  absolute top-2 right-2
                  w-2 h-2
                  rounded-full
                  bg-rose-900
                "
              />
            </button>

            <div className="relative" ref={dropdownRef}>

              <button
                onClick={() => setOpen(!open)}
                className="
                  flex items-center gap-2
                  px-2 py-1.5
                  rounded-xl
                  hover:bg-slate-100
                  transition
                "
              >
                <UserCircle2
                  size={28}
                  className="text-slate-700"
                />

                <div className="hidden md:flex flex-col text-left">
                  <span
                    className={`
                      text-sm font-semibold text-slate-800
                      ${nunito.className}
                    `}
                  >
                    {schoolName}
                  </span>

                  <span
                    className={`
                      text-xs text-slate-500
                      ${nunito.className}
                    `}
                  >
                    School Account
                  </span>
                </div>
              </button>

              {open && (
                <div
                  className="
                    absolute right-0 mt-3
                    w-72
                    bg-white
                    border border-slate-200
                    rounded-3xl
                    shadow-2xl
                    overflow-hidden
                  "
                >

                  <div className="p-5 border-b border-slate-100">

                    <div className="flex items-center gap-4">

                      <div
                        className="
                          w-14 h-14
                          rounded-2xl
                          bg-emerald-100
                          text-emerald-700
                          flex items-center justify-center
                          text-xl font-bold
                        "
                      >
                        {schoolName.charAt(0)}
                      </div>

                      <div>
                        <h4
                          className={`
                            text-base font-bold text-slate-900
                            ${nunito.className}
                          `}
                        >
                          {schoolName}
                        </h4>

                        <p
                          className={`
                            text-xs text-slate-500
                            ${nunito.className}
                          `}
                        >
                          School Account
                        </p>
                      </div>

                    </div>
                  </div>

                  <div className="p-3 space-y-1">

                    <button
                      onClick={() => {
                        setOpen(false);
                        setOpenProfile(true);
                      }}
                      className="
                        w-full
                        flex items-center gap-3
                        px-4 py-3
                        rounded-2xl
                        hover:bg-slate-50
                        transition
                        text-left
                      "
                    >
                      <User size={18} className="text-slate-500" />

                      <span
                        className={`
                          text-sm font-semibold text-slate-700
                          ${nunito.className}
                        `}
                      >
                        My Profile
                      </span>
                    </button>

                    <button
                      className="
                        w-full
                        flex items-center gap-3
                        px-4 py-3
                        rounded-2xl
                        hover:bg-slate-50
                        transition
                        text-left
                      "
                    >
                      <Settings size={18} className="text-slate-500" />

                      <span
                        className={`
                          text-sm font-semibold text-slate-700
                          ${nunito.className}
                        `}
                      >
                        Settings
                      </span>
                    </button>
                  </div>

                  <div className="p-2 border-t border-slate-200">
                    <LogoutButton />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {openProfile && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative">

            {/* Top Banner */}
            <div className="h-32 bg-linear-to-r from-emerald-100 to-slate-100 relative">

              <button
                onClick={() => setOpenProfile(false)}
                className="
                  absolute top-4 right-4
                  p-2 rounded-full
                  bg-white shadow-sm
                  hover:bg-slate-100
                  transition
                "
              >
                <X size={18} />
              </button>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 top-20">

              <div
                className="
                  w-24 h-24
                  rounded-3xl
                  bg-emerald-100
                  border-4 border-white
                  shadow-xl
                  flex items-center justify-center
                  text-3xl font-bold text-emerald-700
                "
              >
                {schoolName.charAt(0)}
              </div>
            </div>

            {/* Content */}
            <div className="pt-16 pb-8 px-6">

              <div className="text-center">
                <h2
                  className={`
                    text-2xl font-bold text-slate-900
                    ${libreBaskerville.className}
                  `}
                >
                  {user?.name || "School Name"}
                </h2>

                <p
                  className={`
                    text-sm text-slate-500 mt-1
                    ${nunito.className}
                  `}
                >
                  School Administration Account
                </p>
              </div>

              <div className="mt-8 space-y-4">

                <InfoCard
                  icon={School}
                  label="School Name"
                  value={user?.name}
                  nunito={nunito.className}
                />

                <InfoCard
                  icon={Mail}
                  label="Email Address"
                  value={user?.email}
                  nunito={nunito.className}
                />

                <InfoCard
                  icon={Phone}
                  label="Contact Number"
                  value={user?.contact || "Not Added"}
                  nunito={nunito.className}
                />

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

function InfoCard({
  icon: Icon,
  label,
  value,
  nunito,
}: any) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">

      <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wide">
        <Icon size={14} />

        <span className={nunito}>
          {label}
        </span>
      </div>

      <p
        className={`
          mt-2 text-sm font-semibold text-slate-800
          ${nunito}
        `}
      >
        {value || "N/A"}
      </p>

    </div>
  );
}