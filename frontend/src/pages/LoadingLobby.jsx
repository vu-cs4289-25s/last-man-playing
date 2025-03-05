// frontend/src/pages/LoadingLobby.jsx

import React, { useState } from "react";
import { Card } from "../components/ui/card";

const PlayerCard = ({ username, isLoading, style, isReady = false }) => (
  <div
    style={style}
    className={`absolute bg-[#0D1117] text-white rounded-md px-4 py-2 flex items-center space-x-2 w-48 transform -translate-x-1/2 -translate-y-1/2
    ${isLoading ? "opacity-70" : ""} ${
      isReady ? "border-2 border-green-500" : ""
    }`}
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

export default function LoadingLobby() {
  const [isAllPlayersReady, setIsAllPlayersReady] = useState(false);

  const calculatePosition = (index, total, radius) => {
    const angleInDegrees = 270 + (360 / total) * index;
    const angleInRadians = angleInDegrees * (Math.PI / 180);
    return {
      left: `${50 + radius * Math.cos(angleInRadians)}%`,
      top: `${50 + radius * Math.sin(angleInRadians)}%`,
    };
  };

  // Mock player data with different states
  const mockPlayers = [
    {
      id: 1,
      username: "DragonSlayer",
      isReady: true,
      isLoading: false,
    },
    {
      id: 2,
      username: "PixelPirate",
      isReady: true,
      isLoading: false,
    },
    {
      id: 3,
      username: "NinjaGamer",
      isReady: false,
      isLoading: true,
    },
    {
      id: 4,
      username: "CosmicWarrior",
      isReady: false,
      isLoading: true,
    },
    {
      id: 5,
      username: "MysticMage",
      isReady: false,
      isLoading: false,
    },
    {
      id: 6,
      username: "CyberKnight",
      isReady: false,
      isLoading: true,
    },
  ];

  // Add positions to players
  const players = mockPlayers.map((player, index) => ({
    ...player,
    position: calculatePosition(index, mockPlayers.length, 35),
  }));

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gray-100">
      {/* Header */}
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">LAST MAN PLAYING</h1>
        <img
          src="/api/placeholder/40/40"
          alt="Profile"
          className="w-10 h-10 rounded-full border-2 border-gray-500"
        />
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl px-4">
        <h2 className="text-2xl font-bold mb-8">
          {isAllPlayersReady ? "PLAYERS READY" : "PLAYERS LOADING..."}
        </h2>

        {/* Lobby Container */}
        <div className="relative w-full aspect-square max-w-2xl">
          {/* Center Content */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <h3 className="text-xl font-bold mb-2">GAME LOBBY #1</h3>
            {isAllPlayersReady ? (
              <button className="bg-red-500 text-white px-6 py-2 rounded-md font-medium">
                READY
              </button>
            ) : (
              <div className="bg-gray-400 text-white px-6 py-2 rounded-md font-medium flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Loading</span>
              </div>
            )}
          </div>

          {/* Player Cards - Positioned in Circle */}
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              username={player.username}
              isLoading={player.isLoading}
              isReady={player.isReady}
              style={player.position}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
