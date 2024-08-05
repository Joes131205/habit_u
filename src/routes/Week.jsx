import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Week() {
    const [weekHabit, setWeekHabit] = useState([]);
    const [habitDetails, setHabitDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            onAuthStateChanged(auth, async (user) => {
                if (!user) {
                    navigate("/");
                } else {
                    const docRef = doc(db, "users", auth.currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    const data = docSnap.data();
                    setWeekHabit(data.weekly);
                }
            });
        };

        fetchUserData();
        document.title = `Habit-U | Weekly`;
    }, [navigate]);

    useEffect(() => {
        const fetchHabitDetails = async () => {
            const details = {};
            const fetchPromises = weekHabit
                .filter((item) => item.planId)
                .map(async (item) => {
                    const id = item.planId;
                    if (!id) return;
                    try {
                        const docRef = doc(db, "habits", id);
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            details[id] = docSnap.data();
                        }
                    } catch (error) {
                        console.error("Error fetching habit details: ", error);
                    }
                });

            await Promise.all(fetchPromises);
            setHabitDetails(details);
            setLoading(false);
        };

        if (weekHabit.length > 0) {
            fetchHabitDetails();
        } else {
            setLoading(false);
        }
    }, [weekHabit]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg font-semibold">Loading...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold mb-4">Week Plan</h2>
            <h3 className="text-xl mb-6">Manage your weekly plan here</h3>
            <div className="space-y-4">
                {weekHabit.map((item, i) => {
                    const planId = item.planId;
                    const habitData = habitDetails[planId] || {};
                    return (
                        <div
                            key={i}
                            className="bg-white p-4 shadow-md rounded-lg border border-gray-200"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-lg font-semibold">
                                    {item.day}
                                </h4>
                            </div>
                            {planId ? (
                                <div className="flex items-center justify-between">
                                    <h4 className="text-md font-medium">
                                        {habitData.habitName || "Loading..."}
                                    </h4>
                                    <button
                                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                                        onClick={() =>
                                            navigate(`/plan/${planId}`)
                                        }
                                    >
                                        See Full
                                    </button>
                                </div>
                            ) : (
                                <p className="text-gray-500">None yet!</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Week;
