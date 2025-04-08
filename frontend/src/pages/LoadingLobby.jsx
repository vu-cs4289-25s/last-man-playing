// // frontend/src/pages/LoadingLobby.jsx

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "../components/ui/button";
// // import { Chat } from "../components/ui/chat";
// // import { socket } from "../lib/socket";

// export default function LoadingLobby() {
//   const [players, setPlayers] = useState([]);
//   const [lobbyStatus, setLobbyStatus] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const lobbyId = localStorage.getItem("lobbyId");
//     if (!lobbyId) {
//       return;
//     };

//     // Emit event to join the lobby room if not already joined
//     socket.emit("join-lobby", { lobbyId });

//     socket.on("lobby-update", (data) => {
//       console.log("Received lobby-update:", data);
//       setLobbyStatus(data.action);
//       // if data has players, setPlayers(data.players) etc.
//     });

//     // Listen for lobby closed
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

//   // const myUserId = localStorage.getItem("myUserId"); // added
//   // const lobbyId = localStorage.getItem("lobbyId"); // added

//   return (
//     // 1) The top-level container is a column, filling the screen
//     <div className="flex flex-col min-h-screen bg-gray-100">
//       {/* 2) Header */}
//       <header className="w-full bg-gray-300 py-4 px-6 flex justify-between items-center">
//         <h1 className="text-2xl font-bold tracking-wide">LAST MAN PLAYING</h1>
//         <div className="flex items-center space-x-4">
//           <span className="text-xl font-bold">Time: 55</span>
//           <img
//             alt="Profile"
//             className="w-10 h-10 rounded-full border-2 border-gray-500"
//           />
//         </div>
//       </header>

//       {/* 3) The main content row is flex-1 so it expands to fill leftover space. */}
//       <div className="flex flex-1">
//         {/* LEFT side => fill leftover width */}
//         <div className="flex-1 p-6">
//           <h1 className="text-2xl font-bold mb-4">Lobby Status: {lobbyStatus}</h1>
//           <ul className="list-disc list-inside mb-4">
//             {players.map((player) => (
//               <li key={player.user_id} className="pl-1">
//                 {player.username}
//               </li>
//             ))}
//           </ul>
//           <Button onClick={handleLeaveLobby}>Leave Lobby</Button>
//         </div>

//         {/* RIGHT side => fixed or set width, full height */}
//         {/*<div className="w-[350px] h-full">
//           <Chat
//             lobbyId="myLobby"
//             userId="myUser"
//             players={players}
//             onLeaveLobby={handleLeaveLobby}
//           />
//         </div>*/}
//       </div>
//     </div>
//   );
// }

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