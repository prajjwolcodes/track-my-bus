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
      <div className="relative mx-auto w-full max-w-7xl rounded-4xl shadow-2xl overflow-visible">

        <section className="relative h-[calc(112vh-56px)] w-full overflow-hidden">
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
