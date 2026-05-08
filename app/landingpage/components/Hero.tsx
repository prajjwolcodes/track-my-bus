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
    <section className="bg-[#fcfaf2] px-4 py-24 md:py-24 lg:py-32 overflow-hidden">
      <div className="relative mx-auto w-full max-w-7xl sm:max-w-6xl overflow-hidden rounded-[20px] shadow-xl">

        {/* IMAGE */}
        <div className="relative h-[540px] md:h-[600px] lg:h-[600px] w-full">
          <Image
            src="/bus.png"
            alt="School Bus"
            fill
            priority
            className="object-cover object-left"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <div
          className="absolute bottom-0 right-0 z-10 w-full sm:w-[70%] md:w-[50%] lg:w-[50%] bg-[#fdfbf2]/96 px-12 py-12 sm:px-12 lg:px-12 shadow-2xl"
          style={{
            clipPath:
              "polygon(10% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 10%)",
          }}
        >
          <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
            <div className="rounded-md bg-blue-100 p-1.5">
              <Bus size={14} className="text-blue-700" />
            </div>

            <span className={`${nunito.className} text-xs font-semibold uppercase tracking-[0.2em] text-gray-500`}>
              Live Tracking & Smart Bus Monitoring
            </span>
          </div>

          {/* HEADING */}
          <h1 className={`${libreBaskerville.className} text-3xl sm:text-4xl lg:text-5xl leading-tight text-[#1a1a1a]`}>
            Professional tracking for{" "}
            <span className="italic text-blue-800">concerned parents</span> & logistics operators
          </h1>

          {/* DESCRIPTION */}
          <p className={`${nunito.className} mt-6 max-w-xl text-sm md:text-base leading-7 text-gray-600`}>
            SmartYatra provides real-time visibility, intelligent route optimization, and instant safety alerts ensuring every student's journey remains secure,
            transparent, and stress-free for schools, parents, and drivers.
          </p>

          {/* BUTTONS */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button className="rounded-xl bg-blue-800 px-8 py-3.5 font-semibold text-white shadow-lg transition hover:bg-blue-900 hover:scale-[1.02]">
              Get Started
            </button>

            <button className="group flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-7 py-3.5 font-semibold text-blue-900 transition hover:bg-blue-50">
              Learn More
              <ArrowRight className="transition-transform group-hover:translate-x-1" size={18} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}