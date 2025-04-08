// import React, { useState, useEffect } from "react";
// import { socket } from "../../lib/socket";

// export default function Chat({lobbyId, userId, players = [], onLeaveLobby = () => {}}) {
//     const [msgs, setMsgs] = useState([]);
//     const [inputVal, setInputVal] = useState("");
//     const [activeTab, setActiveTab] = useState("chat");

//     useEffect(() => {
//         // if (!lobbyId) return;
//         // // connect
//         // //
//         // const newSocket = io('/', { path: '/socket.io'});
//         // setSocket(newSocket);

//         // // join lobby
//         // newSocket.emit("join-lobby", { lobbyId });

//         // // listen for chat msgs
//         // newSocket.on("chat-message", (data) => {
//         //     // msg for room -> local state
//         //     // if backend filters by room, no need to check lobby
//         //     setMsgs((prev) => [...prev, data]);
//         // })

//         // return () => {
//         //     // cleanup when leave lobby and close 
//         //     newSocket.emit("leave-lobby", {lobbyId});
//         //     newSocket.close();
//         // }
//         if (!lobbyId) return;
//         socket.emit("join-lobby", { lobbyId });
      
//         socket.on("chat-message", (data) => {
//           setMsgs((prev) => [...prev, data]);
//         });

//         return () => {
//           socket.emit("leave-lobby", { lobbyId });
//           // if you want to remain connected overall, you might not even close.
//           // socket.close(); // optional
//         }
//     }, [lobbyId]);

//     function handleSend(){
//         if (!inputVal.trim() || !socket) return;
//         socket.emit("chat-message", {
//             lobbyId,
//             userId,
//             text: inputVal,
//         });

//         setInputVal("");
//     }

//     function renderTabContent() {
//         if (activeTab === "chat") {
//           // The chat panel
//           return (
//             <div className="flex flex-col h-full">
//               {/* Chat messages */}
//               <div
//                 className="flex-1 overflow-y-auto mb-2"
//                 style={{
//                   fontFamily: "Varela Round, sans-serif",
//                   fontWeight: 400,
//                   color: "#ccc",
//                 }}
//               >
//                 {msgs.map((m, i) => (
//                   <div key={i} style={{ margin: "5px 0" }}>
//                     <strong>{m.userId}</strong>: {m.text}
//                   </div>
//                 ))}
//               </div>
//               {/* Text input */}
//               <div className="flex">
//                 <input
//                   type="text"
//                   value={inputVal}
//                   onChange={(e) => setInputVal(e.target.value)}
//                   placeholder="Type a message..."
//                   className="flex-1 mr-2 p-2 text-black"
//                 />
//                 <button
//                   onClick={handleSend}
//                   className="bg-gray-600 px-4 py-2 rounded-md"
//                 >
//                   Send
//                 </button>
//               </div>
//             </div>
//           )
//         } else if (activeTab === "players") {
//           // Show players
//           return (
//             <div>
//               <h2 className="text-xl mb-2">Players in Lobby</h2>
//               <ul className="space-y-2">
//                 {players.map((p) => (
//                   <li key={p.user_id} className="flex items-center">
//                     <img
//                       src="/images/auth/guest.png"
//                       alt="pfp"
//                       className="w-8 h-8 mr-2"
//                     />
//                     <div>
//                       <div className="font-semibold">{p.username}</div>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )
//         } else if (activeTab === "menu") {
//           // Show some menu / leave button
//           return (
//             <div>
//               <h2 className="text-xl font-semibold mb-4">Lobby Menu</h2>
//               <button
//                 onClick={onLeaveLobby}
//                 className="bg-red-600 px-4 py-2 rounded-md"
//               >
//                 Leave Lobby
//               </button>
//             </div>
//           )
//         }
//       }
    
//       return (
//         <div className="flex flex-col w-full h-full bg-[#1f2430] text-white">
//           {/* Tab headers */}
//           <div className="flex items-center border-b border-gray-700">
//             <button
//               onClick={() => setActiveTab("chat")}
//               className={`flex-1 py-3 text-center ${
//                 activeTab === "chat" ? "bg-[#2d3445]" : ""
//               }`}
//             >
//               Chat
//             </button>
//             <button
//               onClick={() => setActiveTab("players")}
//               className={`flex-1 py-3 text-center ${
//                 activeTab === "players" ? "bg-[#2d3445]" : ""
//               }`}
//             >
//               Players
//             </button>
//             <button
//               onClick={() => setActiveTab("menu")}
//               className={`flex-1 py-3 text-center ${
//                 activeTab === "menu" ? "bg-[#2d3445]" : ""
//               }`}
//             >
//               Menu
//             </button>
//           </div>
    
//           {/* Main content area */}
//           <div className="flex-1 p-4 overflow-y-auto">{renderTabContent()}</div>
//         </div>
//       )    
// }

