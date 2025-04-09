
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

    socket.emit("join-lobby", { lobbyId });

    socket.on("lobby-update", (data) => {
      console.log("Received lobby-update:", data);
      setLobbyStatus(data.action);
      if (data.players) {
        setPlayers(data.players);
      }
    });

    socket.on("lobby-closed", (data) => {
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

  const lobbyId = localStorage.getItem("lobbyId");
  const myUserId = localStorage.getItem("myUserId");

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

      {/* MAIN CONTENT (with padding on the right so it won't hide under chat) */}
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

      {/* PINNED CHAT: below the navbar, so top=64px if the navbar is ~64px tall */}
      <div
        className="fixed right-0 bg-[#1f2430] text-white border-l border-gray-700"
        style={{
          width: "350px",
          top: "64px", // or however tall your navbar is
          height: "calc(100vh - 64px)",
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


// frontend/src/pages/LoadingLobby.jsx

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "../components/ui/button";
// import { socket } from "../lib/socket";
// import Chat from "../components/ui/chat";

// export default function LoadingLobby() {
//   const [players, setPlayers] = useState([]);
//   const [lobbyStatus, setLobbyStatus] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const lobbyId = localStorage.getItem("lobbyId");
//     if (!lobbyId) return;

//     console.log("LoadingLobby: Emitting join-lobby", lobbyId);
//     socket.emit("join-lobby", { lobbyId });

//     socket.on("lobby-update", (data) => {
//       console.log("LoadingLobby: Received lobby-update", data);
//       setLobbyStatus(data.action);
//       if (data.players) {
//         setPlayers(data.players);
//       }
//     });

//     socket.on("lobby-closed", (data) => {
//       console.log("LoadingLobby: Received lobby-closed", data);
//       alert("Lobby closed: " + data.message);
//       navigate("/lobbies");
//     });

//     return () => {
//       socket.off("lobby-update");
//       socket.off("lobby-closed");
//     };
//   }, [navigate]);

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
//       .then(() => navigate("/lobbies"))
//       .catch((err) => console.error("Error leaving lobby:", err));
//   };

//   const myUserId = localStorage.getItem("myUserId") || "Guest";
//   const lobbyId = localStorage.getItem("lobbyId") || "NoLobbyId";

//   return (
//     <div className="relative w-full min-h-screen bg-gray-100">
//       {/* NAVBAR */}
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

//       {/* MAIN CONTENT (with right padding so it won't hide under chat) */}
//       <main className="pt-6 px-6 pr-[350px]">
//         <h1 className="text-2xl font-bold mb-4">
//           Lobby Status: {lobbyStatus}
//         </h1>
//         <ul className="list-disc list-inside mb-4">
//           {players.map((player) => (
//             <li key={player.user_id} className="pl-1">
//               {player.username}
//             </li>
//           ))}
//         </ul>
//         <Button onClick={handleLeaveLobby}>Leave Lobby</Button>
//       </main>

//       {/* PINNED CHAT: adjust top to exactly your navbar's height. If your nav is ~64px tall, do top-[64px]. */}
//       <div
//         className="fixed right-0 border-l border-gray-700"
//         style={{
//           width: "350px",
//           top: "64px", // match your actual navbar height
//           height: "calc(100vh - 64px)",
//         }}
//       >
//         <Chat
//           lobbyId={lobbyId}
//           userId={myUserId}
//           players={players}
//           onLeaveLobby={handleLeaveLobby}
//         />
//       </div>
//     </div>
//   );
// }
