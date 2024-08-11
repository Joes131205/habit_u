# Habit-U

## Description

Habit-U is a web app that leverages AI to create personalized daily plans based on the habits users want to integrate into their routines.

The app utilizes Google Gemini's AI to generate a day plan tailored to the user's submitted habits. This project stems from a fascination with Generative AI and aims to address the common challenge of crafting effective day plans that incorporate positive habits.

## Features

Users must first register using email or Google, or sign in with these credentials. After logging in, they can submit the positive habits they wish to include in their daily routine. The AI then generates a customized plan based on these habits. Users can preview the generated plan and, if satisfied, save it for future reference. Saved plans can be accessed through the Plan Inventory.

Each plan includes a name, a time range for each event, and detailed descriptions. Users can mark events as complete by clicking on them, and completed plans will be indicated as such.

## Technologies Used

-   React JS
-   Tailwind CSS
-   Firebase
-   Google Gemini AI

## Instalation

1. Clone the repository

```bash
git clone https://github.com/Joes131205/habit_u.git
 ```

2. Navigate to the project directory

```bash
cd habit_u
 ```

3. Setting up environment variables

a. Create a `.env` file: In the root directory of your project, create a file named `.env`.

b. Define your API key: Inside the `.env` file, add the following line, replacing `YOUR_ACTUAL_API_KEY` with your key:

Get Gemini API Key from https://aistudio.google.com/app/apikey

Get Firebase API Key from https://firebase.google.com/docs/web/setup#config-object
```
VITE_REACT_APP_GEMINI_API_KEY=YOUR_ACTUAL_API_KEY
VITE_REACT_APP_FIREBASE_API_KEY=YOUR_ACTUAL_API_KEY
VITE_REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_ACTUAL_API_KEY
VITE_REACT_APP_FIREBASE_PROJECT_ID=YOUR_ACTUAL_API_KEY
VITE_REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_ACTUAL_API_KEY
VITE_REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_ACTUAL_API_KEY
VITE_REACT_APP_FIREBASE_APP_ID=YOUR_ACTUAL_API_KEY
```


4. Install depedencies and start the project

```bash
npm install
npm run dev
```

5. Open the app in your web browser from the link provided

## Live Website
[Link](https://habit-u-j13.netlify.app/)
