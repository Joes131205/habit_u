import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import toast from "react-hot-toast";
function Plan() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [habit, setHabit] = useState([]);
    const [data, setData] = useState({});
    const [planName, setPlanName] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [uid, setUid] = useState("");
    const handleToggle = async () => {
        if (!data || !data.uid || data.uid !== auth.currentUser.uid) {
            return;
        }

        const docRef = doc(db, "habits", id);
        await updateDoc(docRef, {
            ...data,
            public: !data.public,
        });
        setData((prev) => ({
            ...prev,
            public: !prev.public,
        }));
        toast.success(
            `Set visibility to ${!data.public ? "public" : "private"}!`
        );
        setIsPublic((prevState) => !prevState);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate("/");
            } else {
                setUid(user.uid);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        const getHabit = async () => {
            const docRef = doc(db, "habits", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (
                    auth.currentUser &&
                    data.uid !== auth.currentUser.uid &&
                    !data.public
                ) {
                    navigate("/error/403");
                }

                const temp = data.plan.map((habit) => ({
                    habit,
                    done: false,
                }));
                setHabit(temp);
                setPlanName(data.habitName);
                setData(data);
                setIsPublic(data.public);
                document.title = `Habit-U | ${data.habitName}`;
            } else {
                navigate("/error/404");
            }
        };

        getHabit();
    }, [id, navigate]);

    return (
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {planName}
            </h1>
            {data.uid === auth.currentUser.uid ? (
                <div className="flex items-center">
                    <p className="mr-3">Private</p>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={handleToggle}
                            className="sr-only"
                        />
                        <div className="w-14 h-7 rounded-full flex items-center transition-colors duration-300 ease-in-out bg-blue-600">
                            <div
                                className={`w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center transform transition-transform duration-300 ease-in-out ${
                                    isPublic ? "translate-x-7" : "translate-x-1"
                                }`}
                            >
                                <svg
                                    className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                                        isPublic ? "rotate-90" : "-rotate-90"
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M8 16l4-4 4 4" />
                                </svg>
                            </div>
                        </div>
                    </label>
                    <p className="ml-3">Public</p>
                </div>
            ) : (
                ""
            )}
            <ul className="space-y-4 text-center">
                {habit.map((h, i) => (
                    <li
                        key={i}
                        className={` p-4 rounded-lg shadow-md ${
                            h.done ? "hover:bg-green-200" : "hover:bg-gray-50"
                        } transition text-left ${
                            h.done ? "line-through bg-green-300" : "bg-white"
                        } flex items-center gap-5 cursor-pointer`}
                        onClick={() => {
                            if (data.uid === auth.currentUser.uid) {
                                const temp = [...habit];
                                temp[i].done = !temp[i].done;
                                setHabit(temp);

                                if (habit.every((habit) => habit.done)) {
                                    const addCompletion = async () => {
                                        const docRef = doc(db, "habits", id);
                                        const docSnap = await getDoc(docRef);
                                        const data = docSnap.data();
                                        const lastCompleted =
                                            data.lastCompleted || "";
                                        const today = new Date();
                                        const date = today
                                            .toISOString()
                                            .split("T")[0];
                                        if (lastCompleted === date) {
                                            return;
                                        } else {
                                            await updateDoc(docRef, {
                                                lastCompleted: date,
                                                completed: data.completed + 1,
                                            });

                                            const userDocRef = doc(db, "users", auth.currentUser.uid); // Get user document
                                            const userDocSnap = await getDoc(userDocRef);
                                            const userData = userDocSnap.data();

                                            const today = new Date();
                                            const date = today.toISOString().split("T")[0];

                                            await updateDoc(userDocRef, { 
                                              completionDates: [...userData.completionDates, date], 
                                            }); 
                                                                                      
                                            toast.success(
                                                "Plan done! Congratulations!"
                                            );
                                        }
                                    };
                                    addCompletion();
                                }
                            }
                        }}
                    >
                        <p>{h.habit}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Plan;
