// frontend/src/pages/LoadingLobby.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";
import { Button } from "../components/ui/button";
import Chat from "../components/ui/chat";
import { useUser } from "../context/UserContext";
import Header from "../components/ui/header";

function PlayerCard({
  username,
  isLoading,
  isReady,
  style,
  profilePic,
  isCreator,
}) {
  return (
    <div
      style={style}
      className={`absolute bg-[#0D1117] text-white rounded-md px-4 py-2 flex items-center space-x-2 w-48 transform -translate-x-1/2 -translate-y-1/2
        ${isLoading ? "opacity-70" : ""} ${
        isReady ? "border-2 border-green-500" : ""
      }`}
    >
      <img
        src={profilePic || "/api/placeholder/24/24"}
        alt="avatar"
        className="w-6 h-6 rounded-full"
      />
      <div className="flex flex-col">
        <span className="font-medium">{username}</span>
        {isCreator && <span className="text-xs text-blue-400">(Creator)</span>}
      </div>
    </div>
  );
}

export default function LoadingLobby() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [creatorId, setCreatorId] = useState(null);
  const [lobbyStatus, setLobbyStatus] = useState("");
  const [lobbyId] = useState(localStorage.getItem("lobbyId") || "");
  const [myUserId] = useState(localStorage.getItem("myUserId") || "Guest");

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    if (!lobbyId || !myUserId) {
      alert("Missing lobby ID or user ID.");
      navigate("/lobbies");
      return;
    }

    socket.emit("join-lobby", {
      lobbyId,
      userId: myUserId,
      username: user?.username,
      profilePic: user?.profilePic,
    });

    socket.on("lobby-update", (data) => {
      console.log("Lobby Update:", data);

      if (data.players && Array.isArray(data.players)) {
        const uniquePlayers = data.players.reduce((acc, current) => {
          const exists = acc.find((p) => p.userId === current.userId);
          return exists ? acc : [...acc, current];
        }, []);
        setPlayers(uniquePlayers);
      }

      if (data.creatorId) {
        setCreatorId(data.creatorId);
      }

      setLobbyStatus(data.message || "Lobby updated.");
    });

    socket.on("lobby-closed", (data) => {
      alert("Lobby closed: " + data.message);
      navigate("/lobbies");
    });

    socket.on("game-started", (data) => {
      console.log("Game started:", data);
      localStorage.setItem("gameId", data.gameId);
      localStorage.setItem("roundId", data.roundId);
      navigate("/typinggame");
    });

    return () => {
      socket.off("lobby-update");
      socket.off("lobby-closed");
      socket.off("game-started");
    };
  }, [navigate, user, lobbyId, myUserId]);

  const handleStartGame = async () => {
    try {
      socket.emit("start-game", { lobbyId });
      console.log("Game start triggered.");
    } catch (err) {
      console.error("Error starting game:", err);
      alert("Could not start game. Please try again.");
    }
  };

  const handleLeaveLobby = () => {
    fetch("/api/lobbies/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lobby_id: lobbyId, user_id: myUserId }),
    })
      .then((res) => res.json())
      .then(() => {
        localStorage.removeItem("lobbyId");
        navigate("/lobbies");
      })
      .catch((err) => console.error("Error leaving lobby:", err));
  };

  function calculatePosition(index, total, radius) {
    const angleDeg = 270 + (360 / total) * index;
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      left: `${50 + radius * Math.cos(angleRad)}%`,
      top: `${50 + radius * Math.sin(angleRad)}%`,
    };
  }

  const positionedPlayers = players.map((p, i) => ({
    ...p,
    position: calculatePosition(i, players.length, 35),
  }));

  const isCurrentUserCreator = myUserId === creatorId;

  return (
    <div className="relative w-full min-h-screen bg-gray-100">
      <Header />
      <main className="pt-6 px-6 pr-[350px] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">{lobbyStatus}</h2>

        <div className="relative w-full aspect-square max-w-2xl">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <h3 className="text-xl font-bold mb-2">Game Lobby</h3>

            {isCurrentUserCreator && players.length >= 2 && (
              <Button onClick={handleStartGame} className="mb-2">
                Start Game
              </Button>
            )}

            <div className="mt-4">
              <Button onClick={handleLeaveLobby}>Leave Lobby</Button>
            </div>
          </div>

          {positionedPlayers.map((player, idx) => (
            <PlayerCard
              key={player.userId || idx}
              username={player.username}
              isLoading={false}
              isReady={false}
              style={player.position}
              profilePic={player.profilePic}
              isCreator={player.userId === creatorId}
            />
          ))}
        </div>
      </main>

      <div
        className="fixed bg-[#1f2430] border-l border-gray-700"
        style={{
          width: "350px",
          right: 0,
          top: "72px",
          height: "calc(100vh - 72px)",
        }}
      >
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
