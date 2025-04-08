import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

export default function Header() {
  const { user, setUser } = useUser(); // Get user from context and setUser to update context
  const navigate = useNavigate(); // To navigate programmatically

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("authToken");

    // Set user to null in context to update the UI
    setUser(null);

    // Redirect to homepage after logout
    navigate("/");
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-md">
      <Link to="/" className="text-2xl font-bold text-blue-600">
        Last Man Playing
      </Link>

      <nav className="flex items-center space-x-4">
        <Link to="/how-to-play" className="text-gray-700 hover:text-blue-600">
          How to Play
        </Link>

        {user && (
          <Link to="/lobbies" className="text-gray-700 hover:text-blue-600">
            Lobbies
          </Link>
        )}

        {user ? (
          <>
            <Link to="/profile" className="flex items-center space-x-2">
              <span className="text-gray-700">{user.username}</span>
              <img
                src={user.profile_image_url || "https://via.placeholder.com/40"}
                alt="avatar"
                className="w-10 h-10 rounded-full border"
              />
            </Link>
            <button
              onClick={handleLogout}
              className="text-white bg-red-600 hover:bg-red-700 hover:text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-700 hover:text-blue-600">
              Login
            </Link>
            <Link to="/register" className="text-gray-700 hover:text-blue-600">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
