import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
    query,
    where,
    collection,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";

function History() {
    const [habits, setHabits] = useState([]);
    const [uid, setUid] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState(false);
    const [weekModal, setWeekModal] = useState(false);
    const [selectedHabitId, setSelectedHabitId] = useState(null);
    const [day, setDay] = useState("Monday");

    const navigate = useNavigate();

    useEffect(() => {
        const getHabit = async () => {
            try {
                const q = query(
                    collection(db, "habits"),
                    where("uid", "==", uid)
                );

                const querySnapshot = await getDocs(q);
                const habitsArray = [];
                querySnapshot.forEach((doc) => {
                    habitsArray.push({
                        id: doc.id,
                        data: doc.data(),
                    });
                });
                console.log(habitsArray);
                setHabits(habitsArray);
                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        };
        if (uid) {
            setLoading(true);
            getHabit();
        }
    }, [uid]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUid(user.uid);
                document.title = `Habit-U | History`;
            } else {
                navigate("/");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const deleteHabit = async () => {
        if (selectedHabitId) {
            try {
                await deleteDoc(doc(db, "habits", selectedHabitId));
                setHabits(habits.filter((item) => item.id !== selectedHabitId));
                setDeleteModal(false);
                setSelectedHabitId(null);

                const docRef = doc(db, "users", auth.currentUser.uid);
                const docSnap = await getDoc(docRef);
                const data = docSnap.data();

                data.weekly = data.weekly.map((item) => {
                    if (item.planId === selectedHabitId) {
                        return { ...item, planId: "" };
                    }
                    return item;
                });
                await updateDoc(docRef, data);
                toast.success("Plan deleted!");
            } catch (error) {
                console.log(error);
            }
        }
    };
    const setPlanOnDay = async (e) => {
        e.preventDefault();
        if (selectedHabitId) {
            try {
                const habit = habits.find(
                    (item) => item.id === selectedHabitId
                );
                console.log(habit);
                const docRef = doc(db, "users", auth.currentUser.uid);
                const docSnap = await getDoc(docRef);
                const data = docSnap.data();
                const index = data.weekly.findIndex((item) => item.day === day);
                data.weekly[index].planId = habit.id;
                await updateDoc(docRef, data);
                toast.success(
                    `Plan for ${habit.data.habitName} saved to ${day}!`
                );
            } catch (error) {
                toast.error("Plan failed to save!");
            }
        }
    };
    const openWeekModal = (id) => {
        setSelectedHabitId(id);
        setWeekModal(true);
    };

    const closeWeekModal = () => {
        setWeekModal(false);
        setSelectedHabitId(null);
    };
    const openDeleteModal = (id) => {
        setSelectedHabitId(id);
        setDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setDeleteModal(false);
        setSelectedHabitId(null);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                Plan Inventory
            </h1>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Your Saved Plans
            </h2>
            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : habits.length ? (
                <ul className="space-y-4">
                    {habits.map((habit) => (
                        <li
                            key={habit.id}
                            className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-50 cursor-pointer transition gap-10 items-center flex flex-col md:flex-row"
                            onClick={() => navigate(`/plan/${habit.id}`)}
                        >
                            <p className="text-gray-700 font-bold">
                                {habit.data.habitName}
                            </p>
                            <p>Completed: {habit.data.completed}</p>
                            <p>
                                Last Completed:{" "}
                                {habit.data.lastCompleted || "None"}
                            </p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openWeekModal(habit.id);
                                }}
                                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                            >
                                Save to weekly plan
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteModal(habit.id);
                                }}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">
                    You don't have any saved plans yet. Generate one to get
                    started!
                </p>
            )}
            {/* Modal */}
            {deleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="relative w-2/5 max-w-lg p-6 bg-white rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">
                            Confirm Deletion
                        </h3>
                        <p className="mb-6">
                            Are you sure you want to delete this plan? This
                            action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteHabit}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {weekModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="relative w-4/5 max-w-md p-6 bg-white rounded-lg shadow-lg">
                        <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                            Save to Weekly Plan
                        </h3>
                        <p className="mb-6 text-gray-600">
                            What day of the week would you like to save this
                            plan into?
                        </p>

                        <form
                            onSubmit={setPlanOnDay}
                            className="flex flex-col space-y-4"
                        >
                            <select
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                                <option value="Saturday">Saturday</option>
                                <option value="Sunday">Sunday</option>
                            </select>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={closeWeekModal}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default History;
