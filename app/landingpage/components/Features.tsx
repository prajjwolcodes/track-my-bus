"use client"

import React from "react"

interface Feature {
  icon: string
  title: string
  description: string
  tags: string[]
}

const FEATURES: Feature[] = [
  {
    icon: "🚌",
    title: "Live Bus Tracking",
    description:
      "Monitor the real-time location of school buses using GPS technology, allowing parents and administrators to track every journey with precision.",
    tags: ["GPS", "Live Map", "Tracking"],
  },
  {
    icon: "🔔",
    title: "Parent Notifications",
    description:
      "Receive instant alerts and push notifications about bus arrivals, delays, and route changes — keeping families informed at all times.",
    tags: ["Alerts", "Push", "Safety"],
  },
  {
    icon: "🛣️",
    title: "Driver Route Updates",
    description:
      "Enable drivers to update routes, stops, and schedules in real time with a simple mobile interface built for on-the-go use.",
    tags: ["Routes", "Stops", "Navigation"],
  },
  {
    icon: "📊",
    title: "Transport Management",
    description:
      "Manage buses, drivers, and student assignments through a centralized admin dashboard with full visibility across your fleet.",
    tags: ["Dashboard", "Admin", "Control"],
  },
  {
    icon: "🛡️",
    title: "Secure Authentication",
    description:
      "Role-based access control ensures only authorized users — parents, drivers, and admins — can access the right sections of the system.",
    tags: ["Security", "Login", "Roles"],
  },
  {
    icon: "📍",
    title: "Live Bus Status",
    description:
      "View the current status of each bus including movement, delay, and arrival ETA — updated continuously without manual refresh.",
    tags: ["Status", "ETA", "Updates"],
  },
]

const Features: React.FC = () => {
  return (
    <section className="bg-[#f5f3ea] py-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-14">
          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full border border-blue-100 mb-4">
            Platform Capabilities
          </span>
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Key Features &amp; Capabilities
          </h2>
          <p className="text-gray-500 text-sm leading-7 max-w-2xl mx-auto">
            Our platform combines cutting-edge logistics technology with an intuitive interface
            designed specifically for school transportation safety and transparency.
          </p>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              {/* ICON */}
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-xl mb-5 group-hover:bg-blue-100 transition-colors duration-200">
                {feature.icon}
              </div>

              {/* TITLE */}
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>

              {/* DESCRIPTION */}
              <p className="text-sm text-gray-500 leading-6 mb-5">
                {feature.description}
              </p>

              {/* TAGS */}
              <div className="flex flex-wrap gap-2">
                {feature.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features