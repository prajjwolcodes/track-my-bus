"use client"

import React from "react"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

const Contact: React.FC = () => {
  return (
    <section className="bg-[#f5f3ea] py-12">
      <div className="max-w-7xl mx-auto">

        <div className="bg-[#4382ce] rounded-2xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* LEFT */}
          <div className="text-white max-w-md">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">
              Smart Transportation for Schools
            </h2>

            <p className="text-blue-100 text-sm mb-4">
              Track buses, ensure safety, and stay updated in real-time.
            </p>

            <button className="inline-flex items-center gap-2 bg-white text-[#195eb3] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition">
              Start Tracking
              <ArrowRight size={14} />
            </button>
          </div>

          {/* RIGHT */}
          <div className="w-45 sm:w-55">
            <Image
              src="/contact.png"
              alt="Bus"
              width={280}
              height={220}
              className="object-contain"
              priority
            />
          </div>

        </div>

      </div>
    </section>
  )
}

export default Contact