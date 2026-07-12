"use client";

import Image from "next/image";
import { useEffect, useState } from "react";


export default function Hero() {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth < 1280);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {isTablet ? (
        <section
          id="home"
          className="bg-[#fcfaf2] px-2 py-16 md:py-20 lg:py-20 overflow-hidden">
          <div className="relative mx-auto w-full rounded-4xl shadow-2xl overflow-visible">

            <section className="relative h-[calc(100vh-100px)] w-full overflow-hidden">
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
      ) :
        <section
          id="home"
          className="bg-[#fcfaf2] px-2 py-16 md:py-20 lg:py-20 overflow-hidden">
          <div className="relative mx-auto w-full rounded-4xl shadow-2xl overflow-visible">

            <section className="relative h-[calc(100vh-100px)] w-full overflow-hidden">
              <Image
                src="/logreg.png"
                alt="Hero Background"
                fill
                className="object rounded-4xl"
                priority
              />
            </section>

          </div>
        </section>
      }
    </>
  )
}