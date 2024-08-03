import React, { useEffect, useState } from "react";

function Week() {
    const [weekHabit, setWeekHabit] = useState([]);
    useEffect(() => {}, []);
    return (
        <div>
            <h2>Week Plan</h2>
            <h3>Manage your weekly plan here</h3>
            <div>
                <div>
                    <h4>Monday</h4>
                    <div></div>
                </div>
                <div>
                    <h4>Tuesday</h4>
                    <div></div>
                </div>
                <div>
                    <h4>Wednesday</h4>
                    <div></div>
                </div>
                <div>
                    <h4>Friday</h4>
                    <div></div>
                </div>
                <div>
                    <h4>Saturday</h4>
                    <div></div>
                </div>
                <div>
                    <h4>Sunday</h4>
                    <div></div>
                </div>
            </div>
        </div>
    );
}

export default Week;
