import React, { useState, useEffect } from "react";
import { socket } from "../../lib/socket";

export default function Chat({lobbyId, userId, players = [], onLeaveLobby = () => {}}) {
    const [msgs, setMsgs] = useState([]);
    const [inputVal, setInputVal] = useState("");
    const [activeTab, setActiveTab] = useState("chat");

    useEffect(() => {
        // if (!lobbyId) return;
        // // connect
        // //
        // const newSocket = io('/', { path: '/socket.io'});
        // setSocket(newSocket);

        // // join lobby
        // newSocket.emit("join-lobby", { lobbyId });

        // // listen for chat msgs
        // newSocket.on("chat-message", (data) => {
        //     // msg for room -> local state
        //     // if backend filters by room, no need to check lobby
        //     setMsgs((prev) => [...prev, data]);
        // })

        // return () => {
        //     // cleanup when leave lobby and close 
        //     newSocket.emit("leave-lobby", {lobbyId});
        //     newSocket.close();
        // }
        if (!lobbyId) return;
        socket.emit("join-lobby", { lobbyId });
      
        socket.on("chat-message", (data) => {
          setMsgs((prev) => [...prev, data]);
        });

        return () => {
          socket.emit("leave-lobby", { lobbyId });
          // if you want to remain connected overall, you might not even close.
          // socket.close(); // optional
          socket.off("chat-message");
        }
    }, [lobbyId]);

    function handleSend(){
        if (!inputVal.trim() || !socket) return;
        socket.emit("chat-message", {
            lobbyId,
            userId,
            text: inputVal,
        });

        setInputVal("");
    }

    function handleKeyDown(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    }

    function renderTabContent() {
        if (activeTab === "chat") {
          // The chat panel
          return (
            <div className="flex flex-col h-full">
              {/* Chat messages */}
              <div
                className="flex-1 overflow-y-auto mb-2"
                style={{
                  fontFamily: "Varela Round, sans-serif",
                  fontWeight: 400,
                  color: "#ccc",
                }}
              >
                {msgs.map((m, i) => (
                  <div key={i} style={{ margin: "5px 0" }}>
                    <strong>{m.userId}</strong>: {m.text}
                  </div>
                ))}
              </div>
              {/* Text input */}
              <div className="flex">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 mr-2 p-2 text-black"
                />
                <button
                  onClick={handleSend}
                  className="bg-gray-600 px-4 py-2 rounded-md"
                >
                  Send
                </button>
              </div>
            </div>
          )
        } else if (activeTab === "players") {
          // Show players
          return (
            <div>
              <h2 className="text-xl mb-2">Players in Lobby</h2>
              <ul className="space-y-2">
                {players.map((p) => (
                  <li key={p.user_id} className="flex items-center">
                    <img
                      src="/images/auth/guest.png"
                      alt="pfp"
                      className="w-8 h-8 mr-2"
                    />
                    <div>
                      <div className="font-semibold">{p.username}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        } else if (activeTab === "menu") {
          // Show some menu / leave button
          return (
            <div>
              <h2 className="text-xl font-semibold mb-4">Lobby Menu</h2>
              <button
                onClick={onLeaveLobby}
                className="bg-red-600 px-4 py-2 rounded-md"
              >
                Leave Lobby
              </button>
            </div>
          )
        }
      }
    
      return (
        <div className="flex flex-col w-full h-full bg-[#1f2430] text-white">
          {/* Tab headers */}
          <div className="flex items-center border-b border-gray-700">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-3 text-center ${
                activeTab === "chat" ? "bg-[#2d3445]" : ""
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("players")}
              className={`flex-1 py-3 text-center ${
                activeTab === "players" ? "bg-[#2d3445]" : ""
              }`}
            >
              Players
            </button>
            <button
              onClick={() => setActiveTab("menu")}
              className={`flex-1 py-3 text-center ${
                activeTab === "menu" ? "bg-[#2d3445]" : ""
              }`}
            >
              Menu
            </button>
          </div>
    
          {/* Main content area */}
          <div className="flex-1 p-4 overflow-y-auto">{renderTabContent()}</div>
        </div>
      )    
}

// // frontend/src/components/ui/chat.jsx

// import React, { useState, useEffect } from "react";
// import { socket } from "../../lib/socket";

// export default function Chat({ lobbyId, userId, players = [], onLeaveLobby = () => {} }) {
//   const [msgs, setMsgs] = useState([]);
//   const [inputVal, setInputVal] = useState("");
//   const [activeTab, setActiveTab] = useState("chat");

//   useEffect(() => {
//     if (!lobbyId) return;
//     console.log("Chat: joining lobby", lobbyId);

//     // The parent might do the actual join-lobby, but if we want to be safe:
//     socket.emit("join-lobby", { lobbyId });

//     // Listen for new chat messages
//     socket.on("chat-message", (data) => {
//       console.log("Chat: received chat-message =>", data);
//       setMsgs((prev) => [...prev, data]);
//     });

//     return () => {
//       console.log("Chat: leaving-lobby", lobbyId);
//       socket.emit("leave-lobby", { lobbyId });
//       socket.off("chat-message");
//     };
//   }, [lobbyId]);

//   function handleSend() {
//     if (!inputVal.trim()) return;
//     console.log("Chat: Emitting chat-message =>", {
//       lobbyId,
//       userId,
//       text: inputVal,
//     });
//     socket.emit("chat-message", {
//       lobbyId,
//       userId,
//       text: inputVal,
//     });
//     setInputVal("");
//   }

//   function handleKeyDown(e) {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       handleSend();
//     }
//   }

//   function renderTabContent() {
//     if (activeTab === "chat") {
//       // Main Chat Panel
//       return (
//         <div className="flex flex-col h-full">
//           {/* Messages container => scrollable */}
//           <div className="flex-1 overflow-y-auto p-2 text-sm bg-[#1f2430] text-white">
//             {msgs.map((m, i) => (
//               <div key={i} className="my-1">
//                 <strong>{m.userId}</strong>: {m.text}
//               </div>
//             ))}
//           </div>
//           {/* Input row */}
//           <div className="p-2 border-t border-gray-700 bg-[#1f2430] flex">
//             <input
//               type="text"
//               className="flex-1 mr-2 p-2 text-black"
//               placeholder="Type a message..."
//               value={inputVal}
//               onChange={(e) => setInputVal(e.target.value)}
//               onKeyDown={handleKeyDown} // Press Enter to send
//             />
//             <button
//               onClick={handleSend}
//               className="bg-gray-600 px-4 py-2 rounded-md"
//             >
//               Send
//             </button>
//           </div>
//         </div>
//       );
//     } else if (activeTab === "players") {
//       // Show Players
//       return (
//         <div className="p-2 bg-[#1f2430] text-white h-full">
//           <h2 className="text-xl mb-2">Players in Lobby</h2>
//           <ul className="space-y-2">
//             {players.map((p) => (
//               <li key={p.user_id} className="flex items-center">
//                 <img
//                   src="/images/auth/guest.png"
//                   alt="pfp"
//                   className="w-8 h-8 mr-2"
//                 />
//                 <div>
//                   <div className="font-semibold">{p.username}</div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       );
//     } else if (activeTab === "menu") {
//       // Additional menu or leave-lobby
//       return (
//         <div className="p-2 bg-[#1f2430] text-white h-full">
//           <h2 className="text-xl font-semibold mb-4">Lobby Menu</h2>
//           <button
//             onClick={onLeaveLobby}
//             className="bg-red-600 px-4 py-2 rounded-md"
//           >
//             Leave Lobby
//           </button>
//         </div>
//       );
//     }
//   }

//   return (
//     <div className="flex flex-col w-full h-full">
//       {/* Tab row */}
//       <div className="flex items-center border-b border-gray-700 bg-[#161b22]">
//         <button
//           onClick={() => setActiveTab("chat")}
//           className={`flex-1 py-3 text-center text-white ${
//             activeTab === "chat" ? "bg-[#2d3445]" : ""
//           }`}
//         >
//           Chat
//         </button>
//         <button
//           onClick={() => setActiveTab("players")}
//           className={`flex-1 py-3 text-center text-white ${
//             activeTab === "players" ? "bg-[#2d3445]" : ""
//           }`}
//         >
//           Players
//         </button>
//         <button
//           onClick={() => setActiveTab("menu")}
//           className={`flex-1 py-3 text-center text-white ${
//             activeTab === "menu" ? "bg-[#2d3445]" : ""
//           }`}
//         >
//           Menu
//         </button>
//       </div>

//       {/* Tab content */}
//       <div className="flex-1">{renderTabContent()}</div>
//     </div>
//   );
// }

// frontend/src/components/ui/chat.jsx

// import React, { useState, useEffect } from "react";
// import { socket } from "../../lib/socket";

// export default function Chat({ lobbyId, userId, players = [], onLeaveLobby }) {
//   const [msgs, setMsgs] = useState([]);
//   const [inputVal, setInputVal] = useState("");
//   const [activeTab, setActiveTab] = useState("chat");

//   useEffect(() => {
//     if (!lobbyId) return;

//     // We'll let the parent do the join-lobby if it wants
//     // or we can do it again here. But let's do a debug print:
//     console.log("Chat: Listening for chat-message in lobby:", lobbyId);

//     socket.on("chat-message", (data) => {
//       console.log("Chat: Received chat-message =>", data);
//       setMsgs((prev) => [...prev, data]);
//     });

//     return () => {
//       // Clean up
//       console.log("Chat: off chat-message");
//       socket.off("chat-message");
//     };
//   }, [lobbyId]);

//   function handleSend() {
//     if (!inputVal.trim()) return;
//     console.log("Chat: Emitting chat-message =>", {
//       lobbyId,
//       userId,
//       text: inputVal,
//     });
//     socket.emit("chat-message", {
//       lobbyId,
//       userId,
//       text: inputVal,
//     });
//     setInputVal("");
//   }

//   function handleKeyDown(e) {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       handleSend();
//     }
//   }

//   function renderTabContent() {
//     if (activeTab === "chat") {
//       return (
//         <div className="flex flex-col h-full">
//           {/* Messages container => scrollable */}
//           <div className="flex-1 overflow-y-auto p-2 text-sm bg-[#1f2430] text-white">
//             {msgs.map((m, i) => (
//               <div key={i} className="my-1">
//                 <strong>{m.userId}</strong>: {m.text}
//               </div>
//             ))}
//           </div>
//           {/* Input row */}
//           <div className="p-2 border-t border-gray-700 bg-[#1f2430] flex">
//             <input
//               type="text"
//               value={inputVal}
//               onChange={(e) => setInputVal(e.target.value)}
//               onKeyDown={handleKeyDown}
//               placeholder="Type a message..."
//               className="flex-1 mr-2 p-2 text-black"
//             />
//             <button
//               onClick={handleSend}
//               className="bg-gray-600 px-4 py-2 rounded-md"
//             >
//               Send
//             </button>
//           </div>
//         </div>
//       );
//     } else if (activeTab === "players") {
//       return (
//         <div className="p-2 bg-[#1f2430] text-white h-full">
//           <h2 className="text-xl mb-2">Players in Lobby</h2>
//           <ul className="space-y-2">
//             {players.map((p) => (
//               <li key={p.user_id} className="flex items-center">
//                 <img
//                   src="/images/auth/guest.png"
//                   alt="pfp"
//                   className="w-8 h-8 mr-2"
//                 />
//                 <div>
//                   <div className="font-semibold">{p.username}</div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       );
//     } else if (activeTab === "menu") {
//       return (
//         <div className="p-2 bg-[#1f2430] text-white h-full">
//           <h2 className="text-xl font-semibold mb-4">Lobby Menu</h2>
//           <button
//             onClick={onLeaveLobby}
//             className="bg-red-600 px-4 py-2 rounded-md"
//           >
//             Leave Lobby
//           </button>
//         </div>
//       );
//     }
//   }

//   return (
//     <div className="flex flex-col w-full h-full">
//       {/* Tab row */}
//       <div className="flex items-center border-b border-gray-700 bg-[#161b22]">
//         <button
//           onClick={() => setActiveTab("chat")}
//           className={`flex-1 py-3 text-center text-white ${
//             activeTab === "chat" ? "bg-[#2d3445]" : ""
//           }`}
//         >
//           Chat
//         </button>
//         <button
//           onClick={() => setActiveTab("players")}
//           className={`flex-1 py-3 text-center text-white ${
//             activeTab === "players" ? "bg-[#2d3445]" : ""
//           }`}
//         >
//           Players
//         </button>
//         <button
//           onClick={() => setActiveTab("menu")}
//           className={`flex-1 py-3 text-center text-white ${
//             activeTab === "menu" ? "bg-[#2d3445]" : ""
//           }`}
//         >
//           Menu
//         </button>
//       </div>
//       <div className="flex-1">{renderTabContent()}</div>
//     </div>
//   );
// }
