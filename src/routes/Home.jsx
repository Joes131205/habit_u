import React, { useEffect, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { auth, db, storage } from "../firebase";

import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
function Home() {
    const [habit, setHabit] = useState([]);
    const [generatedHabit, setGeneratedHabit] = useState([]);
    const [generated, setGenerated] = useState(false);
    const [newHabit, setNewHabit] = useState("");
    const [difficulty, setDifficulty] = useState(1);
    const [loading, setLoading] = useState(false);
    const [habitDifficulty, setHabitDifficulty] = useState(1);
    const [isOn, setIsOn] = useState(false);
    const [additionalInfo, setAdditionalInfo] = useState("");

    const handleToggle = () => {
        setIsOn((prevState) => !prevState);
    };
    const navigate = useNavigate();
    const apiKey = import.meta.env.VITE_REACT_APP_GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    const addHabit = (e) => {
        e.preventDefault();
        setHabit([...habit, [newHabit, habitDifficulty]]);
        setHabitDifficulty(1);
        setNewHabit("");
    };
    const handleHabitChange = (e) => {
        setNewHabit(e.target.value);
    };

    const generateHabit = async () => {
        if (habit.length) {
            toast("Generating plan...", {
                icon: "⌛",
            });
            setGenerated(false);
            setLoading(true);
            setGeneratedHabit([]);
            try {
                const instruction = `
**Input:**
1. An array of habits, where each habit is specified as ["Habit name", difficulty from 1 - 3, in number]. For example: [["Learn Chinese", 2], ["Learn DSA", 1], ...].
2. A difficulty level between 1 and 3:
   - 1 indicates not comfortable (beginner level)
   - 2 indicates middle comfort (intermediate level)
   - 3 indicates very comfortable (advanced level)
3. A flag indicating whether the habits are part of a "task" or a "day-plan":
   - "task" indicates a to-do list of activities
   - "day-plan" indicates a detailed daily schedule
4. Additional information that may affect the plan. This information could include specifics such as preferred time of day for activities, constraints on activity durations, or any particular focus areas. If this value is empty or not provided, the plan should remain unchanged.

**Output:**
An array representing a highly detailed plan or task list that incorporates all the habits mentioned, adjusted according to the provided difficulty level, flag, and additional information.

**Instructions:**

1. **Determine Schedule or Task List:**
   - For "day-plan": Create a detailed schedule that covers a full day from morning to evening. Adjust the schedule based on additional information if provided.
   - For "task": Create a to-do list with specific tasks related to each habit. Adjust the task list based on additional information if provided.

2. **Adjust Habit Complexity Based on Difficulty Level:**
   - **Difficulty Level 1 (Beginner):**
     - Focus on introductory activities and foundational tasks for each habit. Include regular breaks and rest periods to avoid overwhelming the user. Provide simple, step-by-step instructions.
   - **Difficulty Level 2 (Intermediate):**
     - Incorporate more advanced tasks and intermediate exercises. Provide moderate breaks and allow flexibility. Include intermediate-level challenges and exercises.
   - **Difficulty Level 3 (Advanced):**
     - Design a plan or task list with advanced or expert-level tasks. Ensure ample time for deep work with minimal breaks. Incorporate complex challenges and expert-level exercises.

3. **Incorporate Additional Information:**
   - Adjust the schedule or task list based on the additional information if provided:
     - **Preferred Time of Day:** Adjust time slots to fit preferred activity times.
     - **Activity Durations:** Modify the duration of tasks or activities based on any constraints or preferences.
     - **Focus Areas:** Emphasize specific areas if additional focus is mentioned.

4. **Generate the Plan or Task List:**
   - **For "day-plan":** Begin with a morning routine, then schedule detailed time blocks for each habit based on difficulty and additional information. Adjust times and activities accordingly:
     - **Morning:** Allocate time for complex or high-energy tasks.
     - **Afternoon:** Include tasks that require moderate focus or are less intensive.
     - **Evening:** End with less demanding tasks or review sessions.
   - **For "task":** Create a list of tasks for each habit. Flatten the list into a single 1D array and mix tasks for engagement. Adjust tasks based on additional information if provided.

5. **Format the Output:**
   - **For "day-plan":** Present the plan as an array with each element representing a detailed time slot and corresponding activities. The format should be [
    (Array, "Plan Name")
], where the array includes detailed time slots and activities, and "Plan Name" is the name of the plan, you must customize it based on the habits given
   - **For "task":** Present the task list as a single 1D array with mixed tasks for engagement. The array should be flattened from the original list and adjusted based on additional information if provided.

   - Example format for "day-plan":
     [
       ["6:00 AM - 6:30 AM: Wake Up and Morning Routine - Brush teeth, shower, and get dressed", "6:30 AM - 7:00 AM: Breakfast - Prepare and eat a healthy breakfast", "7:00 AM - 8:30 AM: Learn to Code - Beginner Tutorial on Variables (Read Chapter 1 and Complete Exercises)", "8:30 AM - 9:00 AM: Break - Take a walk or stretch", "9:00 AM - 11:00 AM: Cook Simple Recipe - Learn to make an omelet (Follow Recipe, Prepare Ingredients, Cook, and Clean Up)", "11:00 AM - 11:30 AM: Break - Relax or read", "11:30 AM - 1:00 PM: Study Basic Chinese - Learn HSK1 Vocab (Review List, Practice Pronunciation, Complete Quiz)", "1:00 PM - 2:00 PM: Lunch - Prepare and enjoy lunch", "2:00 PM - 4:00 PM: Practice Cooking Advanced Recipe - Learn to make a three-course meal (Plan Menu, Gather Ingredients, Cook Each Course, and Serve)", "4:00 PM - 4:30 PM: Break - Take a break or engage in light activity", "4:30 PM - 6:00 PM: Review Coding Concepts - Practice Bubble Sort (Read Article, Implement Algorithm, Test with Sample Data)", "6:00 PM - 7:00 PM: Dinner - Prepare and enjoy dinner", "7:00 PM - 8:30 PM: Study Advanced Chinese - Practice HSK4 Vocab (Review List, Engage in Conversation, Complete Advanced Exercises)", "8:30 PM - 9:00 PM: Relax and Wind Down - Light reading or meditation"], 
       "Plan Name"
     ]

   - Example format for "task":
     [
[       "1. Fluent in Chinese - Review HSK3 & 4 Vocabulary (Focus on Characters and Meanings)",
       "2. Fluent in Chinese - Practice Speaking with a Language Partner (Use New Vocabulary)",
       "3. Fluent in Chinese - Complete an HSK4 Reading Comprehension Exercise",
       "4. Fluent in Chinese - Write a Short Paragraph in Chinese on a Familiar Topic",
       "5. Fluent in Chinese - Listen to a Chinese Podcast (Intermediate Level) and Summarize",
       "6. Learn DSA - Study Basic Data Structures (Arrays, Linked Lists)",
       "7. Learn DSA - Implement a Linked List in Python/Java",
       "8. Learn DSA - Learn About Time and Space Complexity (Big O Notation)",
       "9. Learn DSA - Solve Easy LeetCode Problems on Arrays",
       "10. Master Chess - Review Basic Checkmating Patterns (King & Rook, King & Queen)",
       "11. Master Chess - Study Tactical Motifs (Forks, Pins, Skewers)",
       "12. Master Chess - Play Games Against AI (Set to Intermediate Level)",
       "13. Master Chess - Analyze One of Your Games (Identify Mistakes and Areas for Improvement)"]
       , "Plan Name"
     ]

**Output Array Format:**
Return the final plan or task list as an array where each element is a sub-array with a detailed schedule for that habit or specific tasks, and the corresponding habit name. For "task," flatten the task list into a single 1D array, mixing tasks for engagement and adjusting based on additional information if provided. Don't add anything else, just an array only.
`;

                const model = genAI.getGenerativeModel({
                    model: "gemini-1.5-pro",
                    systemInstruction: instruction,
                });

                const generationConfig = {
                    temperature: 1.0,
                    topP: 0.95,
                    topK: 64,
                    maxOutputTokens: 8192,
                    responseMimeType: "text/plain",
                };

                const chatSession = model.startChat({
                    generationConfig,
                    history: [],
                });

                const result = await chatSession.sendMessage(
                    `${JSON.stringify(habit)}, ${difficulty}, ${
                        isOn ? "task" : "day-plan"
                    }, ${additionalInfo}`
                );

                const resultText = result.response.text();
                console.log(resultText);

                const cleanedResultText = resultText.replace(
                    /```json\s*([\s\S]*?)```/,
                    "$1"
                );
                console.log(cleanedResultText);

                const parsedResult = JSON.parse(cleanedResultText);
                setGeneratedHabit(parsedResult);
                toast.success("Plan Generated! (Scroll down)");
                setGenerated(true);
                setLoading(false);
            } catch (error) {
                toast.error(
                    "Failed to generate your habit plan. Please try again later."
                );
                console.log(error);
            }
        } else {
            toast.error("Please add at least one habit.");
        }
    };

    const saveHabit = async () => {
        if (generatedHabit.length) {
            try {
                const userId = auth.currentUser.uid;
                const habitsData = {
                    uid: userId,
                    plan: generatedHabit[0],
                    habitName: generatedHabit[1],
                    completed: 0,
                    lastCompleted: "",
                    public: false,
                    createdAt: serverTimestamp(),
                };
                const docRef = collection(db, "habits");
                await addDoc(docRef, habitsData);
                toast.success("Your habit plan has been saved successfully!");
                setGeneratedHabit([]);
                setGenerated(false);
                setDifficulty(1);
                setNewHabit("");
            } catch (error) {
                toast.error(
                    "Failed to save your habit plan. Please try again later."
                );
                setGenerated(false);
            }
        }
    };
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate("/");
            }
        });
        document.title = `Habit-U | Home`;
    });
    return (
        <div className="flex flex-col items-center justify-center gap-12 p-6 bg-gray-100 rounded-lg shadow-lg h-full text-center">
            <h2 className="text-2xl font-bold text-gray-800">Welcome!</h2>
            <div className="flex flex-col items-center justify-center gap-8">
                <p className="text-lg text-gray-600">
                    What positive habit would you like to incorporate into your
                    daily routine today?
                </p>
                <p className="text-md text-gray-500">Your Habits:</p>
                <ul className="list-disc pl-5 space-y-2 text-center items-center flex flex-wrap gap-10 ">
                    {habit.length ? (
                        habit.map((h, i) => (
                            <li
                                key={i}
                                className={`flex items-center gap-4 p-3 rounded-lg shadow-sm ${
                                    h[1] === 1
                                        ? "bg-red-200"
                                        : h[1] === 2
                                        ? "bg-yellow-200"
                                        : "bg-green-200"
                                }`}
                            >
                                <span className="text-gray-700">{h[0]}</span>
                                <button
                                    onClick={() =>
                                        setHabit(
                                            habit.filter(
                                                (_, index) => index !== i
                                            )
                                        )
                                    }
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                >
                                    Remove
                                </button>
                            </li>
                        ))
                    ) : (
                        <p className="text-md text-gray-500">
                            No habits added yet.
                        </p>
                    )}
                </ul>
                <form
                    onSubmit={addHabit}
                    className="flex flex-col items-center gap-4 bg-white p-4 rounded-lg shadow-sm w-full max-w-md"
                >
                    <input
                        type="text"
                        name="habit"
                        placeholder="Enter your desired habit here"
                        value={newHabit}
                        onChange={handleHabitChange}
                        required
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    >
                        Add Habit
                    </button>
                </form>
                <div className="flex flex-col items-center gap-4 bg-white p-4 rounded-lg shadow-sm w-full max-w-md">
                    <label className="text-md text-gray-600">
                        How experienced are you with this habit?
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="3"
                        name="difficulty"
                        value={habitDifficulty}
                        onChange={(e) =>
                            setHabitDifficulty(parseInt(e.target.value))
                        }
                        className="w-full"
                    />
                </div>
                <hr className="fading-hr" />

                <div className="flex flex-col items-center gap-4 bg-white p-4 rounded-lg shadow-sm w-full max-w-md">
                    <label className="text-md text-gray-600">
                        How committed are you to following the plan?
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="3"
                        name="difficulty"
                        value={difficulty}
                        onChange={(e) =>
                            setDifficulty(parseInt(e.target.value))
                        }
                        className="w-full"
                    />
                </div>
                <div className="flex items-center">
                    <p className="mr-3">Day Plan</p>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isOn}
                            onChange={handleToggle}
                            className="sr-only"
                        />
                        <div className="w-14 h-7 rounded-full flex items-center transition-colors duration-300 ease-in-out bg-blue-600">
                            <div
                                className={`w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center transform transition-transform duration-300 ease-in-out ${
                                    isOn ? "translate-x-7" : "translate-x-1"
                                }`}
                            >
                                <svg
                                    className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                                        isOn ? "rotate-90" : "-rotate-90"
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
                    <p className="ml-3">Task</p>
                </div>
                <hr className="fading-hr" />

                <div className="flex flex-col items-center gap-4 bg-white p-4 rounded-lg shadow-sm w-full max-w-md">
                    <label className="text-md text-gray-600">
                        Have any additional / extra info?
                    </label>
                    <textarea
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        className="w-full border-2 border-black rounded-md"
                        placeholder="Additional Info..."
                    />
                </div>
                <p className="text-sm text-gray-500 mt-4">
                    Set achievable goals and stay positive! 😊
                </p>
                <button
                    onClick={generateHabit}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                    Generate Plan
                </button>
            </div>

            {generated && (
                <div className="bg-white p-4 rounded-lg shadow-sm w-full max-w-lg mt-6 flex flex-col items-center text-center">
                    <p className="text-lg text-gray-800 mb-2">Your Plan</p>
                    {loading ? (
                        <p className="text-gray-500">Generating your plan...</p>
                    ) : (
                        generatedHabit.length > 0 && (
                            <>
                                <p className="text-gray-700 mb-2 font-bold">
                                    {generatedHabit[1]}
                                </p>
                                <ul className="pl-5 space-y-2 list-none text-left">
                                    {generatedHabit[0].map((h, i) => (
                                        <li key={i} className="text-gray-700">
                                            {h}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )
                    )}
                    <button
                        onClick={saveHabit}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition mt-4"
                    >
                        Save Plan
                    </button>
                </div>
            )}
        </div>
    );
}

export default Home;
