// frontend/src/pages/LoadingLobby.jsx

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { socket } from "../lib/socket";
// import { Button } from "../components/ui/button";
// import Header from "../components/ui/header";

// export default function LoadingLobby() {
//   const [players, setPlayers] = useState([]);
//   const [lobbyStatus, setLobbyStatus] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const lobbyId = localStorage.getItem("lobbyId");
//     if (!lobbyId) {
//       console.error("No lobbyId found in localStorage");
//       return;
//     }

//     // Emit event to join the lobby room if not already joined
//     socket.emit("join-lobby", { lobbyId });

//     // Listen for lobby updates
//     socket.on("lobby-update", (data) => {
//       console.log("Received lobby-update:", data);
//       // Update lobby status or participants as needed.
//       setLobbyStatus(data.action);
//       if (data.players) {
//         setPlayers(data.players);
//       }
//     });

//     // Listen for a lobby closed event
//     socket.on("lobby-closed", (data) => {
//       alert("Lobby closed: " + data.message);
//       navigate("/lobbies");
//     });

//     return () => {
//       socket.off("lobby-update");
//       socket.off("lobby-closed");
//     };
//   }, [navigate]);

//   // Example: A leave lobby button
//   const handleLeaveLobby = () => {
//     const lobbyId = localStorage.getItem("lobbyId");
//     const myUserId = localStorage.getItem("myUserId");
//     if (!lobbyId || !myUserId) {
//       alert("Lobby or user not found.");
//       return;
//     }
//     fetch("/api/lobbies/leave", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ lobby_id: lobbyId, user_id: myUserId }),
//     })
//       .then((res) => res.json())
//       .then((result) => {
//         console.log("Leave lobby response:", result);
//         navigate("/lobbies");
//       })
//       .catch((err) => console.error("Error leaving lobby:", err));
//   };

//   return (
//     <div>
//       <Header />
//       <h1>Lobby Status: {lobbyStatus}</h1>
//       <ul>
//         {players.map((player) => (
//           <li key={player.user_id}>{player.username}</li>
//         ))}
//       </ul>
//       <Button onClick={handleLeaveLobby}>Leave Lobby</Button>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";
import { Button } from "../components/ui/button";
import Header from "../components/ui/header";
import { useUser } from "../context/UserContext";

export default function LoadingLobby() {
  const { user } = useUser();
  const [players, setPlayers] = useState([]);
  const [lobbyStatus, setLobbyStatus] = useState("");
  const [creatorId, setCreatorId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const lobbyId = localStorage.getItem("lobbyId");
    const myUserId = localStorage.getItem("myUserId");

    if (!lobbyId || !myUserId) {
      console.error("No lobbyId or myUserId found in localStorage");
      return;
    }

    // Join the lobby
    socket.emit("join-lobby", {
      lobbyId,
      userId: myUserId,
      username: user?.username || `Player ${myUserId.slice(0, 4)}`,
      profilePic: user?.profilePic,
    });

    // Listen for lobby updates
    socket.on("lobby-update", (data) => {
      console.log("Received lobby-update:", data);

      if (data.players) {
        setPlayers(data.players);
      }
      if (data.creatorId) {
        console.log("Setting creator ID:", data.creatorId);
        setCreatorId(data.creatorId);
      }
      if (data.action) {
        setLobbyStatus(data.action);
      }
    });

    // Listen for game start
    socket.on("game-started", (data) => {
      console.log("Game started, redirecting to MathBlitz");
      navigate("/mathblitz");
    });

    // Listen for lobby closed
    socket.on("lobby-closed", (data) => {
      alert("Lobby closed: " + data.message);
      navigate("/lobbies");
    });

    return () => {
      socket.off("lobby-update");
      socket.off("game-started");
      socket.off("lobby-closed");
    };
  }, [user, navigate]);

  // Debug log for creator status
  useEffect(() => {
    console.log("Current user ID:", user?.user_id);
    console.log("Creator ID:", creatorId);
    console.log("Is creator:", user?.user_id === creatorId);
  }, [user, creatorId]);

  // Handle leaving the lobby
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
      <Header />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Lobby Status: {lobbyStatus}</h1>
        <h2 className="text-xl mb-4">Players in Lobby:</h2>
        {players.length === 0 ? (
          <p>No players yet. Waiting for others to join...</p>
        ) : (
          <ul className="space-y-2">
            {players.map((player) => (
              <li key={player.userId} className="flex items-center space-x-2">
                <img
                  src={player.profilePic || "https://placekitten.com/40/40"}
                  alt={player.username}
                  className="w-10 h-10 rounded-full"
                />
                <span>{player.username}</span>
                {player.userId === creatorId && (
                  <span className="text-sm text-blue-500">(Creator)</span>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Show start button only for creator and when there are at least 2 players */}
        {user && user.user_id === creatorId && players.length >= 2 && (
          <Button
            onClick={() => {
              const lobbyId = localStorage.getItem("lobbyId");
              socket.emit("start-game", { lobbyId });
              navigate("/mathblitz");
            }}
            className="mt-4"
          >
            Start Game
          </Button>
        )}

        <Button onClick={handleLeaveLobby} className="mt-4 ml-2">
          Leave Lobby
        </Button>
      </div>
    </div>
  );
}
