"use client";

import { useId } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bus } from "lucide-react";
import { Libre_Baskerville, Nunito } from "next/font/google";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

/** Local placeholders — replace `src` with production art when ready */
const PLACEHOLDER_BUS_SRC = "/bus1.png";
const PLACEHOLDER_ACCENT_SRC = "/bus1.png";

export default function Hero() {
  const clipId = `hero-bus-clip-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <section
      id="home"
      className={`relative bg-[#FDFCF5] px-4 pb-16 pt-28 md:pb-20 md:pt-32 lg:pb-24 lg:pt-36 ${nunito.className}`}
    >
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="relative overflow-hidden rounded-[56px] bg-neutral-200 shadow-[0_28px_80px_-28px_rgba(15,23,42,0.35)]">
          <div className="grid min-h-[320px] grid-cols-1 lg:min-h-[560px] lg:max-h-[min(92vh,720px)] lg:grid-cols-[1.08fr_0.92fr]">
            {/* Photo column — clip wrapper (more reliable than clipping the Next/Image node) */}
            <div className="relative min-h-[280px] overflow-hidden lg:min-h-0">
              <svg
                className="pointer-events-none absolute h-0 w-0"
                aria-hidden
              >
                <defs>
                  <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                    <path
                      fillRule="evenodd"
                      d="M 0 0.035 C 0 0.012 0.018 0 0.05 0 L 0.56 0 C 0.63 0 0.66 0.05 0.64 0.11 C 0.61 0.17 0.64 0.22 0.72 0.26 C 0.8 0.3 0.9 0.31 0.98 0.33 C 1 0.34 1 0.36 1 0.4 L 1 1 L 0 1 Z"
                    />
                  </clipPath>
                </defs>
              </svg>
              <div
                className="absolute inset-0"
                style={{ clipPath: `url(#${clipId})` }}
              >
                <Image
                  src={PLACEHOLDER_BUS_SRC}
                  alt="School bus — placeholder hero photography"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 2024px) 100vw, 58vw"
                />
              </div>
            </div>

            {/* Content panel */}
            <div
              className={`relative z-10 flex flex-col justify-center bg-white px-6 py-12 sm:px-10 lg:-ml-10 lg:rounded-tl-[72px] lg:rounded-bl-[40px] lg:px-12 lg:py-16 xl:px-16 ${libreBaskerville.className}`}
            >
              {/* Small pill accent (forest / secondary art in design) */}
              <div
                className="pointer-events-none absolute right-5 top-5 z-20 hidden h-11 w-[132px] overflow-hidden rounded-full shadow-md ring-[5px] ring-white sm:right-7 sm:top-7 lg:block"
                aria-hidden
              >
                <Image
                  src={PLACEHOLDER_ACCENT_SRC}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="132px"
                />
              </div>

              <div className="mx-auto w-full max-w-xl text-left lg:mx-0 lg:ml-auto lg:max-w-none lg:text-right">
                <div className="mb-7 flex justify-start lg:justify-end">
                  <div
                    className={`inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-left shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)] sm:px-4 ${nunito.className}`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0056B3]/10 text-[#0056B3]">
                      <Bus className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="text-[11px] font-medium leading-snug tracking-wide text-slate-700 sm:text-xs">
                      Live Tracking &amp; Predictive Insights for School Buses
                    </span>
                  </div>
                </div>

                <h1 className="text-balance font-bold leading-[1.08] tracking-tight text-[#0a1f3d] sm:text-4xl lg:text-[2.65rem] xl:text-5xl xl:leading-[1.06]">
                  Professional tracking for concerned parents &amp; logistics
                  operators
                </h1>

                <p
                  className={`mt-6 text-pretty text-base leading-relaxed text-slate-600 sm:text-lg ${nunito.className}`}
                >
                  SmartYatra provides real-time visibility, intelligent route
                  optimization, and instant safety alerts, ensuring every
                  student&apos;s journey is secure and transparent. A smart
                  solution for schools, parents, drivers etc.
                </p>

                <div
                  className={`mt-9 flex flex-wrap items-center justify-start gap-3 sm:gap-4 lg:justify-end ${nunito.className}`}
                >
                  <Link
                    href="#contact"
                    className="inline-flex items-center justify-center rounded-md bg-[#0056B3] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004899] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0056B3]"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="#features"
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#0056B3]/35 bg-white px-6 py-2.5 text-sm font-semibold text-[#0056B3] transition hover:border-[#0056B3] hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0056B3]"
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
