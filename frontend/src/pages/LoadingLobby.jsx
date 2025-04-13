// frontend/src/pages/LoadingLobby.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";
import Chat from "../components/ui/chat";

// eslint-disable-next-line react/prop-types
function PlayerCard({ username, isLoading, isReady, style }) {
  return (
    <div
      style={style}
      className={`absolute bg-[#0D1117] text-white rounded-md px-4 py-2
        flex items-center space-x-2 w-48 transform -translate-x-1/2 -translate-y-1/2
        ${isLoading ? "opacity-70" : ""} ${isReady ? "border-2 border-green-500" : ""}`}
    >
      <img
        src="/api/placeholder/24/24"
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
  const [isAllPlayersReady, setIsAllPlayersReady] = useState(false);

  const lobbyId = localStorage.getItem("lobbyId") || "";
  const myUserId = localStorage.getItem("myUserId") || "Guest";

  useEffect(() => {
    if (!lobbyId) {
      console.error("No lobbyId found in localStorage");
      return;
    }
    console.log("LoadingLobby: join-lobby =>", lobbyId);
    socket.emit("join-lobby", { lobbyId });

    socket.on("lobby-update", (data) => {
      console.log("LoadingLobby: Received lobby-update:", data);
      setLobbyStatus(data.msg || data.action || "LOBBY UPDATE");
      if (data.players) {
        // Example placeholder logic for isReady/isLoading
        const updatedPlayers = data.players.map((p) => ({
          ...p,
          isReady: false,
          isLoading: false,
        }));
        setPlayers(updatedPlayers);
      }
    });

    socket.on("lobby-closed", (data) => {
      console.log("LoadingLobby: Received lobby-closed:", data);
      alert("Lobby closed: " + data.message);
      navigate("/lobbies");
    });

    socket.on("game-started", (data) => {
      console.log("Socket event: game-started: => ", data);

      localStorage.setItem("gameId", data.gameId);
      localStorage.setItem("roundId", data.round.round_id);

      navigate("/typinggame");
    })

    return () => {
      socket.off("lobby-update");
      socket.off("lobby-closed");
      socket.off("game-started");
    };
  }, [navigate]);

  // Circle layout positioning
  function calculatePosition(index, total, radius) {
    // We'll place them around 360° from a starting angle of 270° (top)
    const angleDeg = 270 + (360 / total) * index;
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      left: `${50 + radius * Math.cos(angleRad)}%`,
      top: `${50 + radius * Math.sin(angleRad)}%`,
    };
  }

  const isReadyText = isAllPlayersReady ? "PLAYERS READY" : "PLAYERS LOADING...";

  // If no real players from server yet, fallback placeholders
  const actualPlayers = players.length > 0 ? players : [
    { user_id: "1", username: "Placeholder1", isReady: false, isLoading: true },
    { user_id: "2", username: "Placeholder2", isReady: false, isLoading: true },
    { user_id: "3", username: "Placeholder3", isReady: false, isLoading: true },
    { user_id: "4", username: "Placeholder4", isReady: false, isLoading: true },
    { user_id: "5", username: "Placeholder5", isReady: false, isLoading: true },
    { user_id: "6", username: "Placeholder6", isReady: false, isLoading: true },
  ];

  const positionedPlayers = actualPlayers.map((p, i) => ({
    ...p,
    position: calculatePosition(i, actualPlayers.length, 35),
  }));

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
      .then(() => navigate("/lobbies"))
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
      console.log("Game started! Everyone will be navigated via 'game-started' socket event.");

    } catch (err) {
      console.error("Error starting game:", err);
      alert("Error starting game. Check console/logs.");
    }
  }

  return (
      <div className="relative w-full min-h-screen bg-gray-100">
        {/* NAVBAR */}
        <header className="w-full bg-gray-300 py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wide">LAST MAN PLAYING</h1>
          <img
              src="/api/placeholder/40/40"
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-gray-500"
          />
        </header>

        {/* MAIN CONTENT: circle layout => pad right so the pinned chat is not overlapped */}
        <main className="pt-6 px-6 pr-[350px] flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">{isReadyText}</h2>

          <div className="relative w-full aspect-square max-w-2xl">
            {/* Center text / button */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <h3 className="text-xl font-bold mb-2">GAME LOBBY #1</h3>

              <button
                  className="bg-gray-700 text-white px-6 py-2 rounded-md font-medium mb-2"
                  onClick={handleStartGame}
              >
                Start Game
              </button>

              {/* LEAVE LOBBY BUTTON BELOW THE CENTER LOADING/READY BUTTON */}
              <div className="mt-4">
                <button
                    onClick={handleLeaveLobby}
                    className="bg-gray-700 text-white px-4 py-2 rounded-md"
                >
                  Leave Lobby
                </button>
              </div>
            </div>

            {/* Player Cards in a circle */}
            {positionedPlayers.map((player, idx) => (
                <PlayerCard
                    key={player.user_id || idx}
                    username={player.username}
                    isLoading={player.isLoading}
                    isReady={player.isReady}
                    style={player.position}
                />
            ))}
          </div>
        </main>

        {/* PINNED CHAT on the right, below navbar => top=64 if your navbar is ~64px high */}
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
              lobbyId={localStorage.getItem("lobbyId") || ""}
              userId={localStorage.getItem("myUserId") || "Guest"}
              players={players}
              onLeaveLobby={handleLeaveLobby}
          />
        </div>
      </div>
  );
};
