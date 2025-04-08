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

    // Join the Socket.IO room for this lobby
    socket.emit("join-lobby", { lobbyId });

    // Listen for updates
    socket.on("lobby-update", (data) => {
      console.log("Received lobby-update:", data);
      setLobbyStatus(data.action);
      if (data.players) {
        setPlayers(data.players);
      }
    });

    // If the lobby is closed
    socket.on("lobby-closed", (data) => {
      alert("Lobby closed: " + data.message);
      navigate("/lobbies");
    });

    return () => {
      // Clean up
      socket.off("lobby-update");
      socket.off("lobby-closed");
    };
  }, [navigate]);

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
        // Also tell socket we left
        socket.emit("leave-lobby", { lobbyId });
        navigate("/lobbies");
      })
      .catch((err) => console.error("Error leaving lobby:", err));
  };

  // <---- NEW: Navigate to RPS Page ---->
  const handleGoToRPS = () => {
    navigate("/rps");
  };

  return (
    <div>
      <h1>Lobby Status: {lobbyStatus}</h1>
      <ul>
        {players.map((player) => (
          <li key={player.user_id}>{player.username}</li>
        ))}
      </ul>

      <div style={{ marginTop: "1rem" }}>
        <Button onClick={handleGoToRPS}>Play RPS</Button>
      </div>

      <Button onClick={handleLeaveLobby} style={{ marginTop: "1rem" }}>
        Leave Lobby
      </Button>
    </div>
  );
}