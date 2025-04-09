// frontend/src/pages/Leaderboard.jsx

import React from "react";
import { Card, CardContent } from "../components/ui/card";
import { socket } from "../lib/socket";
import Chat from "../components/ui/chat";

const StorePurchase = ({ points }) => (
  <div className="flex items-center justify-between w-full p-2 mb-2">
    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-gray-300">
      <span className="text-2xl">+</span>
    </div>
    <span className="text-sm font-medium">{points} points</span>
  </div>
);

const PlayerScore = ({ name, score }) => (
  <div className="flex justify-between items-center p-3 bg-gray-200 mb-1">
    <span className="font-medium">{name}</span>
    <span className="font-medium">{score} pts</span>
  </div>
);

export default function Leaderboard() {
  const players = [
    { name: "Player 1", score: 750 },
    { name: "Player 2", score: 650 },
    { name: "Player 3", score: 500 },
    { name: "Player 4", score: 450 },
    { name: "Player 5", score: 400 },
    { name: "Player 6", score: 350 },
  ];
  const storeItems = [{ points: 100 }, { points: 250 }, { points: 400 }];

  const lobbyId = localStorage.getItem("lobbyId") || "123";
  const userId = localStorage.getItem("myUserId") || "Guest";

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

      {/* MAIN content: centered store + board, with pr-[350px] for pinned chat */}
      <main className="pt-6 px-4 pr-[350px] flex flex-col items-center">
        <div className="w-full max-w-5xl flex gap-8">
          {/* Left: store */}
          <div className="w-1/4">
            <Card className="bg-gray-700 p-4">
              <h3 className="text-white text-lg font-bold mb-4 text-center">
                Store
              </h3>
              {storeItems.map((item, index) => (
                <StorePurchase key={index} points={item.points} />
              ))}
            </Card>
          </div>

          {/* Middle: leaderboard */}
          <div className="w-2/4">
            <Card>
              <CardContent>
                <h2 className="text-xl font-bold mb-4 text-center">
                  LEADERBOARD
                </h2>
                {players.map((player, i) => (
                  <PlayerScore
                    key={i}
                    name={player.name}
                    score={player.score}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* PINNED Chat: 350px on the right, below navbar => top=64px */}
      <div
        className="fixed bg-[#1f2430] border-l border-gray-700"
        style={{
          width: "350px",
          right: 0,
          top: "72px",
          height: "calc(100vh - 72px)",
        }}
      >
        <Chat lobbyId={lobbyId} userId={userId} />
      </div>
    </div>
  );
}
