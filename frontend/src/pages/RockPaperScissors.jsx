import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

export default function RockPaperScissors() {
  // State for target rounds (i.e. wins required); default is 3.
  const [targetRounds, setTargetRounds] = useState(3);

  // Score state
  const [userScore, setUserScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);

  // Number of rounds played so far
  const [roundCount, setRoundCount] = useState(0);

  // History for each round (for review)
  const [roundHistory, setRoundHistory] = useState([]);

  // Current round move states
  const [currentUserMove, setCurrentUserMove] = useState(null);
  const [currentCpuMove, setCurrentCpuMove] = useState(null);
  const [currentRoundWinner, setCurrentRoundWinner] = useState(null);

  // Game over state and final winner
  const [gameOver, setGameOver] = useState(false);
  const [finalWinner, setFinalWinner] = useState(null);

  // This state determines if we're in the "revealing" (or thinking) phase.
  const [isRevealing, setIsRevealing] = useState(false);

  // Mapping moves to emojis for a fun display
  const moveEmoji = {
    rock: "✊",
    paper: "✋",
    scissors: "✌️",
  };

  // Returns a random move for the CPU.
  const getCpuMove = () => {
    const moves = ["rock", "paper", "scissors"];
    return moves[Math.floor(Math.random() * moves.length)];
  };

  // Simple winner logic: returns "User", "CPU", or "Tie"
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

  // Called when the user clicks a move.
  const handleUserChoice = (userMove) => {
    if (gameOver || isRevealing) return; // Prevent multiple clicks or moves after game over

    // Immediately set the user's move.
    setCurrentUserMove(userMove);
    // Clear the CPU move (we'll show a placeholder meanwhile).
    setCurrentCpuMove(null);
    setCurrentRoundWinner(null);
    setIsRevealing(true);

    // Wait 3 seconds to simulate the CPU "thinking" with an animation.
    setTimeout(() => {
      const cpuMove = getCpuMove();
      const winner = computeWinner(userMove, cpuMove);

      // Update scores.
      if (winner === "User") setUserScore((prev) => prev + 1);
      else if (winner === "CPU") setCpuScore((prev) => prev + 1);

      const newRoundCount = roundCount + 1;
      setRoundCount(newRoundCount);
      setCurrentCpuMove(cpuMove);
      setCurrentRoundWinner(winner);
      setIsRevealing(false);

      // Save the round details.
      const newRound = {
        round: newRoundCount,
        userMove,
        cpuMove,
        winner,
      };
      setRoundHistory((prev) => [...prev, newRound]);

      // Check for game over (if either score reaches the target)
      if (winner === "User" && userScore + 1 >= targetRounds) {
        setGameOver(true);
        setFinalWinner("User");
      } else if (winner === "CPU" && cpuScore + 1 >= targetRounds) {
        setGameOver(true);
        setFinalWinner("CPU");
      }
    }, 3000);
  };

  // Resets the entire game state.
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
    setIsRevealing(false);
  };

  // When user changes the target (1, 3, or 5 rounds), reset the game.
  const handleTargetChange = (e) => {
    const rounds = parseInt(e.target.value, 10);
    handleReset();
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
        <Card className="w-full mb-6 p-4 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Rock-Paper-Scissors</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Game Mode Selection */}
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

            {/* Score Display */}
            <div className="mb-4 text-center">
              <span className="mr-4 font-semibold">Your Score: {userScore}</span>
              <span className="font-semibold">CPU Score: {cpuScore}</span>
            </div>

            {/* Current Round Display with Animation */}
            <div className="mb-4 text-center flex justify-around items-center">
              {/* User move area */}
              <div className={`text-4xl ${isRevealing ? "shake" : ""}`}>
                {currentUserMove ? moveEmoji[currentUserMove] : "❔"}
              </div>
              <div className="text-2xl mx-4">vs.</div>
              {/* CPU move area */}
              <div className={`text-4xl ${isRevealing ? "shake" : ""}`}>
                {currentCpuMove ? moveEmoji[currentCpuMove] : (isRevealing ? "❔" : "🤖")}
              </div>
            </div>

            {/* Round Result Message */}
            {roundCount > 0 && !isRevealing && (
              <div className="text-center mb-4">
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
              <Button onClick={() => handleUserChoice("rock")} disabled={isRevealing || gameOver}>
                ✊ Rock
              </Button>
              <Button onClick={() => handleUserChoice("paper")} disabled={isRevealing || gameOver}>
                ✋ Paper
              </Button>
              <Button onClick={() => handleUserChoice("scissors")} disabled={isRevealing || gameOver}>
                ✌️ Scissors
              </Button>
            </div>

            {/* Game Over Message */}
            {gameOver && (
              <div className="text-center mb-4">
                <p className="text-2xl font-bold">
                  {finalWinner === "User" ? "🎉 You won the game!" : "😢 CPU won the game!"}
                </p>
              </div>
            )}

            {/* Reset Button */}
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