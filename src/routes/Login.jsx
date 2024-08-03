import React from "react";
import { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase";
import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
function Login() {
    const navigate = useNavigate();
    auth.useDeviceLanguage();
    const provider = new GoogleAuthProvider();

    const [inputData, setInputData] = useState({
        email: "",
        password: "",
    });
    const handleChange = (event) => {
        setInputData({ ...inputData, [event.target.name]: event.target.value });
    };
    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            await signInWithEmailAndPassword(
                auth,
                inputData.email,
                inputData.password
            );
            toast.success("Logged in successfully!");
            navigate("/home");
        } catch (error) {
            let errorMessage = "Error logging in! Please try again.";
            if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email address format.";
            } else if (error.code === "auth/user-disabled") {
                errorMessage = "This account has been disabled.";
            } else if (error.code === "auth/user-not-found") {
                errorMessage = "No user found with this email address.";
            } else if (error.code === "auth/wrong-password") {
                errorMessage = "Incorrect password. Please try again.";
            }
            toast.error(errorMessage);
        }
    };

    async function handleSignInWithGoogle() {
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
                            plan: [],
                        },
                        {
                            day: "Tuesday",
                            plan: [],
                        },
                        {
                            day: "Wednesday",
                            plan: [],
                        },
                        {
                            day: "Thursday",
                            plan: [],
                        },
                        {
                            day: "Friday",
                            plan: [],
                        },
                        {
                            day: "Saturday",
                            plan: [],
                        },
                        {
                            day: "Sunday",
                            plan: [],
                        },
                    ],
                });
            }

            toast.success("Successfully logged in with Google!");
            navigate("/home");
        } catch (error) {
            let errorMessage =
                "Error logging in with Google! Please try again.";
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
        document.title = `Habit-U | Log In`;
    });
    return (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Login</h1>
            <form
                onSubmit={handleLogin}
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
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                    Login
                </button>
                <button
                    onClick={handleSignInWithGoogle}
                    className="flex gap-5 items-center justify-center bg-white text-black px-5 py-2 font-bold rounded-md hover:bg-gray-200 transition border-2 border-black"
                >
                    <img
                        src="/images/google-color-svgrepo-com.svg"
                        alt="Google Icon"
                        className="w-5 h-5"
                    />
                    Sign In With Google
                </button>
            </form>
        </div>
    );
}

export default Login;
