"use client";

import React from "react";
import { ArrowRight, Bus } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-[#fcfaf2] flex items-center justify-center px-4 py-36">
=      <div className="relative w-full max-w-300 h-200 rounded-4xl overflow-hidden bg-white shadow-sm m-auto">
        
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/bus.png" 
            alt="School Bus"
            fill
            className="object-cover object-left"
            priority
          />
        </div>

        <div className="absolute top-8 right-12 w-32 h-14 rounded-full overflow-hidden border-4 border-white shadow-lg z-20">
          <img 
            src="https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=300" 
            className="w-full h-full object-cover"
            alt="nature"
          />
        </div>

        <div 
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[55%] h-[80%] bg-[#fdfbf2] 
                     rounded-l-[80px] shadow-[-20px_0_40px_rgba(0,0,0,0.05)]
                     flex flex-col justify-center px-16 z-10"
        >
          <div className="inline-flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-full w-fit mb-6 shadow-sm">
            <div className="bg-blue-100 p-1 rounded-md">
              <Bus size={14} className="text-blue-600" />
            </div>
            <span className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
              Live Tracking & Real-time Insights for School Buses
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-serif text-[#1a1a1a] leading-[1.1] mb-6">
            Professional tracking for <br />
            <span className="italic">concerned parents</span> & <br />
            logistics operators
          </h1>

          <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-md mb-8">
            SmartTrax provides real-time visibility, intelligent route optimization, and 
            instant safety alerts, ensuring every student's journey is secure and 
            transparent. A smart solution for schools, parents, and drivers.
          </p>

          <div className="flex items-center gap-4">
            <button className="bg-[#0057bb] hover:bg-[#004699] text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200">
              Get Started
            </button>

            <button className="flex items-center gap-2 group text-[#0057bb] font-semibold px-6 py-3.5 rounded-xl border border-blue-100 hover:bg-blue-50 transition-all">
              Learn More 
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}