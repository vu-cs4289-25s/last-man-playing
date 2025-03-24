// frontend/src/pages/CreateLobby.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function CreateLobby() {
  // For demonstration; in a real app, username should come from your auth context
  const username = "Nat";

  // State for lobby details
  const [lobbyName, setLobbyName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [isPrivate, setIsPrivate] = useState(false);
  const [lobbyPassword, setLobbyPassword] = useState("");
  const numRounds = maxPlayers - 1; // Not sent to backend but shown for info
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Use provided lobby name or default to a username-based name
    const finLobbyName = lobbyName.trim() || `${username}'s Lobby`;

    // Build payload expected by the backend
    const newLobbyData = {
      lobby_name: finLobbyName,
      is_private: isPrivate,
      password: isPrivate ? lobbyPassword : null,
    };

    try {
      // Retrieve the auth token from localStorage
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("No authentication token found. Please log in.");
      }

      const res = await fetch("/api/lobbies/createLobby", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(newLobbyData),
      });

      if (!res.ok) {
        throw new Error(`Error Creating Lobby: ${res.status}`);
      }

      const createdLobby = await res.json();
      console.log("Lobby created successfully", createdLobby);

      // Assuming your backend returns an object with a key "lobby" holding the lobby data
      localStorage.setItem("lobbyId", createdLobby.lobby.lobby_id);

      navigate("/loading-lobby");
    } catch (err) {
      console.error("Create Lobby Error:", err);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">LAST MAN PLAYING</h1>
        {/* Profile Icon */}
        <img
          src="https://via.placeholder.com/40"
          alt="Profile"
          className="w-10 h-10 rounded-full border-2 border-gray-500"
        />
      </header>

      <main className="flex flex-col flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-6 bg-white shadow-lg">
          <CardHeader className="mb-6">
            <CardTitle className="text-3xl text-center">Create Lobby</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Lobby Name */}
              <div>
                <label className="block mb-1 font-medium">Lobby Name</label>
                <Input
                  type="text"
                  value={lobbyName}
                  onChange={(e) => setLobbyName(e.target.value)}
                  placeholder="Enter Lobby Name"
                  className="w-full"
                />
              </div>

              {/* Number of Players */}
              <div>
                <label className="block mb-1 font-medium">Number of Players</label>
                <select
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {[2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} players
                    </option>
                  ))}
                </select>
              </div>

              {/* Rounds (read-only) */}
              <div>
                <label className="block mb-1 font-medium">Rounds</label>
                <div className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2">
                  {numRounds} rounds
                </div>
              </div>

              {/* Public / Private Toggle */}
              <div className="flex gap-4 items-center">
                <label className="font-medium">Public</label>
                <input
                  type="radio"
                  name="privacy"
                  checked={!isPrivate}
                  onChange={() => setIsPrivate(false)}
                />

                <label className="font-medium">Private</label>
                <input
                  type="radio"
                  name="privacy"
                  checked={isPrivate}
                  onChange={() => setIsPrivate(true)}
                />
              </div>

              {/* Lobby Password Field for Private Lobbies */}
              {isPrivate && (
                <div>
                  <label className="block mb-1 font-medium">Lobby Password</label>
                  <Input
                    type="text"
                    value={lobbyPassword}
                    onChange={(e) => setLobbyPassword(e.target.value)}
                    placeholder="Enter lobby password"
                    className="w-full"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  onClick={handleBack}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Back
                </Button>

                <Button type="submit" className="bg-[#0D1117] text-white hover:bg-[#161B22]">
                  Create
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
