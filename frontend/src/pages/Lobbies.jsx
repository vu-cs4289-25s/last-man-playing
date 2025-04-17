// frontend/src/pages/Lobbies.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { socket } from "../lib/socket";
import Header from "../components/ui/Header";
import ErrorAlert from "../components/ui/alert";

function normalizeLobbyName(str) {
  return str.toLowerCase().replace(/[^a-z0-9 ]/g, "");
}

export default function Lobbies() {
  const [lobbies, setLobbies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  // full lobby

  // Ensure the user is logged in (user_id exists)
  useEffect(() => {
    const myUserId = localStorage.getItem("myUserId");
    if (!myUserId) {
      // alert
      alert("You must be logged in to view lobbies.");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("lobby-update", (data) => {
      console.log("Lobby updated:", data);
      // Optionally update UI here (e.g., re-fetch lobby participants)
    });

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

    return () => {
      socket.off("lobby-update");
    };
  }, []);

  const filteredLobbies = lobbies.filter((lobby) =>
    normalizeLobbyName(lobby.name).includes(normalizeLobbyName(searchTerm))
  );

  // Handle joining a lobby
  const handleJoin = (lobbyId) => {
    const myUserId = localStorage.getItem("myUserId");
    if (!myUserId) {
      return setError("You must be logged in to join a lobby.");
    }
  
    fetch("/api/lobbies/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lobby_id: lobbyId, user_id: myUserId }),
    })
      .then((res) => res.json().then(body => ({ status: res.status, body })))
      .then(({ status, body }) => {
        if (status === 200 &&
            (body.message === "Joined lobby successfully" ||
             body.message === "Already in lobby")) {
          localStorage.setItem("lobbyId", lobbyId);
          const joined = lobbies.find((l) => l.id === lobbyId);
         if (joined) {
           localStorage.setItem("lobbyName", joined.name);
           localStorage.setItem("maxPlayers", String(joined.maxPlayers));
         }
          navigate("/loadinglobby");
        } else {
          // ← show our alert instead of alert()
          setError(body.message || "Failed to join lobby");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Network error while joining lobby");
      });
  };
  

  const handleCreateLobby = () => {
    const myUserId = localStorage.getItem("myUserId");
    if (!myUserId) {
      alert("You must be logged in to create a lobby.");
      return;
    }
    navigate("/CreateLobby");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("myUserId");
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-100 p-4 flex flex-col items-center">
        <Card className="w-full max-w-5xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">LOBBIES</CardTitle>
          </CardHeader>

          <CardContent>
          {error && (
           <ErrorAlert 
             message={error} 
             className="mb-4" 
             onClose={() => setError("")} 
           />
           )}
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search for lobby"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md"
              />
            </div>

            <div className="mb-4 flex gap-2">
              <Button
                onClick={handleCreateLobby}
                className="bg-black text-white hover:bg-gray-700"
              >
                Create Lobby
              </Button>
            </div>

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
