"use client"
import { Libre_Baskerville, Nunito } from "next/font/google"
import React from "react"

import {
  Bus,
  Bell,
  Route,
  BarChart3,
  ShieldCheck,
  MapPinned,
} from "lucide-react"

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400"],
});

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  tags: string[];
}

const FEATURES = [
  {
    icon: Bus,
    title: "Live Bus Tracking",
    description:
      "Monitor the real-time location of school buses using GPS technology, allowing parents and administrators to track every journey with precision.",
    tags: ["GPS", "Live Map", "Tracking"],
  },
  {
    icon: Bell,
    title: "Parent Notifications",
    description:
      "Receive instant alerts and push notifications about bus arrivals, delays, and route changes — keeping families informed at all times.",
    tags: ["Alerts", "Push", "Safety"],
  },
  {
    icon: Route,
    title: "Driver Route Updates",
    description:
      "Enable drivers to update routes, stops, and schedules in real time with a simple mobile interface built for on-the-go use.",
    tags: ["Routes", "Stops", "Navigation"],
  },
  {
    icon: BarChart3,
    title: "Transport Management",
    description:
      "Manage buses, drivers, and student assignments through a centralized admin dashboard with full visibility across your fleet.",
    tags: ["Dashboard", "Admin", "Control"],
  },
  {
    icon: ShieldCheck,
    title: "Secure Authentication",
    description:
      "Role-based access control ensures only authorized users — parents, drivers, and admins — can access the right sections of the system.",
    tags: ["Security", "Login", "Roles"],
  },
  {
    icon: MapPinned,
    title: "Live Bus Status",
    description:
      "View the current status of each bus including movement, delay, and arrival ETA — updated continuously without manual refresh.",
    tags: ["Status", "ETA", "Updates"],
  },
]

const Features: React.FC = () => {
  return (
    <section
      id="features"
      className="bg-[#fdf9f2] py-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className={`${libreBaskerville.className} text-center mb-14`}>
          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full border border-blue-100 mb-4">
            Platform Capabilities
          </span>
          <h2
            className={`${libreBaskerville.className} text-[40px] text-[#313235] sm:text-[44px] lg:text-[48px]`}
            style={{ lineHeight: "48px" }}
          >
            Key Features &amp; Capabilities
          </h2>
          <p className={`${nunito.className} text-gray-500 text-sm leading-7 max-w-2xl mx-auto`}>
            Our platform combines cutting-edge logistics technology with an intuitive interface
            designed specifically for school transportation safety and transparency.
          </p>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 ">
          {FEATURES.map((feature) => {
            const Icon = feature.icon

            return (
              <div
                key={feature.title}
                className={`${libreBaskerville.className} group bg-[#f1f1f2] rounded-2xl p-7 border border-blue-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300`}
              >
                {/* ICON */}
                <div
                  className={`${libreBaskerville.className} w-11 h-11 bg-blue-50 rounded-xl border border-blue-300 flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors duration-200`}
                >
                  <Icon className="w-5 h-5 text-blue-700" />
                </div>

                {/* TITLE */}
                <h3
                  className={`${libreBaskerville.className} text-base font-semibold text-gray-900 mb-2`}
                >
                  {feature.title}
                </h3>

                {/* DESCRIPTION */}
                <p
                  className={`${nunito.className} text-sm text-gray-500 leading-6 mb-5`}
                >
                  {feature.description}
                </p>

                {/* TAGS */}
                <div className={`${nunito.className} flex flex-wrap gap-2`}>
                  {feature.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-blue-800 bg-blue-50 border border-blue-300 px-3 py-1 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Features