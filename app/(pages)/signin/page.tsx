"use client"

import { RecaptchaVerifier, signInWithCustomToken, signInWithEmailAndPassword, signInWithPhoneNumber } from "firebase/auth"
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { auth, db } from "@/firebase/firebase"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { hashMPIN } from "@/lib/hashMpin"
import { Loader2 } from "lucide-react"
import MPINComponent from "./MpinComponent"

const schoolSchema = z.object({
    role: z.literal("school"),
    email: z.string().email("Invalid email"),
    password: z.string(),

})

const phoneSchema = z.object({
    role: z.enum(["driver", "parent"]),
    phone: z
        .string()
        .min(10, "Phone must be at least 10 digits")
        .regex(/^\d+$/, "Phone must be numeric"),

})

const formSchema = z.discriminatedUnion("role", [
    schoolSchema,
    phoneSchema,
])

type FormValues = z.infer<typeof formSchema>

export default function AuthForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<"form" | "otp" | "mpin" | "mpin-setup">("form")
    const [schools, setSchools] = useState<any[]>([])
    const userDataRef = useRef<any>(null)
    const [selectedSchoolId, setSelectedSchoolId] = useState("")
    const [confirmationResult, setConfirmationResult] = useState<any>(null)
    const [otp, setOtp] = useState("")
    const [mpin, setMpin] = useState("")

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            role: "school",
        },
    })

    const role = watch("role")

    // Fetch schools once on mount, not on every role change
    useEffect(() => {
        async function fetchSchools() {
            try {
                const schoolsSnapshot = await getDocs(collection(db, "schools"))
                const schoolsData = schoolsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                setSchools(schoolsData)
            } catch (err) {
                console.error("Error fetching schools:", err)
            }
        }
        fetchSchools()
    }, [])

    const onSubmit = async (data: FormValues) => {
        setLoading(true)

        try {
            // SCHOOL LOGIN
            if (data.role === "school") {
                const userCredential = await signInWithEmailAndPassword(auth, data.email.trim(), data.password)
                const userDoc = await getDoc(doc(db, "schools", userCredential.user.uid))

                if (!userDoc.exists()) {
                    alert("User data not found in schools collection")
                    return
                }
                await fetch("/api/session/set-cookie", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: await userCredential.user.getIdToken(), role: "school" }),
                })
                router.push("/school")
                return
            }

            // DRIVER/PARENT LOGIN
            if (!selectedSchoolId) {
                alert("Please select school")
                return
            }

            const q = data.role === "driver" ?
                query(collection(db, "drivers"), where("schoolId", "==", selectedSchoolId), where("phone", "==", data.phone))
                :
                query(collection(db, "students"), where("schoolId", "==", selectedSchoolId), where("parentPhone", "==", data.phone))

            const querySnapshot = await getDocs(q)

            if (querySnapshot.empty) {
                alert(`No ${data.role} found with this phone number in the selected school`)
                return
            }
            userDataRef.current = querySnapshot.docs[0].data()
            userDataRef.current.id = querySnapshot.docs[0].id

            if (!userDataRef.current.mpin) {
                setupRecaptcha()
                const appVerifier = (window as any).recaptchaVerifier
                const formattedPhone = `+977${data.phone}`

                try {
                    const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier)
                    setConfirmationResult(confirmation)
                    setStep("otp")
                    alert("OTP sent successfully")
                } catch (err) {
                    console.error("OTP Error:", err)
                    alert("Failed to send OTP")
                }
                return
            }

            setStep("mpin")
        } catch (error: any) {
            console.error(error)
            alert(error.code || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const handleMPINLogin = async (mpin: string) => {
        if (!mpin || mpin.length < 4) {
            alert("Please enter a valid MPIN")
            return
        }

        setLoading(true)

        try {
            if (!userDataRef.current?.mpin) {
                alert("MPIN not set. Please verify OTP first.")
                return
            }

            const mpinHash = await hashMPIN(mpin)

            if (mpinHash !== userDataRef.current.mpin) {
                alert("Invalid MPIN")
                return
            }

            // 🔹 Generate token from server
            const res = await fetch("/api/session/mpin-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: userDataRef.current.id,
                    role
                }),
            })

            const data = await res.json()

            const token = data.token

            // 🔹 Sign in to Firebase
            await signInWithCustomToken(auth, token)

            // 🔹 Get ID token
            const idToken = await auth.currentUser?.getIdToken()

            // 🔹 Send cookie to server
            await fetch("/api/session/set-cookie", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: idToken, role }),
            })

            router.push(role === "driver" ? "/driver" : "/parent")

        } catch (error) {
            console.error(error)
            alert("Login failed")
        } finally {
            setLoading(false)
        }
    }

    const saveMPIN = async () => {
        if (!userDataRef.current?.id) {
            alert("User not found")
            return
        }

        if (!mpin || mpin.length < 4) {
            alert("Please enter a valid MPIN")
            return
        }

        setLoading(true)
        try {
            const mpinHash = await hashMPIN(mpin)
            const isDriver = !!userDataRef.current.driverId

            const userRef = doc(db, isDriver ? "drivers" : "students", userDataRef.current.id)
            await updateDoc(userRef, { mpin: mpinHash })

            alert("MPIN set successfully")
            const res = await fetch("/api/session/mpin-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: userDataRef.current.id,
                    role
                }),
            })

            const data = await res.json()

            const token = data.token

            // 🔹 Sign in to Firebase
            await signInWithCustomToken(auth, token)

            // 🔹 Get ID token
            const idToken = await auth.currentUser?.getIdToken()

            // 🔹 Send cookie to server
            await fetch("/api/session/set-cookie", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: idToken, role }),
            })

            router.push(role === "driver" ? "/driver" : "/parent")
        } catch (error) {
            console.error(error)
            alert("Failed to save MPIN")
        } finally {
            setLoading(false)
        }
    }


    const setupRecaptcha = () => {
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(
                auth,
                "recaptcha-container",
                {
                    size: "invisible",
                    callback: () => {
                        console.log("reCAPTCHA solved")
                    },
                }
            )
        }
    }

    const verifyOTP = async () => {
        if (!confirmationResult) {
            alert("Please request OTP again")
            return
        }

        if (!otp || otp.length < 4) {
            alert("Please enter a valid OTP")
            return
        }

        setLoading(true)
        try {
            const result = await confirmationResult.confirm(otp)

            console.log("OTP verified", result.user)

            setStep("mpin-setup") // move to MPIN setup
        } catch (error) {
            alert("Invalid OTP")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <div id="recaptcha-container"></div>

            <Card className="w-full max-w-lg shadow-xl rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl text-center font-semibold">
                        Login
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {step === "form" && (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">

                            {/* Role */}
                            <div className="space-y-2">
                                <Label>Login As</Label>
                                <Select
                                    defaultValue="school"
                                    onValueChange={(value) =>
                                        setValue("role", value as any)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="school">School</SelectItem>
                                        <SelectItem value="driver">Driver</SelectItem>
                                        <SelectItem value="parent">Parent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {role !== "school" && (
                                <div className="space-y-2 w-full">
                                    <Select
                                        value={selectedSchoolId}
                                        onValueChange={(value) => setSelectedSchoolId(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select School" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {schools.map((school) => (
                                                <SelectItem key={school.schoolId} value={school.schoolId}>
                                                    {school.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* School Fields */}
                            {role === "school" && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input {...register("email")} />

                                    </div>

                                    <div className="space-y-2">
                                        <Label>Password</Label>
                                        <Input type="password" {...register("password")} />

                                    </div>
                                </>
                            )}

                            {/* Phone */}
                            {(role === "driver" || role === "parent") && (
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input {...register("phone")} />

                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full rounded-xl"
                                disabled={loading}
                            >
                                {loading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Continue
                            </Button>
                        </form>
                    )}

                    {/* OTP STEP */}
                    {step === "otp" && (
                        <div className="space-y-4">
                            <Label>Enter OTP</Label>
                            <Input
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                            <Button
                                className="w-full rounded-xl"
                                onClick={verifyOTP}
                                disabled={loading}
                            >
                                {loading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Verify OTP
                            </Button>
                        </div>
                    )}

                    {/* MPIN SETUP STEP */}
                    {step === "mpin-setup" && (
                        <div className="space-y-4">
                            <Label>Create new MPIN</Label>
                            <Input
                                type="password"
                                placeholder="Enter MPIN"
                                value={mpin}
                                onChange={(e) => setMpin(e.target.value)}
                            />
                            <Button
                                className="w-full rounded-xl"
                                onClick={saveMPIN}
                                disabled={loading}
                            >
                                {loading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Save MPIN
                            </Button>
                        </div>
                    )}

                    {/* MPIN STEP */}
                    {step === "mpin" && (
                        <MPINComponent onSubmit={handleMPINLogin} loading={loading} />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

// MPIN COMPONENT
