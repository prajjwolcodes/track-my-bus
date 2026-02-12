"use client";
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const Signin: React.FC = () => {
    const router = useRouter();

    const [role, setRole] = useState<string>("school");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [studentId, setStudentId] = useState<string>("");

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            alert("Please fill all fields");
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );

            const uid = userCredential.user.uid;

            let userDoc;

            if (role === "school") {
                userDoc = await getDoc(doc(db, "schools", uid));
            } else if (role === "driver") {
                userDoc = await getDoc(doc(db, "drivers", uid));
            } else if (role === "student") {
                userDoc = await getDoc(doc(db, "students", uid));
            }

            if (!userDoc || !userDoc.exists()) {
                alert("User data not found in database");
                return;
            }

            const userData = userDoc.data();

            // Student ID validation
            if (role === "student") {
                if (!studentId.trim()) {
                    alert("Please enter Student ID");
                    return;
                }

                if (userData.studentId !== studentId.trim()) {
                    alert("Invalid Student ID");
                    return;
                }
            }

            // Redirect
            if (role === "school") {
                router.push("/school");
            } else if (role === "driver") {
                router.push("/driver");
            } else if (role === "student") {
                router.push("/student");
            }

        } catch (error: any) {
            console.error(error);
            alert(error.code);
        }
    };

    return (
        <div className="school-login">
            <h2>Login</h2>

            <label htmlFor="role">Login As:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="school">School</option>
                <option value="driver">Driver</option>
                <option value="student">Student</option>
            </select>
            <br /><br />

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

            {role === "student" && (
                <>
                    <label>Student ID:</label>
                    <input
                        type="text"
                        placeholder="Enter Student ID"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                    />
                    <br /><br />
                </>
            )}
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default Signin;
