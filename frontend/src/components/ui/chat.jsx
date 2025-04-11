// frontend/src/components/ui/chat.jsx

import React, { useState, useEffect } from "react";
import { socket } from "../../lib/socket";

export default function Chat({
  lobbyId,
  username, //
  players = [],
  onLeaveLobby = () => {},
}) {
  const [msgs, setMsgs] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [activeTab, setActiveTab] = useState("chat");

  useEffect(() => {
    if (!lobbyId) return;

    console.log("Chat: join-lobby =>", lobbyId);
    console.log(username);
    socket.emit("join-lobby", { lobbyId });

    socket.on("chat-message", (data) => {
      console.log("Chat: received chat-message =>", data);
      setMsgs((prev) => [...prev, data]);
    });

    return () => {
      console.log("Chat: leaving-lobby =>", lobbyId);
      socket.emit("leave-lobby", { lobbyId });
      socket.off("chat-message");
    };
  }, [lobbyId]);

  function handleSend() {
    if (!inputVal.trim()) return;
    console.log("Sending chat:", { lobbyId, username, text: inputVal });
    socket.emit("chat-message", {
      lobbyId,
      username,
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
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto mb-2 p-2 text-sm text-white">
            {msgs.map((m, i) => (
              <div key={i} className="my-1">
                <strong>{m.username}</strong>: {m.text}
                {console.log(m.username,i)}
              </div>
            ))}
          </div>
          <div className="flex p-2 border-t border-gray-700">
            <input
              type="text"
              className="flex-1 mr-2 p-2 text-black"
              placeholder="Type a message..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown} // Enter to send
            />
            <button
              onClick={handleSend}
              className="bg-gray-600 px-4 py-2 rounded-md"
            >
              Send
            </button>
          </div>
        </div>
      );
    } else if (activeTab === "players") {
      return (
        <div className="p-2">
          <h2 className="text-xl mb-2">Players in Lobby</h2>
          <ul className="space-y-2">
            {players.map((p) => (
              <li key={p.username} className="flex items-center">
                <img src="/images/auth/guest.png" alt="pfp" className="w-8 h-8 mr-2" />
                <div>
                  <div className="font-semibold">{p.username}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    } else if (activeTab === "menu") {
      return (
        <div className="p-2">
          <h2 className="text-xl font-semibold mb-4">Lobby Menu</h2>
          <button
            onClick={onLeaveLobby}
            className="bg-red-600 px-4 py-2 rounded-md"
          >
            Leave Lobby
          </button>
        </div>
      );
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
  );
}
