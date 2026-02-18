'use client'

import React from 'react'
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex flex-col">
      
      {/* Navbar */}
      <header className="w-full px-8 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md shadow-sm">
        <h1 className="text-xl font-semibold text-blue-700">
          TrackMyBus
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/signin')}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push('/signup')}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm"
          >
            Sign Up 
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col justify-center items-center text-center px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
          Smart & Secure <span className="text-blue-600">School Bus Tracking</span>
        </h2>

        <p className="mt-6 max-w-2xl text-gray-600 text-lg">
          Manage buses, drivers, students, and routes efficiently. 
          Parents can monitor real-time bus locations, 
          while schools maintain complete control and safety.
        </p>

        <div className="mt-10 flex gap-5">
          <button
            onClick={() => router.push('/signup')}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            Get Started
          </button>

          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition"
          >
            Learn More
          </button>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          
          <div className="p-6 rounded-xl bg-slate-50 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-600">
              Real-Time Tracking
            </h3>
            <p className="mt-3 text-gray-600 text-sm">
              Parents can view live bus locations and estimated arrival times.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-50 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-600">
              School Dashboard
            </h3>
            <p className="mt-3 text-gray-600 text-sm">
              Easily manage buses, drivers, routes, and student assignments.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-50 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-600">
              Safe & Reliable
            </h3>
            <p className="mt-3 text-gray-600 text-sm">
              Designed with security and reliability as top priorities.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500 bg-slate-50">
        © {new Date().getFullYear()} TrackMyBus. All rights reserved.
      </footer>

    </div>
  )
}

export default Page