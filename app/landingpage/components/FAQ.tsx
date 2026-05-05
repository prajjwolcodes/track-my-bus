"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How does the bus tracking system work?",
    answer:
      "The system uses GPS technology to track the live location of school buses. Once the driver starts the trip, the location is updated in real time and displayed on the map for parents and administrators.",
  },
  {
    question: "Can parents track the bus in real time?",
    answer:
      "Yes, parents can log in to the app to see the exact location of the bus on a live map, along with estimated time of arrival.",
  },
  {
    question: "Will I receive notifications about bus arrival?",
    answer:
      "Absolutely. The system sends automated push notifications or SMS alerts when the bus is approaching your specific stop.",
  },
  {
    question: "Can schools manage multiple buses and routes?",
    answer:
      "Yes, the dashboard allows administrators to monitor an entire fleet, manage various routes, and assign drivers to specific shifts.",
  },
  {
    question: "What happens if there is a delay or route change?",
    answer:
      "In case of delays or route adjustments, the system updates the ETA automatically and can send broadcast alerts to all affected parents.",
  },
  {
    question: "Is this system suitable for all schools?",
    answer:
      "Yes, the platform is scalable and designed to work for small private schools as well as large public school districts.",
  },
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="min-h-screen bg-[#F9F9F4] py-16 px-6 md:px-20 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Side: Title and Description */}
        <div className="space-y-6">
          <h2 className="text-5xl md:text-6xl font-serif text-[#333333] leading-tight">
            Frequently Asked <br /> Questions
          </h2>
          <p className="text-[#666666] text-lg max-w-md leading-relaxed">
            Find answers to frequently asked questions about how the SmartYatra school bus tracking system works, including its real-time GPS tracking, safety monitoring features, instant notifications, route management, and how it helps parents, schools, and drivers stay connected throughout every journey.
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="bg-[#F1F2F4] rounded-2xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-[17px] font-semibold text-[#333333]">
                  {item.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-[#333333]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#333333]" />
                )}
              </button>

              <div
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-40 pb-6" : "max-h-0"
                }`}
              >
                <p className="text-[#555555] text-[15px] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;