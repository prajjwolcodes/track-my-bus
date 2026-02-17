"use client"

import { RecaptchaVerifier, signInWithEmailAndPassword, signInWithPhoneNumber } from "firebase/auth"
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

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
    phone: z.string().optional(),
})

const phoneSchema = z.object({
    role: z.enum(["driver", "student"]),
    phone: z
        .string()
        .min(10, "Phone must be at least 10 digits")
        .regex(/^\d+$/, "Phone must be numeric"),
    studentId: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
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
    const [phone, setPhone] = useState("")
    const [schools, setSchools] = useState<any[]>([])
    const [driver, setDriver] = useState<any>(null)
    const [selectedSchoolId, setSelectedSchoolId] = useState("")

    const [confirmationResult, setConfirmationResult] = useState<any>(null)
    const [otp, setOtp] = useState("")
    const [mpin, setMpin] = useState("")



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

    const saveMPIN = async () => {
        if (!driver?.id) {
            alert("Driver not found")
            return
        }

        if (!mpin || mpin.length < 4) {
            alert("Please enter a valid MPIN")
            return
        }

        setLoading(true)
        try {
            const driverRef = doc(db, "drivers", driver.id)
            const mpinHash = await hashMPIN(mpin)

            await updateDoc(driverRef, {
                mpin: mpinHash,
            })

            alert("MPIN set successfully")
            router.push("/driver")
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

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

    useEffect(() => {
        async function fetchSchools() {
            try {
                const schoolsSnapshot = await getDocs(collection(db, "schools"))
                const schoolsData = schoolsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                console.log(schoolsData)
                setSchools(schoolsData)
            } catch (err) {
                console.error("Error fetching schools:", err)
            }
        }
        if (role !== "school") { fetchSchools() }
    }, [role])

    const onSubmit = async (data: FormValues) => {
        setLoading(true)

        try {
            // SCHOOL LOGIN
            if (data.role === "school") {
                const userCredential = await signInWithEmailAndPassword(auth, data.email.trim(), data.password)
                const uid = userCredential.user.uid
                const userDoc = await getDoc(doc(db, "schools", uid))

                if (!userDoc.exists()) {
                    alert("User data not found in schools collection")
                    return
                }
                router.push("/school")
            }

            // DRIVER/STUDENT LOGIN
            if (data.role === "driver" || data.role === "student") {
                if (!selectedSchoolId) {
                    alert("Please select school")
                    return
                }
                setPhone(data.phone)

                if (!schools || schools.length === 0) return
                const q = query(collection(db, "drivers"), where("schoolId", "==", selectedSchoolId), where("phone", "==", data.phone));
                const querySnapshot = await getDocs(q);
                const driverDocs: any[] = [];
                querySnapshot.forEach((doc) => {
                    driverDocs.push({
                        id: doc.id,
                        ...doc.data()
                    })
                });

                setDriver(driverDocs[0])

                if (querySnapshot.empty) {
                    alert("No driver found with this phone number in the selected school")
                    return
                }
                if (!querySnapshot.docs[0].data().mpin) {
                    try {
                        setupRecaptcha()
                        const appVerifier = (window as any).recaptchaVerifier
                        // Nepal format example (+977)
                        const formattedPhone = `+977${data.phone}`
                        const confirmation = await signInWithPhoneNumber(
                            auth,
                            formattedPhone,
                            appVerifier
                        )
                        setConfirmationResult(confirmation)
                        setStep("otp")
                        alert("OTP sent successfully")
                    } catch (err) {
                        console.log(err)
                        alert("Failed to send OTP")
                    }
                    return
                }
                setStep("mpin")
            }
        } catch (error: any) {
            console.log(error)
            alert(error.code || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    // MPIN LOGIN FUNCTION
    const handleMPINLogin = async (mpin: string) => {
        if (!driver?.id) {
            alert("Driver not found")
            return
        }

        if (!mpin || mpin.length < 4) {
            alert("Please enter a valid MPIN")
            return
        }

        setLoading(true)
        try {

            if (!driver.id) {
                alert("User data not found in database")
                return
            }

            const storedHash = driver?.mpin
            if (!storedHash) {
                alert("MPIN not set. Please verify OTP first.")
                return
            }

            const mpinHash = await hashMPIN(mpin)
            if (mpinHash !== storedHash) {
                alert("Invalid MPIN")
                return
            }

            router.push("/driver")
        } catch (error) {
            console.log(error)
            alert("Login failed")
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
                                        <SelectItem value="student">Student</SelectItem>
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
                                        {role === "school" && errors.email && (
                                            <p className="text-sm text-red-500">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Password</Label>
                                        <Input type="password" {...register("password")} />
                                        {role === "school" && errors.password && (
                                            <p className="text-sm text-red-500">
                                                {errors.password.message}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Phone */}
                            {(role === "driver" || role === "student") && (
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input {...register("phone")} />
                                    {errors.phone && (
                                        <p className="text-sm text-red-500">
                                            {errors.phone.message}
                                        </p>
                                    )}
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
