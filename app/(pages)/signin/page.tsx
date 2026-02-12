"use client";
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase/firebase";
import { useRouter } from "next/navigation";

const Signin: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please fill all fields");
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            alert("Login successful! Welcome back");
            console.log("Logged in user:", userCredential.user);

            router.push("/");
        } catch (error: any) {
            console.error("Login error:", error.message);
            alert(error.message);
        }
    };

    return (
        <div className="school-login">
            <h2>Login</h2>

            <label htmlFor="email">Email:</label>
            <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
            />
            <br /><br />

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

            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default Signin;
