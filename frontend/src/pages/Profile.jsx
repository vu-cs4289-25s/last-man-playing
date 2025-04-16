import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom"; // Assumes you're using react-router for navigation
import Header from "../components/ui/Header";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      // If no token exists, redirect to login page
      navigate("/login");
      return;
    }
    fetch("/api/user/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          navigate("/login");
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setUsername(data.user.username);
          setProfileImageUrl(data.user.profile_image_url || "");
        }
      })
      .catch((err) => console.error("Error fetching user profile", err));
  }, [navigate]);

  const handleSave = () => {
    const token = localStorage.getItem("authToken");
    fetch("/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        username: username,
        profile_image_url: profileImageUrl,
      }),
    })
      .then((res) => {
        if (res.status === 401) {
          navigate("/login");
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setEditing(false);
        }
      })
      .catch((err) => console.error("Error updating profile", err));
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex flex-col flex-1 items-center justify-center p-4">
        <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gray-100">
          {/* Profile Section */}
          <main className="flex flex-col items-center mt-8 w-full max-w-3xl">
            <div className="flex items-center w-full px-10">
              <img
                src={
                  user.profile_image_url || "https://via.placeholder.com/150"
                }
                alt="Avatar"
                className="w-36 h-36 rounded-full border-4 border-white shadow-lg"
              />
              <div className="ml-8">
                {editing ? (
                  <>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="p-2 border border-gray-300 rounded mb-2"
                      placeholder="Username"
                    />
                    <input
                      type="text"
                      value={profileImageUrl}
                      onChange={(e) => setProfileImageUrl(e.target.value)}
                      className="p-2 border border-gray-300 rounded mb-2"
                      placeholder="Profile Image URL"
                    />
                    <Button
                      onClick={handleSave}
                      className="mt-4 bg-green-500 text-white"
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold">{user.username}</h2>
                    <p className="text-gray-600 mt-2">STATUS</p>
                    <div className="w-64 bg-gray-200 rounded-full h-3 mt-2">
                      <div className="bg-black h-3 rounded-full w-3/4"></div>
                    </div>
                    <Button
                      onClick={() => setEditing(true)}
                      className="mt-4 bg-[#0D1117] text-white hover:bg-[#161B22]"
                    >
                      Edit Profile
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="w-full border-t my-6"></div>

            {/* Statistics Section */}
            <h3 className="text-lg font-semibold self-start px-10 mb-4">
              STATISTICS
            </h3>
            <div className="grid grid-cols-3 gap-6 w-full px-10">
              <Card className="p-6 bg-gray-300 flex flex-col items-center">
                <p className="text-sm text-gray-600">COMPLETED GAMES</p>
                <h4 className="text-xl font-bold">
                  {user.completed_games_count || 0}
                </h4>
              </Card>
              <Card className="p-6 bg-gray-300 flex flex-col items-center">
                <p className="text-sm text-gray-600">ALL TIME HIGH</p>
                <h4 className="text-xl font-bold">
                  {user.average_rating || 0}
                </h4>
              </Card>
              <Card className="p-6 bg-gray-300 flex flex-col items-center">
                <p className="text-sm text-gray-600">UNNAMED STAT</p>
                <h4 className="text-xl font-bold">STAT</h4>
              </Card>
            </div>
          </main>
        </div>
      </main>
    </div>
  );
}
