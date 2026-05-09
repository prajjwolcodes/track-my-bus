"use client";

import { ArrowRight, Bus } from "lucide-react";
import Link from "next/link";
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
    <section
      id="home"
      className="bg-[#fcfaf2] px-2 py-16 md:py-20 lg:py-20 overflow-hidden">
      <div className="relative mx-auto w-full max-w-7xl sm:max-w-6xl rounded-4xl shadow-2xl overflow-visible">

        <section className="relative h-[calc(100vh-64px)] w-full overflow-hidden">
          <Image
            src="/logreg.png"
            alt="Hero Background"
            fill
            className="object-cover rounded-4xl"
            priority
          />
        </section>

    </div>
    </section>
  )
}
/* 
        <div
          className=" relative md:absolute md:bottom-8 md:right-0
    z-10 w-full md:w-[55%] lg:w-[50%] -mt-7.5 md:mt-0 bg-[#fdfbf2]/96
    px-5 sm:px-6 lg:px-8 py-6 sm:py-8

    shadow-2xl
    rounded-[30px]"
          style={{
            borderTopLeftRadius: "36px",
            borderBottomLeftRadius: "36px",
            borderTopRightRadius: "36px",
            borderBottomRightRadius: "36px",
          }}
        >

          <div className="mb-6 flex w-full items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2 shadow-sm">
            <div className="rounded-md bg-blue-100 p-1">
              <Bus size={14} className="text-blue-700" />
            </div>

            <span
              className={`${nunito.className} text-xs font-semibold uppercase tracking-[0.2em] text-gray-500`}
            >
              Live Tracking & Smart Bus Monitoring
            </span>
          </div>

          // {/* HEADING */
          // <h1
          //   className={`${libreBaskerville.className} text-2xl sm:text-3xl lg:text-4xl leading-tight text-[#1a1a1a]`}
          // >
          //   Professional tracking for{" "}
          //   <span className="italic text-blue-800">concerned parents</span> &
          //   logistics operators
          // </h1>

          // {/* DESCRIPTION */}
          // <p
          //   className={`${nunito.className} mt-6 max-w-xl text-sm md:text-base leading-7 text-gray-600`}
          // >
          //   SmartYatra provides real-time visibility, intelligent route
          //   optimization, and instant safety alerts ensuring every student's
          //   journey remains secure, transparent, and stress-free for schools,
          //   parents, and drivers.
          // </p>

          // {/* BUTTONS */}
          // <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          //   <Link href="/signup">
          //     <button className="group flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-8 py-3.5 font-semibold text-white shadow-lg transition hover:bg-blue-900 hover:scale-[1.02]">
          //       Get Started
          //     </button>
          //   </Link>

          //   <a href="#how-it-works">
          //     <button className="group flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-8 py-3.5 font-semibold text-blue-900 transition hover:bg-blue-50 hover:scale-[1.02]">
          //       Learn More
          //       <ArrowRight
          //         className="transition-transform group-hover:translate-x-1"
          //         size={18}
          //       />
          //     </button>
          //   </a>
          // </div>
      //   </div>

      // </div>
