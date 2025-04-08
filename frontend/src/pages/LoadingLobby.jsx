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
  const { user } = useUser(); // Get user from context
  const [players, setPlayers] = useState([]);
  const [lobbyStatus, setLobbyStatus] = useState("");
  const [creatorId, setCreatorId] = useState(null); // Track creator of the lobby
  const navigate = useNavigate();

  useEffect(() => {
    const lobbyId = localStorage.getItem("lobbyId");
    const myUserId = localStorage.getItem("myUserId");
    if (!lobbyId || !myUserId) {
      console.error("No lobbyId or myUserId found in localStorage");
      return;
    }

    // Emit event to join the lobby room if not already joined
    socket.emit("join-lobby", {
      lobbyId,
      userId: myUserId,
      username: user?.username,
      profilePic: user?.profilePic,
    });

    // Listen for lobby updates
    socket.on("lobby-update", (data) => {
      console.log("Received lobby-update:", data);

      // Ensure the event data contains the players and replace the list if it's new
      if (data && data.players) {
        console.log("Players in the lobby:", data.players); // Log players data

        // Set the new list of players (replace the existing list to avoid duplicates)
        setPlayers(data.players);
        setCreatorId(data.creatorId); // Update the creatorId from the update
        setLobbyStatus(data.action); // Update the status of the lobby
      } else {
        console.error("No players found in lobby update:", data);
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
  }, [user, navigate]);

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

  // Handle starting the game (only for the creator)
  const handleStartGame = () => {
    const lobbyId = localStorage.getItem("lobbyId");
    if (!lobbyId) {
      alert("No lobby found.");
      return;
    }

    // Emit event to start the game
    socket.emit("start-game", { lobbyId });
    navigate("/game"); // Navigate to the game page
  };

  return (
    <div>
      <Header />
      <h1>Lobby Status: {lobbyStatus}</h1>
      <h2>Players in Lobby:</h2>
      {players.length === 0 ? (
        <p>No players yet. Waiting for others to join...</p>
      ) : (
        <ul>
          {players.map((player) => (
            <li key={player.user_id}>
              {/* Fallback for image if player does not have a profile picture */}
              <img
                src={player.profilePic || "https://placekitten.com/40/40"}
                alt={player.username}
                style={{ width: "40px", height: "40px", borderRadius: "50%" }}
              />
              {player.username}
            </li>
          ))}
        </ul>
      )}

      {user && creatorId === user.user_id && players.length > 1 && (
        <Button onClick={handleStartGame} className="mt-4">
          Start Game
        </Button>
      )}

      <Button onClick={handleLeaveLobby} className="mt-4">
        Leave Lobby
      </Button>
    </div>
  );
}
