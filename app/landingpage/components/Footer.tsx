"use client";

import React from "react";
import { Bus, Facebook, Github, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#f5f3ea] border-t border-gray-200 px-6 py-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xl font-semibold text-[#1a1a1a]">
            <span className="text-[#0057bb] font-bold">SmartYatra</span>
            <Bus size={20} className="text-[#0057bb]" />
          </div>

          <p className="text-sm text-gray-600">
            Phone: +977-9800000001
          </p>
          <p className="text-sm text-gray-600">
            Email: infosmartyatra@gmail.com
          </p>
          <p className="text-sm text-gray-600">
            Address: Kathmandu, Bagmati Province, Nepal
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Connect
          </h3>

          <div className="flex items-center gap-6 text-gray-600">
            <a href="#" className="flex items-center gap-2 hover:text-black transition">
              <Facebook size={18} />
              <span className="text-sm">Facebook</span>
            </a>

            <a href="#" className="flex items-center gap-2 hover:text-black transition">
              <Github size={18} />
              <span className="text-sm">Github</span>
            </a>

            <a href="#" className="flex items-center gap-2 hover:text-black transition">
              <Instagram size={18} />
              <span className="text-sm">Instagram</span>
            </a>

            <a href="#" className="flex items-center gap-2 hover:text-black transition">
              <Linkedin size={18} />
              <span className="text-sm">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}