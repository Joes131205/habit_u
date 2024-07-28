import React, { useEffect, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { auth, db, storage } from "../firebase";

import { addDoc, collection, doc } from "firebase/firestore";
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

    const navigate = useNavigate();
    const apiKey = import.meta.env.VITE_REACT_APP_GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    const addHabit = (e) => {
        e.preventDefault();
        setHabit([...habit, newHabit]);
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
1. An array of habits that the user wants to form. For example: ["I want to learn how to code", "I want to master cooking", "just wanted to learn a language, especially Chinese"]
2. A difficulty level between 1 and 3:
   - 1 indicates not comfortable (beginner level)
   - 2 indicates middle comfort (intermediate level)
   - 3 indicates very comfortable (advanced level)

**Output:**
An array representing a highly detailed daily plan that incorporates all the habits mentioned, adjusted according to the provided difficulty level.

**Instructions:**

1. **Determine Schedule:**
   - Create a detailed schedule that covers a full day from morning to evening. Include specific time slots for each habit, ensuring there is enough time to meaningfully engage with each activity.
   - For a balanced schedule, allocate appropriate time blocks based on the difficulty level. Ensure the plan is realistic and achievable within a day, and break down activities into detailed sub-tasks.

2. **Adjust Habit Complexity Based on Difficulty Level:**
   - **Difficulty Level 1 (Beginner):**
     - Focus on introductory activities and foundational tasks for each habit. For example, if the habit is "learn how to code," include basic tutorials, exercises, and introductory content.
     - Include regular breaks and rest periods to avoid overwhelming the user. Provide simple, step-by-step instructions.

   - **Difficulty Level 2 (Intermediate):**
     - Incorporate more advanced tasks and intermediate exercises. For example, if the habit is "master cooking," include detailed recipes with techniques, such as learning to cook a specific dish.
     - Provide moderate breaks and allow flexibility in the schedule for varying task durations. Include intermediate-level challenges and exercises.

   - **Difficulty Level 3 (Advanced):**
     - Design a plan with advanced or expert-level tasks. For example, if the habit is "learn a language," include advanced lessons, immersive activities, and in-depth practice sessions.
     - Ensure ample time for deep work with minimal breaks. Incorporate complex challenges and expert-level exercises.

3. **Generate the Plan:**
   - Begin with a morning routine, such as waking up, breakfast, and initial preparation.
   - Schedule detailed time blocks for each habit based on the difficulty level:
     - **Morning:** Allocate time for complex or high-energy tasks, such as intensive study or advanced practice.
     - **Afternoon:** Include tasks that require moderate focus or are less intensive, with detailed steps for each activity.
     - **Evening:** End with less demanding tasks or review sessions, including specific goals and outcomes.
   - Ensure to include specific times and durations for each activity, with detailed sub-tasks. For example, if the habit is "Learn DSA," list specific algorithms like "Bubble Sort," and if the habit is "Learn Chinese," include specific vocabulary or grammar points like "HSK4 Vocab."

4. **Format the Output:**
   - Present the plan in the format [ [Array], "Habit Name"]. 
   The array should include detailed time slots and corresponding activities, with repetitive yet varied tasks to avoid boredom.
   - Example format: 
     [
       ["6:00 AM - 6:30 AM: Wake Up and Morning Routine - Brush teeth, shower, and get dressed", "6:30 AM - 7:00 AM: Breakfast - Prepare and eat a healthy breakfast", "7:00 AM - 8:30 AM: Learn to Code - Beginner Tutorial on Variables (Read Chapter 1 and Complete Exercises)", "8:30 AM - 9:00 AM: Break - Take a walk or stretch", "9:00 AM - 11:00 AM: Cook Simple Recipe - Learn to make an omelet (Follow Recipe, Prepare Ingredients, Cook, and Clean Up)", "11:00 AM - 11:30 AM: Break - Relax or read", "11:30 AM - 1:00 PM: Study Basic Chinese - Learn HSK1 Vocab (Review List, Practice Pronunciation, Complete Quiz)", "1:00 PM - 2:00 PM: Lunch - Prepare and enjoy lunch", "2:00 PM - 4:00 PM: Practice Cooking Advanced Recipe - Learn to make a three-course meal (Plan Menu, Gather Ingredients, Cook Each Course, and Serve)", "4:00 PM - 4:30 PM: Break - Take a break or engage in light activity", "4:30 PM - 6:00 PM: Review Coding Concepts - Practice Bubble Sort (Read Article, Implement Algorithm, Test with Sample Data)", "6:00 PM - 7:00 PM: Dinner - Prepare and enjoy dinner", "7:00 PM - 8:30 PM: Study Advanced Chinese - Practice HSK4 Vocab (Review List, Engage in Conversation, Complete Advanced Exercises)", "8:30 PM - 9:00 PM: Relax and Wind Down - Light reading or meditation"], 
       "Habit Name"
     ]

**Output Array Format:**
Return the final plan as an array where each element is a sub-array with a detailed schedule for that habit, and the corresponding habit name. Ensure that the activities include repetitive elements with variations to maintain engagement. Don't add anything else, just an array only.
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
                    `${habit}, ${difficulty}`
                );

                // Process result
                const resultText = result.response.text();
                console.log(resultText);

                // Remove markdown code block notation if present
                const cleanedResultText = resultText.replace(
                    /```json\s*([\s\S]*?)```/,
                    "$1"
                );
                console.log(cleanedResultText);

                // Parse cleaned JSON text
                const parsedResult = JSON.parse(cleanedResultText);
                setGeneratedHabit(parsedResult);
                toast.success("Plan Generated!");
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
                    What positive habit would you like to add to your daily
                    routine today?
                </p>
                <p className="text-md text-gray-500">Your Current Habits:</p>
                <ul className="list-disc pl-5 space-y-2 text-center">
                    {habit.length ? (
                        habit.map((h, i) => (
                            <li
                                key={i}
                                className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm"
                            >
                                <span className="text-gray-700">{h}</span>
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
                            No habits added yet
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
                        How committed or experienced are you with this habit?
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
                <p className="text-sm text-gray-500 mt-4">
                    Remember to set achievable goals! 😊
                </p>
                <button
                    onClick={generateHabit}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                    Generate Daily Plan
                </button>
            </div>
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
                {generated ? (
                    <button
                        onClick={saveHabit}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition mt-4"
                    >
                        Save Plan
                    </button>
                ) : null}
            </div>
        </div>
    );
}

export default Home;
