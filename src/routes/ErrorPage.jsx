import React from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

function ErrorPage() {
    const { id } = useParams();

    const getErrorMessage = (code) => {
        switch (code) {
            case "404":
                return "Page not found. It looks like the page you're looking for doesn't exist.";
            case "500":
                return "Internal server error. Something went wrong on our end.";
            case "403":
                return "Forbidden. You don't have permission to access this page.";
            default:
                return "An unexpected error occurred.";
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-red-100 text-red-800">
            <h1 className="text-4xl font-bold mb-4">
                Oops, Something Went Wrong!
            </h1>
            <p className="text-xl mb-4">{getErrorMessage(id)}</p>
            <p className="text-lg font-semibold mb-6">
                Error Code: {id ? id : "404"}
            </p>
            <Link
                to="/"
                className="text-green-700 bg-green-200 border py-2 px-4 rounded hover:bg-green-300 transition duration-300"
            >
                Go back to the homepage
            </Link>
        </div>
    );
}

export default ErrorPage;
