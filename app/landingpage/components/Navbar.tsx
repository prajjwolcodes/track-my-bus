"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Libre_Baskerville, Nunito } from "next/font/google"
import { Bus } from "lucide-react";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400"],
});

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 bg-[#fdf9f2] ${scrolled
        ? "bg-white/90 backdrop-blur-md shadow-sm "
        : "bg-[#f5f3ea]"
        }`}
    >
      <div className="max-w-7xl mx-auto px-2 py-3 flex justify-between items-center">

        <Link
          href="#home"
          className={`${libreBaskerville.className} flex items-center gap-2 font-bold text-blue-800 text-xl`}
        >
          {/* <Bus className="w-6 h-6" /> */}
          <span>SmartYatra</span>
        </Link>

        <nav className="hidden md:flex gap-8 text-sm text-gray-600">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${nunito.className} hover:text-blue-700 transition`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">

          <Link
            href="/signin"
            className={`${nunito.className} px-4 py-2 text-sm font-medium border border-blue-800 text-blue-800 rounded-lg hover:bg-blue-100 transition-colors duration-200`}
          >
            Login
          </Link>

          <Link
            href="/signup"
            className={`${nunito.className} px-4 py-2 text-sm font-medium bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors duration-200`}
          >
            Register
          </Link>

        </div>
      </div>
    </header>
  );
}