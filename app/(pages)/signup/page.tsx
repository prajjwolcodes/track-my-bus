"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Signup: React.FC = () => {
    const router = useRouter();

    const [name, setName] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [contact, setContact] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleRegister = async () => {
        if (!name || !address || !email || !contact || !password) {
            alert("Please fill all fields");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;
            const uid = user.uid;
            const schoolId = "SCH" + user.uid.slice(-6).toUpperCase();

            // 1 Add to 'schools' collection 
            await setDoc(doc(db, "schools", uid), {
                schoolId,
                name,
                address,
                email,
                contact,
                role: "school",
                createdAt: serverTimestamp(),
            });

            // 2️ Add to 'users' collection 
            await setDoc(doc(db, "users", uid), {
                role: "school",
                schoolId,
                name,
                email,
                contact,
                createdAt: serverTimestamp(),
            });

            alert(`School registered successfully! School ID: ${schoolId}`);
            console.log(user)

            router.push("/signin");

        } catch (error: any) {
            if (error.code === "auth/email-already-in-use") {
                alert("Email already registered.");
            } else if (error.code === "auth/weak-password") {
                alert("Password should be at least 6 characters.");
            } else {
                alert("Registration failed. Try again.");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/40 to-muted px-4">
            <Card className="w-full max-w-md shadow-xl border-0">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">
                        Sign Up
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">School's Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Name"
                            value={name}
                            required
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            type="text"
                            placeholder="Address"
                            value={address}
                            required
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            required
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contact">Contact</Label>
                        <Input
                            id="contact"
                            type="text"
                            placeholder="Contact Number"
                            value={contact}
                            required
                            onChange={(e) => setContact(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <Button
                        onClick={handleRegister}
                        className="w-full mt-2"
                    >
                        Register School
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Signup;
