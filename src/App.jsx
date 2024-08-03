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
import { auth } from "./firebase.js";
import toast, { Toaster } from "react-hot-toast";

function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setLoggedIn(true);
            }
        });
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
            <nav className="bg-gray-800 p-4">
                <ul className="flex flex-row gap-8 items-center">
                    <li className="text-white text-xl font-semibold">
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
                                    Inventory
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/weekly"
                                    className="text-white hover:text-gray-400 transition"
                                >
                                    Week Plan
                                </a>
                            </li>
                            <li>
                                <a
                                    onClick={logOutUser}
                                    className="text-white hover:text-gray-400 cursor-pointer transition"
                                >
                                    Log Out
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
