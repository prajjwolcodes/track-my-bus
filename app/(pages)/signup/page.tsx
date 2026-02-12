"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";
import { useRouter } from "next/navigation";

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
        <div className="signup-page">
            <h2>Sign Up</h2>

            <label htmlFor="name">School's Name:</label>
            <input
                id="name"
                type="text"
                placeholder="Name"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
            />
            <br />

            <label htmlFor="address">Address:</label>
            <input
                id="address"
                type="text"
                placeholder="Address"
                value={address}
                required
                onChange={(e) => setAddress(e.target.value)}
            />
            <br />

            <label htmlFor="email">Email:</label>
            <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
            />
            <br />

            <label htmlFor="contact">Contact:</label>
            <input
                id="contact"
                type="text"
                placeholder="Contact Number"
                value={contact}
                required
                onChange={(e) => setContact(e.target.value)}
            />
            <br />

            <label htmlFor="password">Password:</label>
            <input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
            />
            <br /><br />

            <button onClick={handleRegister}>Register School</button>
        </div>
    );
};

export default Signup;
