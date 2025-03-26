import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

export default function RockPaperScissors() {
  // State for target rounds (i.e. score needed to win); default is 3 rounds.
  const [targetRounds, setTargetRounds] = useState(3);

  // Score states
  const [userScore, setUserScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);

  // How many rounds have been played
  const [roundCount, setRoundCount] = useState(0);

  // Store round history as an array of objects
  const [roundHistory, setRoundHistory] = useState([]);

  // Current round info
  const [currentUserMove, setCurrentUserMove] = useState(null);
  const [currentCpuMove, setCurrentCpuMove] = useState(null);
  const [currentRoundWinner, setCurrentRoundWinner] = useState(null);

  // Game over state and final winner
  const [gameOver, setGameOver] = useState(false);
  const [finalWinner, setFinalWinner] = useState(null);

  // Mapping of moves to emojis
  const moveEmoji = {
    rock: "✊",
    paper: "✋",
    scissors: "✌️",
  };

  // Returns a random move from "rock", "paper", or "scissors"
  const getCpuMove = () => {
    const moves = ["rock", "paper", "scissors"];
    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
  };

  // Determines the round winner: returns "User", "CPU", or "Tie"
  const computeWinner = (userMove, cpuMove) => {
    if (userMove === cpuMove) return "Tie";
    if (
      (userMove === "rock" && cpuMove === "scissors") ||
      (userMove === "scissors" && cpuMove === "paper") ||
      (userMove === "paper" && cpuMove === "rock")
    ) {
      return "User";
    }
    return "CPU";
  };

  // Called when the user clicks one of the move buttons
  const handleUserChoice = (userMove) => {
    if (gameOver) return; // Do nothing if game is over

    const cpuMove = getCpuMove();
    const winner = computeWinner(userMove, cpuMove);

    // Update the score if there's a winner
    if (winner === "User") setUserScore((prev) => prev + 1);
    else if (winner === "CPU") setCpuScore((prev) => prev + 1);

    // Increment the round count and save round details
    const newRoundCount = roundCount + 1;
    setRoundCount(newRoundCount);
    setCurrentUserMove(userMove);
    setCurrentCpuMove(cpuMove);
    setCurrentRoundWinner(winner);

    const newRound = {
      round: newRoundCount,
      userMove,
      cpuMove,
      winner,
    };
    setRoundHistory((prev) => [...prev, newRound]);

    // Check if either side has reached the target rounds
    if (winner === "User" && userScore + 1 >= targetRounds) {
      setGameOver(true);
      setFinalWinner("User");
    } else if (winner === "CPU" && cpuScore + 1 >= targetRounds) {
      setGameOver(true);
      setFinalWinner("CPU");
    }
  };

  // Resets the entire game state
  const handleReset = () => {
    setTargetRounds(3);
    setUserScore(0);
    setCpuScore(0);
    setRoundCount(0);
    setRoundHistory([]);
    setCurrentUserMove(null);
    setCurrentCpuMove(null);
    setCurrentRoundWinner(null);
    setGameOver(false);
    setFinalWinner(null);
  };

  // Called when the user changes the game mode (1, 3, or 5 rounds)
  const handleTargetChange = (e) => {
    const rounds = parseInt(e.target.value, 10);
    handleReset(); // Reset game state when mode is changed
    setTargetRounds(rounds);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gray-100">
      {/* Header */}
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-center">
        <h1 className="text-2xl font-bold tracking-wide text-center">LAST MAN PLAYING</h1>
      </header>

      {/* Main Game Container */}
      <main className="flex-1 flex flex-col items-center py-6 w-full max-w-4xl">
        {/* Game Settings & Current Status */}
        <Card className="w-full mb-6 p-4 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Rock-Paper-Scissors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-center">
              <label className="mr-2 font-medium">Select Rounds to Win:</label>
              <select
                value={targetRounds}
                onChange={handleTargetChange}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value={1}>1 Round</option>
                <option value={3}>3 Rounds</option>
                <option value={5}>5 Rounds</option>
              </select>
            </div>

            <div className="mb-4 text-center">
              <span className="mr-4 font-semibold">Your Score: {userScore}</span>
              <span className="font-semibold">CPU Score: {cpuScore}</span>
            </div>

            {/* Display current round result if any round has been played */}
            {roundCount > 0 && (
              <div className="text-center mb-4">
                <p className="font-semibold">
                  Round {roundCount}: You chose <span>{moveEmoji[currentUserMove]}</span> vs. CPU chose <span>{moveEmoji[currentCpuMove]}</span>
                </p>
                {currentRoundWinner === "Tie" ? (
                  <p className="text-blue-600 font-bold">It's a Tie!</p>
                ) : currentRoundWinner === "User" ? (
                  <p className="text-green-600 font-bold">You won this round!</p>
                ) : (
                  <p className="text-red-600 font-bold">CPU won this round!</p>
                )}
              </div>
            )}

            {/* Move Buttons */}
            <div className="flex flex-row justify-center space-x-4 mb-4">
              <Button onClick={() => handleUserChoice("rock")}>
                ✊ Rock
              </Button>
              <Button onClick={() => handleUserChoice("paper")}>
                ✋ Paper
              </Button>
              <Button onClick={() => handleUserChoice("scissors")}>
                ✌️ Scissors
              </Button>
            </div>

            {/* Final Game Over Message */}
            {gameOver && (
              <div className="text-center mb-4">
                <p className="text-2xl font-bold">
                  {finalWinner === "User" ? "🎉 You won the game!" : "😢 CPU won the game!"}
                </p>
              </div>
            )}

            {/* Reset Game Button */}
            <div className="flex justify-center">
              <Button onClick={handleReset} className="bg-gray-200 text-gray-700 hover:bg-gray-300">
                Reset Game
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Round History */}
        {roundHistory.length > 0 && (
          <Card className="w-full p-4 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-center">Round History</CardTitle>
            </CardHeader>
            <CardContent>
              {roundHistory.map((roundItem) => (
                <div key={roundItem.round} className="flex justify-around items-center border-b py-2">
                  <span>Round {roundItem.round}</span>
                  <span>You: {moveEmoji[roundItem.userMove]}</span>
                  <span>CPU: {moveEmoji[roundItem.cpuMove]}</span>
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