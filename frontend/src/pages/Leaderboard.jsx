// frontend/src/pages/Leaderboard.jsx

import { useEffect, useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import Header from "../components/ui/header";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import Chat from "../components/ui/chat";

const StorePurchase = ({ points }) => (
  <div className="flex items-center justify-between w-full p-2 mb-2">
    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-gray-300">
      <span className="text-2xl">+</span>
    </div>
    <span className="text-sm font-medium">{points} points</span>
  </div>
);

const PlayerScore = ({ name, score, position }) => (
  <div className="flex justify-between items-center p-3 bg-gray-200 mb-1">
    <div className="flex items-center space-x-2">
      <span className="font-bold text-lg">{position}.</span>
      <span className="font-medium">{name}</span>
    </div>
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
      console.warn("No gameId or roundId found, can’t fetch leaderboard");
      return;
    }

    fetch(`/api/games/round/${roundId}/scores`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        const sorted = data.scores.sort((a, b) => b.score - a.score);
        // lazy way will fix later
        const playersMap = sorted.map((player) => ({
          name: player.user_id,
          score: player.score,
        }));
        setPlayers(playersMap);
        console.log(playersMap);
      })
      .catch((error) => {
        console.error(`Error fetching scores: ${error}`);
      });
  }, [gameId, roundId]);

  const storeItems = [{ points: 100 }, { points: 250 }, { points: 400 }];

  const handlePlayAgain = () => {
    navigate("/lobbies");
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gray-100">
      <Header />

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
          <div className="w-2/4 mx-auto">
            <Card>
              <CardContent>
                <h2 className="text-xl font-bold mb-4 text-center">
                  {gameResults ? "GAME RESULTS" : "LEADERBOARD"}
                </h2>
                {gameResults ? (
                  <>
                    {gameResults.players.map((player, index) => (
                      <PlayerScore
                        key={player.userId}
                        name={player.username}
                        score={player.score || 0}
                        position={player.finalPosition || index + 1}
                      />
                    ))}
                    <div className="mt-4 flex justify-center">
                      <Button onClick={handlePlayAgain}>Play Again</Button>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-gray-500">
                    No recent game results. Play a game to see your score!
                  </p>
                )}
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
