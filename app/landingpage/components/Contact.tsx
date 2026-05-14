"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  SendHorizontal,
  School,
  Mail,
  MessageSquare,
} from "lucide-react"

import { Libre_Baskerville, Nunito } from "next/font/google"

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
})

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400"],
})

const Contact: React.FC = () => {
  const [school, setSchool] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!school.trim() || !email.trim()) {
      setError("School name and email are required.")
      return
    }

    setSuccess("Message sent successfully!")

    setSchool("")
    setEmail("")
    setMessage("")
  }

  return (
    <section id="contact" className="bg-[#fdf9f2] px-8 py-14 lg:px-8 lg:py-20">
      <div className="max-w-7xl mx-auto">
        <div className={`${libreBaskerville.className} text-center mb-14`}>
          <h2
            className={`${libreBaskerville.className} text-[40px] text-[#313235] sm:text-[44px] lg:text-[48px]`}
            style={{ lineHeight: "48px" }}
          >
            Connect With Us
          </h2>
        </div>

        <div className="relative overflow-hidden rounded-[32px] bg-[#4382ce] shadow-[10px_10px_30px_rgba(51,120,194,0.15)]">

          <div className="grid grid-cols-2 lg:grid-cols-2 items-center gap-6 sm:gap-10 px-6 py-10 sm:px-10 lg:px-14">

            <div className="text-white space-y-4">

              <h2 className={`${libreBaskerville.className} text-2xl sm:text-4xl leading-tight`}>
                Smart Transportation <br />
                for Schools
              </h2>

              <p className={`${nunito.className} text-blue-100 text-sm sm:text-base`}>
                Manage routes, monitor buses, and keep parents updated in real time.
              </p>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-2">

                {/* SCHOOL */}
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="School Name"
                    className={`${nunito.className} w-full rounded-xl bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none`}
                  />
                </div>

                {/* EMAIL */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className={`${nunito.className} w-full rounded-xl bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none`}
                  />
                </div>

                {/* MESSAGE */}
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-blue-500" />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Drop a message..."
                    rows={3}
                    className={`${nunito.className} w-full rounded-xl bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none resize-none`}
                  />
                </div>

                {/* ERROR */}
                {error && (
                  <p className="text-red-200 text-sm font-medium">
                    {error}
                  </p>
                )}

                {/* SUCCESS */}
                {success && (
                  <p className="text-green-200 text-sm font-medium">
                    {success}
                  </p>
                )}

                {/* BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">

                  <button
                    type="submit"
                    className={`${nunito.className} inline-flex items-center justify-center gap-2 rounded-xl bg-[#193CB8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-950`}
                  >
                    Send Request
                    <SendHorizontal className="w-4 h-4" />
                  </button>

                  <Link
                    href="/signup"
                    className={`${nunito.className} inline-flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-[#195eb3] transition hover:bg-blue-100`}
                  >
                    Start Tracking
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                </div>
              </form>
            </div>

            <div className="relative flex items-center justify-center lg:justify-end">

              <div className="absolute w-65 h-65 sm:w-[320px] sm:h-80 lg:w-105 lg:h-105 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute w-55 h-55 sm:w-70 sm:h-70 lg:w-90 lg:h-90 rounded-full bg-blue-300/20" />

              <Image
                src="/contact.png"
                alt="School Bus"
                width={520}
                height={380}
                priority
                className="relative z-10 w-65 sm:w-85 lg:w-115 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact