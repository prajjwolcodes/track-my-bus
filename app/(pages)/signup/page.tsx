"use client"

import React, { useState } from "react"
import Link from "next/link"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/firebase/firebase"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
    Mail,
    Lock,
    MapPin,
    Phone,
    User,
    Loader2,
    Eye,
    EyeOff,
    HeadphonesIcon,
} from "lucide-react"

import { Libre_Baskerville, Nunito } from "next/font/google"

const libreBaskerville = Libre_Baskerville({
    subsets: ["latin"],
    weight: ["400", "700"],
})

const nunito = Nunito({
    subsets: ["latin"],
    weight: ["400", "600", "700"],
})

const Signup = () => {
    const router = useRouter()

    const [name, setName] = useState("")
    const [address, setAddress] = useState("")
    const [email, setEmail] = useState("")
    const [contact, setContact] = useState("")
    const [password, setPassword] = useState("")

    const [showPassword, setShowPassword] =
        useState(false)

    const [loading, setLoading] = useState(false)

    const handleRegister = async () => {
        if (
            !name ||
            !address ||
            !email ||
            !contact ||
            !password
        ) {
            alert("Please fill all fields")
            return
        }

        try {
            setLoading(true)

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                )

            const user = userCredential.user

            const uid = user.uid

            const schoolId =
                "SCH" +
                uid.slice(-6).toUpperCase()

            await setDoc(
                doc(db, "schools", uid),
                {
                    schoolId,
                    name: `${name} (${schoolId})`,
                    address,
                    email,
                    contact,
                    role: "school",
                    createdAt:
                        serverTimestamp(),
                }
            )

            await setDoc(
                doc(db, "users", uid),
                {
                    role: "school",
                    schoolId,
                    name,
                    email,
                    contact,
                    createdAt:
                        serverTimestamp(),
                }
            )

            alert(
                `School registered successfully! ID: ${schoolId}`
            )

            router.push("/signin")
        } catch (error: any) {
            alert(
                error.message ||
                    "Registration failed"
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center px-4 py-6">

            {/* MAIN CARD */}
            <div className="w-full max-w-5xl bg-white rounded-[34px] overflow-hidden shadow-[0_25px_90px_rgba(0,0,0,0.08)] grid lg:grid-cols-2">

                {/* LEFT IMAGE PANEL */}
                <div className="relative hidden lg:block min-h-full">

                    {/* IMAGE */}
                    <img
                        src="/bus.png"
                        alt="SmartYatra"
                        className="absolute inset-0 h-full w-full object-cover"
                    />

                    {/* OVERLAY */}
                    <div className="absolute inset-0 bg-linear-to-br from-[#001B44]/80 via-[#003B80]/75 to-[#00152f]/80" />

                    {/* CONTENT */}
                    <div className="relative z-10 flex h-full flex-col justify-between p-8">

                        {/* TOP */}
                        <div>
                            <h1
                                className={`text-4xl leading-tight text-white italic font-bold mb-4 ${libreBaskerville.className}`}
                            >
                                SmartYatra
                            </h1>

                            <p
                                className={`${nunito.className} text-white/80 leading-relaxed max-w-md text-base`}
                            >
                                SmartYatra is a modern
                                school transportation
                                platform that helps
                                schools, parents, and
                                drivers stay connected
                                through real-time bus
                                tracking, instant
                                notifications, and
                                safety-focused transport
                                management.
                            </p>
                        </div>

                        {/* BOTTOM */}
                        <div
                            className={`${nunito.className} flex items-center justify-between text-xs text-white/70`}
                        >
                            <span>
                                © 2026 SmartYatra
                            </span>
                            <span>
                                Secure Access
                            </span>
                        </div>
                    </div>
                </div>

                {/* RIGHT FORM SECTION */}
                <div className="flex items-center justify-center px-6 py-8 md:px-12 md:py-10">

                    <div className="w-full max-w-md">
                        {/* TITLE */}
                        <div className="mb-4">

                            <h2
                                className={`${libreBaskerville.className} text-4xl text-[#002D72] mb-2`}
                            >
                                Create Account
                            </h2>

                            <p
                                className={`${nunito.className} text-gray-500 text-sm mb-3`}
                            >
                                Register your school to
                                start managing smarter
                                transportation.
                            </p>
                        </div>

                        {/* FORM */}
                        <div className="space-y-2">

                            {/* SCHOOL NAME */}
                            <div className="space-y-2">

                                <Label className="text-xs font-semibold text-gray-700">
                                    School Name
                                </Label>

                              <div className="relative">

                                    <User
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <Input
                                        value={name}
                                        onChange={(e) =>
                                            setName(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="Enter school name"
                                        className="h-12 rounded-xl border-gray-200 bg-[#FAFAFA] pl-12 focus-visible:ring-2 focus-visible:ring-[#0041A3]"
                                    />
                                </div>
                            </div>

                            {/* ADDRESS */}
                            <div className="space-y-2">

                                <Label className="text-xs font-semibold text-gray-700">
                                    Address
                                </Label>

                                <div className="relative">

                                    <MapPin
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <Input
                                        value={address}
                                        onChange={(e) =>
                                            setAddress(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="School address"
                                        className="h-12 rounded-xl border-gray-200 bg-[#FAFAFA] pl-12 focus-visible:ring-2 focus-visible:ring-[#0041A3]"
                                    />
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div className="space-y-2">

                                <Label className="text-xs font-semibold text-gray-700">
                                    Email Address
                                </Label>

                                <div className="relative">

                                    <Mail
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <Input
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="Enter email address"
                                        className="h-12 rounded-xl border-gray-200 bg-[#FAFAFA] pl-12 focus-visible:ring-2 focus-visible:ring-[#0041A3]"
                                    />
                                </div>
                            </div>

                            {/* CONTACT */}
                            <div className="space-y-2">

                                <Label className="text-xs font-semibold text-gray-700">
                                    Contact Number
                                </Label>

                                <div className="relative">

                                    <Phone
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <Input
                                        value={contact}
                                        onChange={(e) =>
                                            setContact(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="98XXXXXXXX"
                                        className="h-12 rounded-xl border-gray-200 bg-[#FAFAFA] pl-12 focus-visible:ring-2 focus-visible:ring-[#0041A3]"
                                    />
                                </div>
                            </div>

                            {/* PASSWORD */}
                            <div className="space-y-2">

                                <Label className="text-xs font-semibold text-gray-700">
                                    Password
                                </Label>

                                <div className="relative">

                                    <Lock
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <Input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="••••••••"
                                        className="h-12 rounded-xl border-gray-200 bg-[#FAFAFA] pl-12 pr-12 focus-visible:ring-2 focus-visible:ring-[#0041A3]"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    >
                                        {showPassword ? (
                                            <EyeOff
                                                size={
                                                    18
                                                }
                                            />
                                        ) : (
                                            <Eye
                                                size={
                                                    18
                                                }
                                            />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* BUTTON */}
                            <Button
                                onClick={
                                    handleRegister
                                }
                                className="w-full h-12 rounded-xl bg-[#0041A3] hover:bg-[#003482] text-white font-semibold shadow-lg shadow-blue-900/20 transition-all mt-2"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </div>

                        {/* FOOTER */}
                        <div className="mt-8 text-center">

                            <p className="text-sm text-gray-500">

                                Already have an
                                account?{" "}

                                <Link
                                    href="/signin"
                                    className="font-semibold text-[#0041A3] hover:underline"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Signup