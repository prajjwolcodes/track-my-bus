"use client";

import { useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import { UserCircle } from "lucide-react";

const Topbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-6">
      <h2 className="font-semibold text-gray-700">
        School Dashboard
      </h2>

      <div className="relative">
        <button onClick={() => setOpen(!open)}>
          <UserCircle className="text-gray-700" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white border shadow rounded-lg">
            <div className="p-3 text-sm text-gray-600">
              School Account
            </div>

            <hr />

            <LogoutButton />
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;