import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-gray-50 text-gray-800">

      {/* NAVBAR */}
      <nav className="sticky top-0 bg-white shadow z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <h1 className="text-xl font-bold text-blue-900">🚍 Track My Bus</h1>

          <div className="hidden md:flex gap-6">
            <a href="#">Home</a>
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="flex gap-3">
            <Link href="/signin">
              <button className="border border-blue-900 px-4 py-2 rounded-md">
                Sign In
              </button>
            </Link>

            <Link href="/signup">
              <button className="bg-blue-900 text-white px-4 py-2 rounded-md">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>


      {/* HERO SECTION */}
      <section className="py-24 bg-linear-to-r from-blue-900 to-indigo-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Track Your Child's School Bus in Real Time
          </h1>

          <p className="text-lg mb-8">
            Track My Bus helps schools, parents, and drivers monitor school
            transportation in real time to improve student safety and
            transportation management.
          </p>

          <div className="flex justify-center gap-4">
            <Link href="/signup">
              <button className="bg-amber-50 text-blue-950 px-4 py-2 rounded-md">
                Get Started
              </button>
            </Link>
            <Link href="/">
              <button className="border border-white bg-amber-50 text-blue-900 px-4 py-2 rounded-md">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </section>


      {/* FEATURES */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-3xl font-bold text-center mb-12">
            Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            {[
              "Real-time Bus Tracking",
              "Parent Notifications",
              "Driver Route Updates",
              "School Transport Management",
              "Secure Authentication"
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-lg mb-2">
                  {feature}
                </h3>

                <p className="text-gray-600">
                  Reliable feature to improve school transportation monitoring.
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>


      {/* HOW IT WORKS */}
      <section id="how" className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            {[
              "School registers buses and students",
              "Driver shares live bus location",
              "Parents track the bus in real time"
            ].map((step, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow text-center"
              >
                <span className="text-3xl font-bold text-blue-900">
                  {index + 1}
                </span>

                <p className="mt-4">{step}</p>
              </div>
            ))}

          </div>
        </div>
      </section>


      {/* USER ROLES */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-3xl font-bold text-center mb-12">
            Who Uses Track My Bus
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            {[
              {
                title: "Schools",
                desc: "Manage buses, drivers, and students efficiently."
              },
              {
                title: "Drivers",
                desc: "Share live location and update bus routes."
              },
              {
                title: "Parents",
                desc: "Track your child’s school bus in real time."
              }
            ].map((role, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow text-center"
              >
                <h3 className="text-xl font-semibold mb-3">
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


      {/* BENEFITS */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-bold mb-12">
            Why Choose Track My Bus
          </h2>

          <div className="grid md:grid-cols-2 gap-8">

            {[
              "Improved student safety",
              "Real-time bus location updates",
              "Better transportation management",
              "Peace of mind for parents"
            ].map((benefit, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow"
              >
                {benefit}
              </div>
            ))}

          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="py-20 bg-linear-to-r from-blue-900 to-indigo-900 text-white text-center">

        <h2 className="text-3xl font-bold ">
          Start Tracking School Buses Today
        </h2>

        <p className="mb-8">
          Register your school or sign up as a parent to begin tracking buses.
        </p>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-gray-900 text-gray-300 py-10">

        <div className="max-w-6xl mx-auto px-6 text-center">

          <h3 className="text-lg font-semibold mb-4">
            🚍 Track My Bus
          </h3>

          <p className="mb-4">
            Smart school transportation tracking system.
          </p>

          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Track My Bus. All rights reserved.
          </p>

        </div>

      </footer>

    </main>
  )
}

