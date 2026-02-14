'use client'  

import React from 'react'
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <h1 className="text-4xl text-center font-semibold mb-8">
        Welcome to Track My Bus
      </h1>

      <div className="flex gap-4">
        <button
          onClick={() => router.push('/signin')}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Sign In
        </button>

        <button
          onClick={() => router.push('/signup')}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          Sign Up
        </button>
      </div>
    </div>
  )
}


export default Page
