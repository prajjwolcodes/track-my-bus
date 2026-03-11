import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-gray-50 text-gray-800">

      {/* NAVBAR */}
      <nav className="sticky top-0 backdrop-blur bg-white/70 border-b z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

          <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            🚍 Track My Bus
          </h1>

          <div className="hidden md:flex gap-8 font-medium text-gray-700">
            <a href="#" className="hover:text-blue-900">Home</a>
            <a href="#features" className="hover:text-blue-900">Features</a>
            <a href="#how" className="hover:text-blue-900">How It Works</a>
            <a href="#contact" className="hover:text-blue-900">Contact</a>
          </div>

          <div className="flex gap-3">
            <Link href="/signin">
              <button className="border border-blue-900 px-4 py-2 rounded-lg hover:bg-blue-50">
                Sign In
              </button>
            </Link>

            <Link href="/signup">
              <button className="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800 shadow">
                Get Started
              </button>
            </Link>
          </div>

        </div>
      </nav>


      {/* HERO */}
      <section className="py-28 bg-linear-to-r from-blue-900 via-indigo-900 to-purple-900 text-white">

        <div className="max-w-4xl mx-auto text-center px-6">

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Smart School Bus <br /> Tracking System
          </h1>

          <p className="text-lg md:text-xl text-gray-200 mb-10">
            Monitor school buses in real time and ensure student safety with
            Track My Bus. A smart solution for schools, parents, and drivers.
          </p>

          <div className="flex justify-center gap-5">

            <Link href="/signup">
              <button className="bg-white text-blue-900 font-semibold px-6 py-3 rounded-lg shadow hover:scale-105 transition">
                Start Tracking
              </button>
            </Link>

            <a href="#features">
              <button className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-900 transition">
                Learn More
              </button>
            </a>

          </div>

        </div>
      </section>


      {/* FEATURES */}
      <section id="features" className="py-24">

        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-4xl font-bold text-center mb-16">
            Powerful Features
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            {[
              "Real-time Bus Tracking",
              "Parent Notifications",
              "Driver Route Updates",
              "Transport Management",
              "Secure Authentication",
              "Live Bus Status"
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition"
              >

                <div className="text-blue-900 text-3xl mb-4">
                  🚍
                </div>

                <h3 className="text-lg font-semibold mb-2">
                  {feature}
                </h3>

                <p className="text-gray-600">
                  Reliable technology to improve school transportation monitoring.
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section id="how" className="py-24 bg-gray-100">

        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-4xl font-bold text-center mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            {[
              "School registers buses and students",
              "Driver shares live bus location",
              "Parents track the bus instantly"
            ].map((step, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow text-center">

                <div className="w-14 h-14 mx-auto bg-blue-900 text-white flex items-center justify-center rounded-full text-xl font-bold">
                  {index + 1}
                </div>

                <p className="mt-6 text-gray-700">
                  {step}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>


      {/* USER ROLES */}
      <section className="py-24">

        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-4xl font-bold text-center mb-16">
            Who Uses Track My Bus
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            {[
              { title: "Schools", desc: "Manage buses, routes, and students easily." },
              { title: "Drivers", desc: "Share live location and update routes." },
              { title: "Parents", desc: "Track your child's bus safely in real time." }
            ].map((role, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow hover:shadow-xl transition text-center">

                <h3 className="text-xl font-semibold mb-4">
                  {role.title}
                </h3>

                <p className="text-gray-600">
                  {role.desc}
                </p>

              </div>
            ))}

          </div>

        </div>
      </section>


      {/* CTA */}
      <section className="py-24 bg-linear-to-r from-blue-900 to-indigo-900 text-white text-center">

        <h2 className="text-4xl font-bold mb-6">
          Start Tracking School Buses Today
        </h2>

        <p className="mb-10 text-lg text-gray-200">
          Join schools and parents who trust Track My Bus for safer transportation.
        </p>

        <Link href="/signup">
          <button className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:scale-105 transition shadow">
            Create Free Account
          </button>
        </Link>

      </section>


      {/* FOOTER */}
      <footer id="contact" className="bg-gray-900 text-gray-300 py-12">

        <div className="max-w-6xl mx-auto px-6 text-center">

          <h3 className="text-xl font-semibold mb-4">
            🚍 Track My Bus
          </h3>

          <p className="mb-6 text-gray-400">
            Smart school transportation tracking system.
          </p>

          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Track My Bus. All rights reserved.
          </p>

        </div>

      </footer>

    </main>
  )
}

