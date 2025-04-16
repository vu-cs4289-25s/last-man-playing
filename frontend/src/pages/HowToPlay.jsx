// frontend/src/pages/HowToPlay.jsx

import React from "react";
import Header from "../components/ui/Header";

export default function HowToPlay() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex flex-col flex-1 items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6">How to Play</h1>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Game Rules</h2>
            <p>
              Last Man Playing is a series of mini-games where players compete
              to be the last one standing.
            </p>
            <h2 className="text-xl font-semibold">Getting Started</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Create or join a lobby</li>
              <li>Wait for all players to join</li>
              <li>Start the game when everyone is ready</li>
              <li>Compete in various mini-games</li>
              <li>Be the last player standing to win!</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
