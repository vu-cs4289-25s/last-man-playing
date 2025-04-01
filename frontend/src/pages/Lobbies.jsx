/************************************************
 * File: frontend/src/pages/Lobbies.jsx
 ************************************************/
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { socket } from "../lib/socket";

// Optional: sanitize or normalize search
function normalizeLobbyName(str) {
  return str.toLowerCase().replace(/[^a-z0-9 ]/g, "");
}

export default function Lobbies() {
  const [lobbies, setLobbies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // We'll store a random userId in localStorage or something
  // so we can identify the user. Or you can just generate a new one each time.
  useEffect(() => {
    if (!localStorage.getItem("myUserId")) {
      localStorage.setItem("myUserId", crypto.randomUUID());
    }
  }, []);

  useEffect(() => {
    // 1. Connect socket if not connected
    if (!socket.connected) {
      socket.connect();
    }

    // 2. Listen for "lobby-update" events
    socket.on("lobby-update", (data) => {
      console.log("Lobby updated:", data);
      // Could show a toast or do real-time state updates
    });

    // 3. Fetch public lobbies
    fetch("/api/lobbies/public")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLobbies(data);
        } else {
          console.error("Unexpected response format:", data);
          setLobbies([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching public lobbies:", error);
      });

    // Cleanup when unmounting
    return () => {
      socket.off("lobby-update");
    };
  }, []);

  // Filter the lobbies by name
  const filteredLobbies = lobbies.filter((lobby) =>
    normalizeLobbyName(lobby.name).includes(normalizeLobbyName(searchTerm))
  );

  // Called when user clicks "Join"
  const handleJoin = (lobbyId) => {
    const myUserId = localStorage.getItem("myUserId") || crypto.randomUUID();

    // 1. POST /api/lobbies/join
    fetch("/api/lobbies/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lobby_id: lobbyId,
        user_id: myUserId,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        console.log("Joined lobby response:", result);
        if (
          result.message === "Joined lobby successfully" ||
          result.message === "Already in lobby"
        ) {
          // 2. Now join the socket room
          socket.emit("join-lobby", { lobbyId });

          // 3. Store the current lobby for later usage
          localStorage.setItem("lobbyId", lobbyId);

          // 4. Navigate to "LoadingLobby" or your actual game page
          navigate("/loading-lobby");
        } else {
          alert(result.message || "Failed to join lobby");
        }
      })
      .catch((err) => console.error("Error joining lobby:", err));
  };

  const handleCreateLobby = () => {
    navigate("/CreateLobby");
  };

  const handleLogout = () => {
    localStorage.removeItem("myUserId");
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">LAST MAN PLAYING</h1>
        <div className="flex items-center gap-4">
          <img
            src="https://via.placeholder.com/40"
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-gray-500"
          />
          <Button onClick={handleLogout} className="bg-red-500 text-white hover:bg-red-600">
            Logout
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 bg-gray-100 p-4 flex flex-col items-center">
        <Card className="w-full max-w-5xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">LOBBIES</CardTitle>
          </CardHeader>

          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search for lobby"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md"
              />
            </div>

            {/* Create Lobby Button */}
            <div className="mb-4 flex gap-2">
              <Button
                onClick={handleCreateLobby}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Create Lobby
              </Button>
            </div>

            {/* Display Lobbies */}
            <div className="bg-white border p-4 rounded-md max-h-[400px] overflow-y-auto">
              {filteredLobbies.length === 0 ? (
                <p className="text-gray-500">No lobbies found.</p>
              ) : (
                filteredLobbies.map((lobby) => (
                  <div
                    key={lobby.id}
                    className="bg-blue-800 text-white rounded-md p-4 mb-2 flex justify-between items-center"
                  >
                    <span className="font-semibold">{lobby.name}</span>
                    <span>
                      {lobby.playerCount}/{lobby.maxPlayers}
                    </span>
                    <Button onClick={() => handleJoin(lobby.id)}>Join</Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}