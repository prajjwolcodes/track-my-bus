"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

export default function SchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar setMobileOpen={setMobileOpen} />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}