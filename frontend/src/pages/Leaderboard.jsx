// frontend/src/pages/Leaderboard.jsx

import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import Chat from "../components/ui/chat";
import Header from "../components/ui/Header";

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
  const [players, setPlayers] = useState([]);
  const lobbyId = localStorage.getItem("lobbyId") || "123";
  const userId = localStorage.getItem("myUserId") || "Guest";
  const gameId = localStorage.getItem("gameId");
  const roundId = localStorage.getItem("roundId");

  useEffect(() => {
    if (!gameId || !roundId) {
      console.warn("No gameId or roundId found, can't fetch leaderboard");
      return;
    }

    fetch(`/api/games/round/${roundId}/scores`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        const sorted = data.scores.sort((a, b) => b.score - a.score);
        // lazy way will fix later
        const playersMap = sorted.map((player) => ({
          name: player.username,
          score: player.score,
        }));
        setPlayers(playersMap);
        console.log(playersMap);
      })
      .catch((error) => {
        console.error(`Error fetching scores: ${error}`);
      });
  }, [gameId, roundId]);

  // const players = [
  //     { name: "Player 1", score: 750 },
  //     { name: "Player 2", score: 650 },
  //     { name: "Player 3", score: 500 },
  //     { name: "Player 4", score: 450 },
  //     { name: "Player 5", score: 400 },
  //     { name: "Player 6", score: 350 },
  // ];
  const storeItems = [{ points: 100 }, { points: 250 }, { points: 400 }];

  return (
    <div className="relative w-full min-h-screen bg-gray-100">
      <Header />

      {/* MAIN content: centered store + board, with pr-[350px] for pinned chat */}
      <main className="pt-6 px-4 pr-[350px] flex flex-col items-center">
        <div className="w-full max-w-5xl flex gap-8">
          {/* Middle: leaderboard */}
          <div className="w-3/4">
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
        <Chat
          lobbyId={lobbyId}
          username={localStorage.getItem("myUsername") || "Guest"}
        />
      </div>
    </div>
  );
}
