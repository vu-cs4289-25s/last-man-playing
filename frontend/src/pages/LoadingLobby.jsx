// frontend/src/pages/LoadingLobby.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";
import { Button } from "../components/ui/button";

export default function LoadingLobby() {
  const [players, setPlayers] = useState([]);
  const [lobbyStatus, setLobbyStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const lobbyId = localStorage.getItem("lobbyId");
    if (!lobbyId) {
      console.error("No lobbyId found in localStorage");
      return;
    }

    // Emit event to join the lobby room if not already joined
    socket.emit("join-lobby", { lobbyId });

    // Listen for lobby updates
    socket.on("lobby-update", (data) => {
      console.log("Received lobby-update:", data);
      // Update lobby status or participants as needed.
      setLobbyStatus(data.action);
      if (data.players) {
        setPlayers(data.players);
      }
    });

    // Listen for a lobby closed event
    socket.on("lobby-closed", (data) => {
      alert("Lobby closed: " + data.message);
      navigate("/lobbies");
    });

    return () => {
      socket.off("lobby-update");
      socket.off("lobby-closed");
    };
  }, [navigate]);

  // Example: A leave lobby button
  const handleLeaveLobby = () => {
    const lobbyId = localStorage.getItem("lobbyId");
    const myUserId = localStorage.getItem("myUserId");
    if (!lobbyId || !myUserId) {
      alert("Lobby or user not found.");
      return;
    }
    fetch("/api/lobbies/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lobby_id: lobbyId, user_id: myUserId }),
    })
      .then((res) => res.json())
      .then((result) => {
        console.log("Leave lobby response:", result);
        navigate("/lobbies");
      })
      .catch((err) => console.error("Error leaving lobby:", err));
  };

  return (
    <div>
      <h1>Lobby Status: {lobbyStatus}</h1>
      <ul>
        {players.map((player) => (
          <li key={player.user_id}>{player.username}</li>
        ))}
      </ul>
      <Button onClick={handleLeaveLobby}>Leave Lobby</Button>
    </div>
  );
}