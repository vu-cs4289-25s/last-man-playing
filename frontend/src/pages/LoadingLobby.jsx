// frontend/src/pages/LoadingLobby.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { socket } from "../lib/socket";
import Chat from "../components/ui/chat";

export default function LoadingLobby() {
  const [players, setPlayers] = useState([]);
  const [lobbyStatus, setLobbyStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const lobbyId = localStorage.getItem("lobbyId");
    if (!lobbyId) return;

    // Join the lobby
    console.log("LoadingLobby: Emitting join-lobby =>", lobbyId);
    socket.emit("join-lobby", { lobbyId });

    socket.on("lobby-update", (data) => {
      console.log("LoadingLobby: Received lobby-update =>", data);
      setLobbyStatus(data.action);
      if (data.players) {
        setPlayers(data.players);
      }
    });

    socket.on("lobby-closed", (data) => {
      console.log("LoadingLobby: Received lobby-closed =>", data);
      alert("Lobby closed: " + data.message);
      navigate("/lobbies");
    });

    return () => {
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
      .then(() => navigate("/lobbies"))
      .catch((err) => console.error("Error leaving lobby:", err));
  };

  const lobbyId = localStorage.getItem("lobbyId") || "";
  const myUserId = localStorage.getItem("myUserId") || "Guest";

  return (
    <div className="relative w-full min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">LAST MAN PLAYING</h1>
        <div className="flex items-center space-x-4">
          <span className="text-xl font-bold">Time: 55</span>
          <img
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-gray-500"
          />
        </div>
      </header>

      {/* MAIN CONTENT: we pad right so it doesn't hide behind the pinned chat */}
      <main className="pt-6 px-6 pr-[350px]">
        <h1 className="text-2xl font-bold mb-4">Lobby Status: {lobbyStatus}</h1>
        <ul className="list-disc list-inside mb-4">
          {players.map((player) => (
            <li key={player.user_id} className="pl-1">
              {player.username}
            </li>
          ))}
        </ul>
        <Button onClick={handleLeaveLobby}>Leave Lobby</Button>
      </main>

      {/* PINNED CHAT: below navbar, from right, 350px wide */}
      <div
        className="fixed bg-[#1f2430] border-l border-gray-700"
        style={{
          width: "350px",
          right: 0,
          top: "72px", // If your navbar is 64px tall
          height: "calc(100vh - 72px)",
        }}
      >
        <Chat
          lobbyId={lobbyId}
          userId={myUserId}
          players={players}
          onLeaveLobby={handleLeaveLobby}
        />
      </div>
    </div>
  );
}
