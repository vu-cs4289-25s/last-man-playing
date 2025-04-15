// frontend/src/pages/Leaderboard.jsx

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import Header from "../components/ui/header";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
// import { Button } from "../components/ui/button";

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
  const [gameResults, setGameResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get game results from localStorage
    const results = localStorage.getItem("gameResults");
    if (results) {
      const parsedResults = JSON.parse(results);
      console.log("Loaded game results:", parsedResults); // Add logging
      setGameResults(parsedResults);
      // Clear the results from localStorage
      localStorage.removeItem("gameResults");
    }
  }, []);

  // Mock store items
  const storeItems = [{ points: 100 }, { points: 250 }, { points: 400 }];

  const handlePlayAgain = () => {
    navigate("/lobbies");
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gray-100">
      <Header />

      {/* Main Content */}
      <main className="flex justify-center w-full max-w-5xl mt-8 px-4">
        <div className="flex w-full gap-8">
          {/* Store Section */}
          <div className="w-1/4">
            <h2 className="text-xl font-bold mb-4">ELIMINATED</h2>
            <Card className="bg-gray-700 p-4">
              <h3 className="text-white text-lg font-bold mb-4 text-center">
                Store
              </h3>
              {storeItems.map((item, index) => (
                <StorePurchase key={index} points={item.points} />
              ))}
            </Card>
          </div>

          {/* Leaderboard Section */}
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

          {/* Empty Space for Game Area */}
          <div className="w-1/4 bg-gray-900 rounded-lg"></div>
        </div>
      </main>
    </div>
  );
}
