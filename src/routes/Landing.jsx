import React from "react";
import { useNavigate } from "react-router-dom";

function Landing() {
    const navigate = useNavigate();
    return (
        <div className="text-gray-800">
            <header className="bg-green-200 text-center py-16 px-6 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
                <div className="flex flex-col gap-6 items-center md:items-center">
                    <h2 className="text-3xl md:text-4xl mb-4 font-extrabold leading-tight">
                        Creating Your Habit Plan Has Never Been Easier!
                    </h2>
                    <p className="text-lg text-gray-800 max-w-lg mx-auto md:mx-0">
                        Easily set and achieve your goals with our personalized
                        habit planning tool.
                    </p>
                    <button
                        className="bg-green-700 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-green-800 transition duration-300"
                        onClick={() => navigate("/register")}
                    >
                        Get Started
                    </button>
                </div>
                <div className="flex-shrink-0">
                    <img
                        src="images/undraw_healthy_habit_kwe6.svg"
                        alt="Healthy Habit Illustration"
                        className="w-64 h-64 md:w-96 md:h-96"
                    />
                </div>
            </header>

            <section className="bg-gray-100 py-12">
                <h2 className="text-3xl font-semibold text-center mb-8">
                    Features
                </h2>
                <div className="flex gap-32 px-10 text-center items-center justify-center flex-col md:flex-row">
                    <div className="flex flex-col gap-4 items-center justify-center bg-gray-300 px-6 py-10 rounded-md">
                        <img
                            src="images/microchip-ai.svg"
                            alt="AI Icon"
                            className="w-10 h-10"
                        />
                        <h3 className="font-bold text-xl">
                            AI-Personalized Goals
                        </h3>
                        <p>
                            Receive customized goal plans based on your
                            preferences.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 items-center justify-center bg-gray-300 px-6 py-10 rounded-md">
                        <img
                            src="images/list.svg"
                            alt="List Icon"
                            className="w-10 h-10"
                        />
                        <h3 className="font-bold text-xl">Detailed Plans</h3>
                        <p>
                            Get comprehensive daily plans tailored to your
                            chosen habits.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 items-center justify-center bg-gray-300 px-6 py-10 rounded-md">
                        <img
                            src="images/database.svg"
                            alt="Database Icon"
                            className="w-10 h-10"
                        />
                        <h3 className="font-bold text-xl">Save Your Plans</h3>
                        <p>
                            Store and manage your habit plans for easy access
                            and review.
                        </p>
                    </div>
                </div>
            </section>

            <footer className="bg-gray-800 text-white py-4 text-center">
                <p>&copy; 2024 Habit-U. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default Landing;
