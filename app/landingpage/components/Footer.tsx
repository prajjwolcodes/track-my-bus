"use client";

import { Bus, Facebook, Github, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { Libre_Baskerville, Nunito } from "next/font/google";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400"],
});

export default function Footer() {
  return (
    <footer className="bg-[#fdf9f2] border-t border-gray-200 px-12 py-12">

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-16 gap-y-12">

        {/* BRAND */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`${libreBaskerville.className} flex items-center gap-2 text-2xl font-bold text-[#0057bb]`}>
            <span>SmartYatra</span>
            <Bus size={22} />
          </div>

          <p className={`${nunito.className} text-sm text-gray-600 leading-relaxed`}>
            SmartYatra is a smart school bus management system that improves safety, simplifies bus tracking, and keeps parents updated in real time. It ensures smooth transportation management for schools while giving parents peace of mind through live updates and alerts.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className="space-y-4">
          <h3 className={`${nunito.className} text-xl font-bold text-gray-900`}>
            Quick Links
          </h3>

          <ul className={`${nunito.className} space-y-2 text-sm`}>
            <li><a href="#home" className="text-gray-600 hover:text-blue-700">Home</a></li>
            <li><a href="#features" className="text-gray-600 hover:text-blue-700">Features</a></li>
            <li><a href="#how-it-works" className="text-gray-600 hover:text-blue-700">How It Works</a></li>
            <li><a href="#contact" className="text-gray-600 hover:text-blue-700">Contact</a></li>
          </ul>
        </div>

        {/* CONTACT INFO (REPLACED SERVICES) */}
        <div className="space-y-4">
          <h3 className={`${nunito.className} text-xl font-bold text-gray-900`}>
            Contact Info
          </h3>

          <div className={`${nunito.className} text-sm text-gray-600 space-y-3`}>

            <div className="flex items-center gap-2">
              <Phone size={16} className="text-blue-600" />
              <span>+977-9800000001</span>
            </div>

            <div className="flex items-center gap-2">
              <Mail size={16} className="text-blue-600" />
              <span>smartyatra@gmail.com</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" />
              <span>Lainchaur, Kathmandu</span>
            </div>

          </div>
        </div>

        {/* CONNECT */}
        <div className="space-y-4">
          <h3 className={`${nunito.className} text-xl font-bold text-gray-900`}>
            Connect
          </h3>

          <div className="flex flex-col gap-3 text-sm">
            <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-700">
              <Facebook size={18} /> Facebook
            </a>

            <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-700">
              <Github size={18} /> GitHub
            </a>

            <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-700">
              <Instagram size={18} /> Instagram
            </a>

            <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-700">
              <Linkedin size={18} /> LinkedIn
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}