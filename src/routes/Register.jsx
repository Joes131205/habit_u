import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase";

import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendEmailVerification,
    onAuthStateChanged,
} from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { toast } from "react-hot-toast";

function Register() {
    const navigate = useNavigate();
    auth.useDeviceLanguage();

    const provider = new GoogleAuthProvider();

    const [inputData, setInputData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (inputData.password !== inputData.confirmPassword) {
            toast.error("Passwords do not match. Please try again.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                inputData.email,
                inputData.password
            );

            const userRef = doc(db, "users", userCredential.user.uid);
            await setDoc(userRef, {
                email: inputData.email,
                isEmailVerified: false,
                uid: userCredential.user.uid,
                emailVerified: userCredential.user.emailVerified,
            });

            await sendEmailVerification(userCredential.user);

            toast.success(
                "Registration successful! Please check your email to verify your account."
            );
            navigate("/home");
        } catch (error) {
            let errorMessage = "Registration failed. Please try again.";
            if (error.code === "auth/email-already-in-use") {
                errorMessage =
                    "An account already exists with this email address.";
            } else if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email address format.";
            } else if (error.code === "auth/weak-password") {
                errorMessage = "Password should be at least 6 characters.";
            }
            toast.error(errorMessage);
        }
    };

    const handleChange = (event) => {
        setInputData({ ...inputData, [event.target.name]: event.target.value });
    };

    async function handleRegisterWithGoogle() {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    username: user.displayName,
                    email: user.email,
                    isEmailVerified: user.emailVerified,
                    uid: user.uid,
                    emailVerified: user.emailVerified,
                    weekly: [
                        {
                            day: "Monday",
                            planId: "",
                        },
                        {
                            day: "Tuesday",
                            planId: "",
                        },
                        {
                            day: "Wednesday",
                            planId: "",
                        },
                        {
                            day: "Thursday",
                            planId: "",
                        },
                        {
                            day: "Friday",
                            planId: "",
                        },
                        {
                            day: "Saturday",
                            planId: "",
                        },
                        {
                            day: "Sunday",
                            planId: "",
                        },
                    ],
                });
            }

            toast.success("Registration with Google successful!");
            navigate("/home");
        } catch (error) {
            let errorMessage =
                "Error during Google registration. Please try again.";
            if (error.code === "auth/popup-closed-by-user") {
                errorMessage =
                    "The login popup was closed before completing the sign-in.";
            } else if (error.code === "auth/popup-blocked") {
                errorMessage =
                    "Popup blocked. Please enable popups for this site.";
            } else if (
                error.code === "auth/account-exists-with-different-credential"
            ) {
                errorMessage =
                    "An account already exists with the same email address.";
            }
            toast.error(errorMessage);
        }
    }

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate("/home");
            }
        });
        document.title = `Habit-U | Register`;
    });

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Register</h1>
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4 flex flex-col gap-4"
            >
                <input
                    type="text"
                    placeholder="Email"
                    name="email"
                    value={inputData.email}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                />
                <input
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={inputData.password}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    value={inputData.confirmPassword}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                    Register
                </button>
                <button
                    onClick={handleRegisterWithGoogle}
                    className="flex gap-5 items-center justify-center bg-white text-black px-5 py-2 font-bold rounded-md hover:bg-gray-200 transition border-2 border-black"
                >
                    <img
                        src="/images/google-color-svgrepo-com.svg"
                        alt="Google Icon"
                        className="w-5 h-5"
                    />
                    Register With Google
                </button>
            </form>
        </div>
    );
}

export default Register;
