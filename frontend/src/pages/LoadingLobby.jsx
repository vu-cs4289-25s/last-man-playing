import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";
import Chat from "../components/ui/chat";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import Header from "../components/ui/Header";

// eslint-disable-next-line react/prop-types
function PlayerCard({ username, isLoading, isReady, style }) {
  return (
    <div
      style={style}
      className={`absolute bg-[#0D1117] text-white rounded-md px-4 py-2
        flex items-center space-x-2 w-48 transform -translate-x-1/2 -translate-y-1/2
        ${isLoading ? "opacity-70" : ""} ${
        isReady ? "border-2 border-green-500" : ""
      }`}
    >
      <img
        src="https://placehold.co/24x24/0D1117/FFFFFF?text=?"
        alt="Player avatar"
        className="w-6 h-6 rounded-full"
      />
      <span className="font-medium">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Loading</span>
          </div>
        ) : (
          username
        )}
      </span>
    </div>
  );
}

export default function LoadingLobby() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [lobbyStatus, setLobbyStatus] = useState("");
  const [lobbyLeaderId, setLobbyLeaderId] = useState(
    localStorage.getItem("lobbyLeaderId") || ""
  );
  const [isAllPlayersReady, setIsAllPlayersReady] = useState(false);

  const lobbyId = localStorage.getItem("lobbyId") || "";
  const myUserId = localStorage.getItem("myUserId") || "Guest";

  useEffect(() => {
    if (!lobbyId) {
      alert("You are no longer in a lobby. Redirecting to the lobbies page.");
      navigate("/lobbies");
    }
  }, [lobbyId, navigate]);

  useEffect(() => {
    if (!lobbyId) {
      console.error("No lobbyId found in localStorage");
      return;
    }

    socket.emit("join-lobby", { lobbyId });

    socket.on("lobby-update", (data) => {
      setLobbyStatus(data.msg || data.action || "LOBBY UPDATE");

      if (data.lobbyLeaderId) {
        setLobbyLeaderId(data.lobbyLeaderId);
        localStorage.setItem("lobbyLeaderId", data.lobbyLeaderId);
      }

      if (data.players) {
        const updatedPlayers = data.players.map((p) => ({
          ...p,
          isReady: false,
          isLoading: false,
        }));
        setPlayers(updatedPlayers);
      }
    });

    socket.on("lobby-closed", (data) => {
      alert("Lobby closed: " + data.message);
      navigate("/lobbies");
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
  }, [lobbyId, navigate]);

  useEffect(() => {
    window.history.pushState({ inLobby: true }, "");

    const onPopState = (event) => {
      if (event.state && event.state.inLobby) {
        alert("You have left the lobby");
        handleLeaveLobby();
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  function handleLeaveLobby() {
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
      .then(() => {
        localStorage.removeItem("lobbyId");
        navigate("/lobbies");
      })
      .catch((err) => console.error("Error leaving lobby:", err));
  }

  async function handleStartGame() {
    try {
      const response = await fetch("/api/games/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lobby_id: lobbyId, user_id: myUserId }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Could not start game.");
        return;
      }
      console.log("Game started!");
    } catch (err) {
      console.error("Error starting game:", err);
      alert("Error starting game. Check console/logs.");
    }
  }

  function calculatePosition(index, total, radius) {
    const angleDeg = 270 + (360 / total) * index;
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      left: `${50 + radius * Math.cos(angleRad)}%`,
      top: `${50 + radius * Math.sin(angleRad)}%`,
    };
  }

  const isReadyText = isAllPlayersReady
    ? "PLAYERS READY"
    : "PLAYERS LOADING...";

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex flex-col flex-1 items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">{isReadyText}</h2>

        <div className="relative w-full aspect-square max-w-2xl">
          {/* Center text / button */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <h3 className="text-xl font-bold mb-2">GAME LOBBY #{lobbyId}</h3>

            {myUserId === lobbyLeaderId && (
              <button
                className="bg-gray-700 text-white px-6 py-2 rounded-md font-medium mb-2"
                onClick={handleStartGame}
              >
                Start Game
              </button>
            )}

            <div className="mt-4">
              <button
                onClick={handleLeaveLobby}
                className="bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                Leave Lobby
              </button>
            </div>
          </div>

          {/* Player Cards */}
          {players.map((player, idx) => (
            <PlayerCard
              key={player.user_id || idx}
              username={player.username}
              isLoading={player.isLoading}
              isReady={player.isReady}
              style={calculatePosition(idx, players.length, 35)}
            />
          ))}
        </div>
      </main>

      {/* Chat */}
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
