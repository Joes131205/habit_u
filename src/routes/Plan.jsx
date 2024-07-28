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
    const [planName, setPlanName] = useState("");

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate("/");
            }
        });
    });

    useEffect(() => {
        const getHabit = async () => {
            const docRef = doc(db, "habits", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.uid !== auth.currentUser.uid) {
                    navigate("/error/403");
                }
                const temp = [];
                data.plan.forEach((habit) => {
                    temp.push({
                        habit,
                        done: false,
                    });
                });
                setHabit(temp);
                setPlanName(data.habitName);
                document.title = `Habit-U | ${data.habitName}`;
            } else {
                navigate("/error/404");
            }
        };
        getHabit();
    }, []);

    return (
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {planName}
            </h1>
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
                                        toast.success(
                                            "Plan done! Congratulations!"
                                        );
                                    }
                                };
                                addCompletion();
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
