"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bus,
  Users,
  Route,
  Activity,
} from "lucide-react";

const Sidebar = () => {
  const pathname = usePathname();

  const nav = [
    { name: "Dashboard", href: "/school", icon: LayoutDashboard },
    { name: "Drivers", href: "/school/drivers", icon: Bus },
    { name: "Buses", href: "/school/buses", icon: Bus },
    { name: "Students", href: "/school/students", icon: Users },
    { name: "Routes", href: "/school/routes", icon: Route },
    { name: "Live Tracking", href: "/school/live", icon: Activity },
  ];

  return (
    <aside className="hidden md:flex md:w-64 bg-blue-950 text-white flex-col p-5">
      <h1 className="text-xl font-bold mb-8">School Dashboard</h1>

      <nav className="space-y-2">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                active ? "bg-blue-700" : "hover:bg-blue-800"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;