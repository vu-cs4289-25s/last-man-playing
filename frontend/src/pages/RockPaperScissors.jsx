import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

/**
 * Single-player Rock-Paper-Scissors vs. a CPU opponent.
 * 
 * How it works:
 * 1. User clicks on "Rock," "Paper," or "Scissors."
 * 2. CPU randomly picks one of the three.
 * 3. Winner is determined.
 * 4. The result is stored in local state to show a round history.
 * 
 * We'll store up to X rounds in a local array: [ { round: 1, userMove: 'rock', cpuMove: 'paper', winner: 'CPU' }, ... ]
 */

export default function RockPaperScissors() {
  // Track how many rounds have been played
  const [roundCount, setRoundCount] = useState(0);

  // Track the round history as an array of objects
  const [roundHistory, setRoundHistory] = useState([]);

  // For showing current round’s result at the top
  const [currentWinner, setCurrentWinner] = useState(null);
  const [currentUserMove, setCurrentUserMove] = useState(null);
  const [currentCpuMove, setCurrentCpuMove] = useState(null);

  // Function for user picking Rock / Paper / Scissors
  const handleUserChoice = (userMove) => {
    const cpuMove = getCpuMove();
    const winner = computeWinner(userMove, cpuMove);

    // Update local states
    setRoundCount((prev) => prev + 1);
    setCurrentUserMove(userMove);
    setCurrentCpuMove(cpuMove);
    setCurrentWinner(winner);

    // Add the round result to the history array
    const newRound = {
      round: roundCount + 1,
      userMove,
      cpuMove,
      winner,
    };
    setRoundHistory((prevHistory) => [...prevHistory, newRound]);
  };

  // Randomly returns 'rock', 'paper', or 'scissors'
  const getCpuMove = () => {
    const moves = ["rock", "paper", "scissors"];
    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
  };

  // Simple RPS winner logic
  // returns 'User', 'CPU', or 'Tie'
  const computeWinner = (userMove, cpuMove) => {
    if (userMove === cpuMove) {
      return "Tie";
    }
    if (
      (userMove === "rock" && cpuMove === "scissors") ||
      (userMove === "scissors" && cpuMove === "paper") ||
      (userMove === "paper" && cpuMove === "rock")
    ) {
      return "User";
    } else {
      return "CPU";
    }
  };

  // Reset the game state
  const handleReset = () => {
    setRoundCount(0);
    setRoundHistory([]);
    setCurrentWinner(null);
    setCurrentUserMove(null);
    setCurrentCpuMove(null);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gray-100">
      {/* Header */}
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-center">
        <h1 className="text-2xl font-bold tracking-wide text-center">LAST MAN PLAYING</h1>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center py-6 w-full max-w-4xl">
        {/* Title Card */}
        <Card className="w-full mb-6 p-4 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Rock-Paper-Scissors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-700 mb-2">
              Single-player vs CPU. Pick your move below:
            </p>

            {/* Current Round Status */}
            {currentWinner && (
              <div className="text-center mb-4">
                <p className="font-semibold">
                  Round #{roundCount} – You chose <b>{currentUserMove}</b>, CPU chose <b>{currentCpuMove}</b>.
                </p>
                {currentWinner === "Tie" ? (
                  <p className="text-blue-600 font-bold">It's a tie!</p>
                ) : currentWinner === "User" ? (
                  <p className="text-green-600 font-bold">You win!</p>
                ) : (
                  <p className="text-red-600 font-bold">CPU wins!</p>
                )}
              </div>
            )}

            {/* Game Action Buttons */}
            <div className="flex flex-row justify-center space-x-4 mb-4">
              <Button onClick={() => handleUserChoice("rock")}>Rock</Button>
              <Button onClick={() => handleUserChoice("paper")}>Paper</Button>
              <Button onClick={() => handleUserChoice("scissors")}>Scissors</Button>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleReset}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Reset Game
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Round History Card */}
        {roundHistory.length > 0 && (
          <Card className="w-full p-4 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-center">Round History</CardTitle>
            </CardHeader>
            <CardContent>
              {roundHistory.map((roundItem) => (
                <div
                  key={roundItem.round}
                  className="flex justify-around items-center border-b py-2"
                >
                  <span>Round {roundItem.round}</span>
                  <span>You: {roundItem.userMove}</span>
                  <span>CPU: {roundItem.cpuMove}</span>
                  {roundItem.winner === "Tie" ? (
                    <span className="text-blue-600 font-bold">Tie</span>
                  ) : roundItem.winner === "User" ? (
                    <span className="text-green-600 font-bold">You Won</span>
                  ) : (
                    <span className="text-red-600 font-bold">CPU Won</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}