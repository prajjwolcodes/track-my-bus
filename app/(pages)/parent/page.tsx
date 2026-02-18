"use client";

import React from "react";

const Page = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-700">
          🚌 Live Bus Tracker
        </h1>
        <p className="text-gray-600">
          Track your child's school bus in real-time
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-4">
          <h2 className="text-lg font-semibold mb-3">📍 Live Location</h2>

          {/* Map Placeholder */}
          <div className="w-full h-96 bg-gray-200 rounded-xl flex items-center justify-center">
            <p className="text-gray-500">
              Google Map / Live GPS Map will appear here
            </p>
          </div>

          {/* Bus Status */}
          <div className="mt-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Current Status</p>
              <p className="text-green-600 font-semibold">
                🟢 Bus Arriving in 5 mins
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Speed</p>
              <p className="font-semibold">35 km/h</p>
            </div>
          </div>
        </div>

        {/* Student Status Card */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">👨‍🎓 Student</h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Name:</span>
              <span className="font-medium">Rahul Sharma</span>
            </div>

            <div className="flex justify-between">
              <span>Bus Number:</span>
              <span className="font-medium">BA-1234</span>
            </div>

            <div className="flex justify-between">
              <span>Pickup Status:</span>
              <span className="text-yellow-700 font-semibold">
                🟡 On the Way
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button className="mt-6 w-60 bg-blue-900 hover:bg-blue-700 text-white py-2 rounded-xl transition">
            ✅ Mark as Reached Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;