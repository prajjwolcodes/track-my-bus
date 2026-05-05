"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

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
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-[#f5f3ea]"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <Link href="#home" className="flex items-center gap-2 font-bold text-blue-800 text-xl">
          🚌 SmartYatra
        </Link>

        {/* LINKS */}
        <nav className="hidden md:flex gap-8 text-sm text-gray-600">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-blue-700 transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* BUTTONS */}
        <div className="flex items-center gap-3">

          <Link
            href="/signin"
            className="px-4 py-2 text-sm font-medium border border-blue-600 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors duration-200"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors duration-200"
          >
            Register
          </Link>

        </div>
      </div>
    </header>
  );
}