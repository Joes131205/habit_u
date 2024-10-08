import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";

import Plan from "./routes/Plan.jsx";
import Home from "./routes/Home.jsx";
import History from "./routes/History.jsx";
import Landing from "./routes/Landing.jsx";
import Login from "./routes/Login.jsx";
import Register from "./routes/Register.jsx";
import Week from "./routes/Week.jsx";

import ErrorPage from "./routes/ErrorPage.jsx";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase.js";
import toast, { Toaster } from "react-hot-toast";

function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [streak, setStreak] = useState(0);
    const [todayStreak, setTodayStreak] = useState(false);
    const navigate = useNavigate();

    function calculateStreak(completionDates) {
        let streak = 1;
        const today = new Date();
        const date = today.toISOString().split("T")[0];
        console.log(completionDates, date);
        if (completionDates.length === 0) {
            return 0;
        }
        if (completionDates.length === 1) {
            if (completionDates.includes(date)) {
                setTodayStreak(true);
            }
            return 1;
        }
        completionDates.sort((a, b) => new Date(a) - new Date(b));
        if (completionDates.includes(date)) {
            setTodayStreak(true);
        }
        for (let i = 1; i < completionDates.length; i++) {
            const prevDate = new Date(completionDates[i - 1]);
            const currentDate = new Date(completionDates[i]);
            const diffInDays = Math.round(
                (currentDate - prevDate) / (1000 * 60 * 60 * 24)
            );
            if (diffInDays === 1) {
                streak++;
            } else {
                streak = 0;
            }
        }
        return streak;
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setLoggedIn(true);
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                const userData = userDocSnap.data();
                console.log(userData);
                const streak = calculateStreak(userData.completionDates);
                setStreak(streak);
            } else {
                setLoggedIn(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const routes = (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home />} />
            <Route path="/plan/:id" element={<Plan />} />
            <Route path="/history" element={<History />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/weekly" element={<Week />} />
            <Route path="error/:id" element={<ErrorPage />} />
            <Route path="*" element={<Navigate to="/error/404" replace />} />
        </Routes>
    );
    const logOutUser = () => {
        auth.signOut();
        toast.success("Logged out!");
        navigate("/");
        setLoggedIn(false);
    };
    return (
        <div className="text-xs md:text-lg">
            <Toaster />
            <nav className="bg-gray-600 p-4">
                <ul className="flex text-xs md:text-xl flex-row gap-8 items-center">
                    <li className="text-white  font-semibold md:text-xl">
                        <a href="/">Habit-U</a>
                    </li>
                    {loggedIn ? (
                        <>
                            <li>
                                <a
                                    href="/home"
                                    className="text-white hover:text-gray-400 transition"
                                >
                                    Home
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/history"
                                    className="text-white hover:text-gray-400 transition"
                                >
                                    Your Plan
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/weekly"
                                    className="text-white hover:text-gray-400 transition"
                                >
                                    Weekly Plan
                                </a>
                            </li>
                            <li className="text-white transition flex gap-2 items-center">
                                {todayStreak ? (
                                    <img
                                        src="images/flame.svg"
                                        className="w-5 h-5"
                                    />
                                ) : (
                                    <img
                                        src="images/flame-outline.svg"
                                        className="w-5 h-5"
                                    />
                                )}
                                {streak}
                                {todayStreak ? (
                                    <img
                                        src="images/flame.svg"
                                        className="w-5 h-5"
                                    />
                                ) : (
                                    <img
                                        src="images/flame-outline.svg"
                                        className="w-5 h-5"
                                    />
                                )}
                            </li>
                            <li>
                                <a
                                    onClick={logOutUser}
                                    className="text-white hover:text-gray-400 cursor-pointer transition"
                                >
                                    Sign Out
                                </a>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <a
                                    href="/login"
                                    className="text-white hover:text-gray-400 transition"
                                >
                                    Login
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/register"
                                    className="text-white hover:text-gray-400 transition"
                                >
                                    Register
                                </a>
                            </li>
                        </>
                    )}
                </ul>
            </nav>

            {routes}
        </div>
    );
}

export default App;
