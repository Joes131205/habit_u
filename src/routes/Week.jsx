import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function Week() {
    const [weekHabit, setWeekHabit] = useState([]);
    const [habitDetails, setHabitDetails] = useState({});

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
    }, []);

    useEffect(() => {
        const fetchHabitDetails = async () => {
            const details = {};
            for (const item of weekHabit) {
                const id = item.planId;
                if (id) {
                    const docRef = doc(db, "habits", id);
                    const docSnap = await getDoc(docRef);
                    details[id] = docSnap.data();
                }
            }
            setHabitDetails(details);
        };

        if (weekHabit.length > 0) {
            fetchHabitDetails();
        }
    }, [weekHabit]);

    return (
        <div>
            <h2>Week Plan</h2>
            <h3>Manage your weekly plan here</h3>
            <div>
                {weekHabit.map((item) => {
                    const id = item.planId;
                    const habitData = habitDetails[id];

                    if (!id || !habitData) {
                        return null;
                    }

                    return (
                        <div key={id}>
                            <div>
                                <h4>{item.day}</h4>
                            </div>
                            <h4>{habitData.habitName}</h4>
                            <button>See Full</button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Week;
