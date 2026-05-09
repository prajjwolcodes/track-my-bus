"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
    RecaptchaVerifier,
    signInWithCustomToken,
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
} from "firebase/auth"

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore"

import { auth, db } from "@/firebase/firebase"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { hashMPIN } from "@/lib/hashMpin"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

import {
    Loader2,
    Mail,
    Lock,
    Eye,
    EyeOff,
    HeadphonesIcon,
    Phone,
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

/* ---------------- SCHEMA ---------------- */

const schoolSchema = z.object({
    role: z.literal("school"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password required"),
})

const phoneSchema = z.object({
    role: z.enum(["driver", "parent"]),
    phone: z
        .string()
        .min(10, "10 digits required")
        .regex(/^\d+$/, "Numeric only"),
})

const formSchema = z.discriminatedUnion("role", [
    schoolSchema,
    phoneSchema,
])

type FormValues = z.infer<typeof formSchema>

/* ---------------- COMPONENT ---------------- */

export default function AuthForm() {
    const router = useRouter()

    const [loading, setLoading] = useState(false)

    const [step, setStep] = useState<
        "form" | "otp" | "mpin"
    >("form")

    const [showPassword, setShowPassword] =
        useState(false)

    const [mpin, setMpin] = useState([
        "",
        "",
        "",
        "",
    ])

    const userDataRef = useRef<any>(null)

    const [confirmationResult, setConfirmationResult] =
        useState<any>(null)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),

        defaultValues: {
            role: "school" as any,
        },
    })

    const role = watch("role")

    /* ---------------- PRELOAD ---------------- */

    useEffect(() => {
        async function fetchSchools() {
            try {
                await getDocs(collection(db, "schools"))
            } catch (err) {
                console.error(err)
            }
        }

        fetchSchools()
    }, [])

    /* ---------------- MPIN ---------------- */

    const handleMpinChange = (
        value: string,
        index: number
    ) => {
        if (isNaN(Number(value))) return

        const newMpin = [...mpin]

        newMpin[index] = value.slice(-1)

        setMpin(newMpin)

        if (value && index < 3) {
            const nextInput = document.getElementById(
                `mpin-${index + 1}`
            )

            nextInput?.focus()
        }
    }

    /* ---------------- LOGIN ---------------- */

    const onSubmit = async (data: FormValues) => {
        setLoading(true)

        try {
            /* SCHOOL LOGIN */
            if (data.role === "school") {
                const cred =
                    await signInWithEmailAndPassword(
                        auth,
                        data.email,
                        data.password
                    )

                const userDoc = await getDoc(
                    doc(db, "schools", cred.user.uid)
                )

                if (!userDoc.exists()) {
                    throw new Error("School not found")
                }

                await fetch("/api/session/set-cookie", {
                    method: "POST",
                    body: JSON.stringify({
                        token:
                            await cred.user.getIdToken(),
                        role: "school",
                    }),
                })

                router.push("/school")

                return
            }

            /* DRIVER / PARENT */
            const q =
                data.role === "driver"
                    ? query(
                        collection(db, "drivers"),
                        where("phone", "==", data.phone)
                    )
                    : query(
                        collection(db, "students"),
                        where(
                            "parentPhone",
                            "==",
                            data.phone
                        )
                    )

            const snap = await getDocs(q)

            if (snap.empty) {
                alert(
                    "Account not found. Please contact school admin."
                )

                return
            }

            userDataRef.current = {
                ...snap.docs[0].data(),
                id: snap.docs[0].id,
            }

            if (!userDataRef.current.mpin) {
                setupRecaptcha()

                const confirm =
                    await signInWithPhoneNumber(
                        auth,
                        `+977${data.phone}`,
                        (window as any)
                            .recaptchaVerifier
                    )

                setConfirmationResult(confirm)

                setStep("otp")
            } else {
                setStep("mpin")
            }
        } catch (err: any) {
            alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    /* ---------------- MPIN LOGIN ---------------- */

    const handleMPINLogin = async () => {
        const mpinString = mpin.join("")

        if (mpinString.length < 4) return

        setLoading(true)

        try {
            const mpinHash =
                await hashMPIN(mpinString)

            if (mpinHash !== userDataRef.current.mpin)
                throw new Error("Invalid MPIN")

            const res = await fetch(
                "/api/session/mpin-login",
                {
                    method: "POST",
                    body: JSON.stringify({
                        uid: userDataRef.current.id,
                        role,
                    }),
                }
            )

            const { token } = await res.json()

            await signInWithCustomToken(auth, token)

            const idToken =
                await auth.currentUser?.getIdToken()

            await fetch("/api/session/set-cookie", {
                method: "POST",
                body: JSON.stringify({
                    token: idToken,
                    role,
                }),
            })

            router.push(
                role === "driver"
                    ? "/driver"
                    : "/parent"
            )
        } catch (err: any) {
            alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    /* ---------------- RECAPTCHA ---------------- */

    const setupRecaptcha = () => {
        if (!(window as any).recaptchaVerifier) {
            ; (window as any).recaptchaVerifier =
                new RecaptchaVerifier(
                    auth,
                    "recaptcha-container",
                    {
                        size: "invisible",
                    }
                )
        }
    }

    return (
        <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center px-4 py-6">

            <div id="recaptcha-container"></div>

            <div className="w-full max-w-4xl bg-white rounded-[34px] overflow-hidden shadow-[0_25px_90px_rgba(0,0,0,0.08)] grid lg:grid-cols-2">

                <div className="relative hidden lg:block min-h-full">

                    <img
                        src="/bus.png"
                        alt="SmartYatra"
                        className="absolute inset-0 h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-linear-to-br from-[#001B44]/80 via-[#003B80]/75 to-[#00152f]/80" />

                    <div className="relative z-10 flex h-full flex-col justify-between p-10">

                        <div>
                            <h1
                                className={`text-4xl text-white leading-tight font-bold mb-4 ${libreBaskerville.className}`}
                            >
                                SmartYatra
                            </h1>

                            <p
                                className={`${nunito.className} text-white/90 leading-relaxed max-w-md text-base`}
                            >
                                SmartYatra combines realtime school bus tracking, driver coordination, and parent notifications into one seamless platform focused on safety, efficiency, and better transportation management.
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

                {/* RIGHT FORM PANEL */}
                <div className="flex items-center justify-center px-6 py-8 md:px-12 md:py-10">

                    <div className="w-full max-w-md">
                        {/* TITLE */}
                        <div className="mb-8">

                            <h2
                                className={`${libreBaskerville.className} text-4xl text-[#002D72] mb-2`}
                            >
                                Welcome Back!
                            </h2>

                            <p
                                className={`${nunito.className} text-gray-500 text-sm`}
                            >
                                Login to continue your
                                SmartYatra experience.
                            </p>
                        </div>

                        {/* ROLE SWITCHER */}
                        <div className="bg-[#F4F6FA] rounded-2xl p-1 flex mb-8">

                            {[
                                {
                                    label: "School",
                                    value: "school",
                                },
                                {
                                    label: "Parent",
                                    value: "parent",
                                },
                                {
                                    label: "Driver",
                                    value: "driver",
                                },
                            ].map((r) => (
                                <button
                                    key={r.value}
                                    onClick={() => {
                                        setValue(
                                            "role",
                                            r.value as any
                                        )

                                        setStep("form")
                                    }}
                                    className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${role === r.value
                                            ? "bg-[#0041A3] text-white shadow-md"
                                            : "text-gray-500"
                                        }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>

                        {/* LOGIN FORM */}
                        {step === "form" && (
                            <form
                                onSubmit={handleSubmit(
                                    onSubmit
                                )}
                                className="space-y-5"
                            >

                                {/* SCHOOL */}
                                {role === "school" ? (
                                    <>
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
                                                    {...register(
                                                        "email"
                                                    )}
                                                    placeholder="Enter email address"
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
                                                    {...register(
                                                        "password"
                                                    )}
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
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
                                    </>
                                ) : (
                                    /* PHONE LOGIN */
                                    <div className="space-y-2">

                                        <Label className="text-xs font-semibold text-gray-700">
                                            Phone Number
                                        </Label>

                                        <div className="relative">

                                            <Phone
                                                size={18}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                            />

                                            <div className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                                                +977
                                            </div>

                                            <Input
                                                {...register(
                                                    "phone" as any
                                                )}
                                                placeholder="98XXXXXXXX"
                                                className="h-12 rounded-xl border-gray-200 bg-[#FAFAFA] pl-20 focus-visible:ring-2 focus-visible:ring-[#0041A3]"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* REMEMBER */}
                                <div className="flex items-center justify-between pt-1">

                                    <div className="flex items-center gap-2">

                                        <Checkbox id="remember" />

                                        <label
                                            htmlFor="remember"
                                            className="text-xs text-gray-500 cursor-pointer"
                                        >
                                            Remember me
                                        </label>
                                    </div>

                                    <button
                                        type="button"
                                        className="text-xs font-semibold text-[#0041A3]"
                                    >
                                        Need Help?
                                    </button>
                                </div>

                                {/* BUTTON */}
                                <Button className="w-full h-12 rounded-xl bg-[#0041A3] hover:bg-[#003482] text-white font-semibold shadow-lg shadow-blue-900/20 transition-all">

                                    {loading ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        "Secure Login"
                                    )}
                                </Button>
                            </form>
                        )}

                        {/* MPIN */}
                        {step === "mpin" && (
                            <div className="space-y-7">

                                <div>

                                    <h3 className="text-lg font-semibold text-[#002D72] mb-2">
                                        Enter mPIN
                                    </h3>

                                    <p className="text-sm text-gray-500">
                                        Enter your secure 4-digit
                                        mPIN to continue.
                                    </p>
                                </div>

                                <div className="flex gap-4">

                                    {[0, 1, 2, 3].map((i) => (
                                        <input
                                            key={i}
                                            id={`mpin-${i}`}
                                            type="password"
                                            maxLength={1}
                                            value={mpin[i]}
                                            onChange={(e) =>
                                                handleMpinChange(
                                                    e.target
                                                        .value,
                                                    i
                                                )
                                            }
                                            className="w-full aspect-square rounded-2xl border border-gray-200 bg-[#F7F7F7] text-center text-2xl font-bold focus:ring-2 focus:ring-[#0041A3]"
                                        />
                                    ))}
                                </div>

                                <Button
                                    onClick={
                                        handleMPINLogin
                                    }
                                    className="w-full h-12 rounded-xl bg-[#0041A3]"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        "Verify & Login"
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* FOOTER */}
                        <div className="mt-10 text-center">

                            <p className="text-sm text-gray-500">

                                Don&apos;t have access?{" "}

                                <Link
                                    href="/#contact"
                                    className="font-semibold text-[#0041A3] hover:underline"
                                >
                                    Contact School Admin
                                </Link>
                            </p>

                            <div className="mt-8 flex items-center justify-center gap-4 text-[11px] text-gray-400">

                                <Link
                                    href="/signin"
                                    className="hover:text-gray-600"
                                >
                                    Privacy Policy
                                </Link>

                                <span>•</span>

                                <Link
                                    href="/signin"
                                    className="hover:text-gray-600"
                                >
                                    Terms of Service
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SUPPORT BUTTON */}
            <button className="fixed bottom-6 right-6 hidden md:flex items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0041A3] shadow-xl transition-transform hover:scale-105">

                <HeadphonesIcon size={18} />

                Support Center
            </button>
        </div>
    )
}