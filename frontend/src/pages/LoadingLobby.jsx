import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";
import Chat from "../components/ui/chat";
import Header from "../components/ui/Header";
import { Button } from "../components/ui/button";
import ErrorAlert from "../components/ui/alert";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "../components/ui/card";

function PlayerCard({ username, avatarUrl, isLoading, isReady, style }) {
  return (
    <div
      style={style}
      className={`absolute bg-[#0D1117] text-white rounded-md px-4 py-2
        flex items-center space-x-2 w-48 transform -translate-x-1/2 -translate-y-1/2
        ${isLoading ? "opacity-70" : ""} ${isReady ? "border-2 border-green-500" : ""}`}
    >
      <img
        src={avatarUrl || "https://placehold.co/24x24/0D1117/FFFFFF?text=?"}
        alt={`${username} avatar`}
        className="w-6 h-6 rounded-full"
      />
      <span className="font-medium">
        {isLoading
          ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Loading</span>
            </div>
          )
          : username}
      </span>
    </div>
  );
}

export default function LoadingLobby() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [lobbyLeaderId, setLobbyLeaderId] = useState(localStorage.getItem("lobbyLeaderId") || "");
  const [error, setError] = useState("");

  const lobbyId = localStorage.getItem("lobbyId") || "";
  const myUserId = localStorage.getItem("myUserId") || "Guest";
  const lobbyName = localStorage.getItem("lobbyName") || "Lobby";
  const maxPlayers = parseInt(localStorage.getItem("maxPlayers") || "6", 10);
  const isAllPlayersReady = players.length === maxPlayers;
  const statusText = isAllPlayersReady ? "PLAYERS READY" : "PLAYERS LOADING...";

  // 1) If we somehow lost our lobbyId, show banner then redirect
  useEffect(() => {
    if (!lobbyId) {
      setError("You left the lobby. Redirecting...");
      const t = setTimeout(() => navigate("/lobbies"), 3000);
      return () => clearTimeout(t);
    }
  }, [lobbyId, navigate]);

  // 2) Socket listeners
  useEffect(() => {
    if (!lobbyId) return;

    socket.emit("join-lobby", { lobbyId });

    socket.on("lobby-update", (data) => {
      if (data.lobbyLeaderId && data.lobbyLeaderId !== lobbyLeaderId) {
        setLobbyLeaderId(data.lobbyLeaderId);
        localStorage.setItem("lobbyLeaderId", data.lobbyLeaderId);
      }
      if (data.players) {
        setPlayers(data.players.map((p) => ({ ...p, isLoading: false, isReady: false })));
      }
    });

    socket.on("lobby-closed", (data) => {
      setError("Lobby closed: " + data.message);
      setTimeout(() => navigate("/lobbies"), 3000);
    });

    socket.on("game-started", (data) => {
      localStorage.setItem("gameId", data.gameId); 
      localStorage.setItem("roundId", data.round.round_id);
      navigate("/typinggame");
    });

    return () => {
      socket.off("lobby-update");
      socket.off("lobby-closed");
      socket.off("game-started");
    };
  }, [lobbyId, lobbyLeaderId, navigate]);

  // 3) Clean up any lingering errors after 4s
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 4000);
    return () => clearTimeout(t);
  }, [error]);

  // 4) Leave-Lobby handler
  function handleLeaveLobby() {
    if (!lobbyId || !myUserId) {
      setError("Lobby or user not found.");
      return;
    }
    fetch("/api/lobbies/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lobby_id: lobbyId, user_id: myUserId }),
    })
      .then(() => {
        localStorage.removeItem("lobbyId");
        setError("You have left the lobby.");
        navigate("/lobbies");
      })
      .catch(() => {
        setError("Failed to leave lobby.");
      });
  }

  // 5) Start-Game handler
  async function handleStartGame() {
    try {
      const res = await fetch("/api/games/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lobby_id: lobbyId, user_id: myUserId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not start game.");
      }
    } catch {
      setError("Error starting game.");
    }
  }

  // layout helpers
  function calculatePosition(i, n, r) {
    const angle = (270 + (360 / n) * i) * Math.PI / 180;
    return { left: `${50 + r * Math.cos(angle)}%`, top: `${50 + r * Math.sin(angle)}%` };
  }


  const actualPlayers = players.length > 0
    ? players
    : Array.from({ length: maxPlayers }, (_, i) => ({
        user_id: String(i+1),
        username: `Waiting...`,
        profile_image_url: null,
        isLoading: true,
        isReady: false
      }));
  const positioned = actualPlayers.map((p, i) => ({ ...p, style: calculatePosition(i, actualPlayers.length, 35) }));

  return (
    <div className="relative w-full min-h-screen bg-gray-100">
      <Header />

      {error && (
        <div className="absolute top-[64px] w-full flex justify-center z-20">
          <ErrorAlert message={error} className="max-w-lg" />
        </div>
      )}

      <main className="pt-6 px-6 pr-[350px] flex flex-col items-center">
        <h3 className="text-2xl font-bold">{lobbyName}</h3>
        <p className="text-xl font-bold mb-4">{statusText}</p>

        <div className="relative w-full aspect-square max-w-2xl">
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
            
            <Button 
            className="bg-gray-700 text-white px-6 py-2 rounded-md font-medium mb-2"
            onClick={handleStartGame}>Start Game</Button>
            <Button 
            className="bg-gray-700 text-white px-4 py-2 rounded-md" 
            onClick={handleLeaveLobby}>Leave Lobby</Button>
          </div>

          {positioned.map((p) => (
            <PlayerCard
              key={p.user_id}
              username={p.username}
              avatarUrl={p.profile_image_url}
              isLoading={p.isLoading}
              isReady={p.isReady}
              style={p.style}
            />
          ))}
        </div>
      </main>

      <div className="fixed right-0 top-[72px] h-[calc(100vh-72px)] w-80 border-l border-gray-700 bg-[#1f2430]">
        <Chat
          lobbyId={lobbyId}
          username={localStorage.getItem("myUsername") || "Guest"}
          players={players}
          onLeaveLobby={handleLeaveLobby}
        />
      </div>
    </div>
  );
}
