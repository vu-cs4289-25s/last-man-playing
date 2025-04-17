import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

export default function Header() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("myUserId");
    localStorage.removeItem("myUsername");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-md">
      <Link to="/" className="text-2xl font-bold text-black">
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
              {user.profile_image_url ? (
                <img
                  src={user.profile_image_url}
                  alt="avatar"
                  className="w-10 h-10 rounded-full border"
                />
              ) : (
                <div className="w-10 h-10 rounded-full border bg-gray-300 flex items-center justify-center font-semibold text-sm">
                  {user.username[0].toUpperCase()}
                </div>
              )}
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
