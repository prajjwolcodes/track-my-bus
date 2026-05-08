"use client";

import { ArrowRight, Bus } from "lucide-react";
import Image from "next/image";
import { Libre_Baskerville, Nunito } from "next/font/google";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function Hero() {
  return (
    <section className="bg-[#fcfaf2] px-4 py-16 md:py-24 lg:py-32 overflow-hidden">
      <div className="relative mx-auto flex min-h-170 w-full max-w-5xl items-center overflow-hidden rounded-[40px] bg-white shadow-xl">

        {/* BACKGROUND BUS IMAGE */}
        <div className="absolute inset-0">
          <Image
            src="/bus.png"
            alt="School Bus"
            fill
            priority
            className="object-cover object-left"
          />

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* CONTENT SECTION */}
        <div
          className="
            relative z-10 ml-auto
            flex w-full flex-col justify-center
            bg-[#fdfbf2]/96 py-6
            sm:px-8
            md:w-[80%]
            md:px-8
            lg:w-[65%]
            lg:px-10
          "
          style={{
            clipPath:
              "polygon(3% 0%, 97% 0%, 100% 3%, 100% 97%, 97% 100%, 3% 100%, 0% 97%, 0% 3%)",
          }}
        >
          {/* TOP BADGE */}
          <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
            <div className="rounded-md bg-blue-100 p-1.5">
              <Bus size={14} className="text-blue-700" />
            </div>

            <span
              className={`${nunito.className} text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 md:text-xs`}
            >
              Live Tracking & Smart Bus Monitoring
            </span>
          </div>

          {/* HEADING */}
          <h1
            className={`${libreBaskerville.className} text-3xl leading-tight text-[#1a1a1a] sm:text-4xl lg:text-5xl`}
          >
            Professional tracking for
            <span className="italic text-blue-800">
              concerned parents
            </span>
            {" "} &
            <br />
            logistics operators
          </h1>

          {/* DESCRIPTION */}
          <p
            className={`${nunito.className} mt-6 max-w-xl text-sm leading-7 text-gray-600 md:text-base`}
          >
            SmartYatra provides real-time visibility, intelligent route
            optimization, and instant safety alerts ensuring every student's journey remains secure, transparent, and stress-free for schools, parents, and drivers.
          </p>

          {/* BUTTONS */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              className={`${nunito.className} rounded-xl bg-blue-800 px-8 py-3.5 font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-900 hover:scale-[1.02]`}
            >
              Get Started
            </button>

            <button
              className={`${nunito.className} group flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-7 py-3.5 font-semibold text-blue-900 transition-all hover:bg-blue-50`}
            >
              Learn More
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>

        {/* MOBILE IMAGE OVERLAY FIX */}
        <div className="absolute inset-0 bg-linear-to-t from-[#fcfaf2]/80 via-transparent to-transparent md:hidden" />
      </div>
    </section >
  );
}