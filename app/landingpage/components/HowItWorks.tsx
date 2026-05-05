"use client"

import Image from "next/image"
import { Libre_Baskerville, Nunito } from "next/font/google"

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
})

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400"],
})

const imgSubtract =
  "https://www.figma.com/api/mcp/asset/d4d76dcb-8f36-4dc0-9c08-db647e3511fb"

const steps = [
  {
    number: "01",
    title: "Setup & Start Tracking",
    description:
      "The administrator sets up buses, routes, and users...",
  },
  {
    number: "02",
    title: "Real-Time Monitoring",
    description:
      "The system continuously tracks the bus location...",
  },
  {
    number: "03",
    title: "Alerts & Management",
    description:
      "Parents receive instant notifications...",
  },
  {
    number: "04",
    title: "Route Management",
    description:
      "Administrators can optimize and manage bus routes...",
  },
]

export default function HowItWorks() {
  return (
    <section className="min-h-screen bg-[#f7f4ee] flex items-center justify-center px-6 py-16">

      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg p-10 space-y-12">

        <div className="text-center space-y-3">
          <h2 className={`${libreBaskerville.className} text-3xl md:text-4xl`}>
            How It Works?
          </h2>

          <p className="text-sm opacity-80 max-w-3xl mx-auto">
            A simple and efficient process...
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-center">

          <div className="w-full lg:w-1/2">
            <Image
              src={imgSubtract}
              alt="bus"
              width={600}
              height={700}
              unoptimized
            />
          </div>

          <div className="w-full lg:w-1/2 flex flex-col gap-10">

            {steps.map((step) => (
              <div key={step.number} className="flex gap-6">
                <div className="text-6xl opacity-20">
                  {step.number}
                </div>

                <div className="bg-gray-100 p-6 rounded-xl w-full">
                  <h3 className="font-semibold mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}

          </div>

        </div>

      </div>
    </section>
  )
}