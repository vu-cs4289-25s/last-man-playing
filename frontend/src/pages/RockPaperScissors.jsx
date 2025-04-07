// File: frontend/src/pages/RockPaperScissors.jsx
import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { socket } from "../lib/socket";
import { useNavigate } from "react-router-dom";

export default function RockPaperScissors() {
  const navigate = useNavigate();
  // We’ll track user’s ID and the lobby ID
  const [myUserId, setMyUserId] = useState("");
  const [lobbyId, setLobbyId] = useState("");

  // We track the last round’s moves and winner
  const [player1Id, setPlayer1Id] = useState(null);
  const [player1Move, setPlayer1Move] = useState(null);
  const [player2Id, setPlayer2Id] = useState(null);
  const [player2Move, setPlayer2Move] = useState(null);
  const [roundWinner, setRoundWinner] = useState(null);

  // Move emojis
  const moveEmoji = {
    rock: "✊",
    paper: "✋",
    scissors: "✌️",
  };

  useEffect(() => {
    // Grab stored user/lobby from localStorage
    const storedUserId = localStorage.getItem("myUserId");
    const storedLobbyId = localStorage.getItem("lobbyId");

    if (!storedUserId || !storedLobbyId) {
      alert("No user or lobby found. Returning to Lobbies.");
      navigate("/lobbies");
      return;
    }
    setMyUserId(storedUserId);
    setLobbyId(storedLobbyId);

    // Listen for rps-result from the server
    socket.on("rps-result", (data) => {
      // e.g. {player1Id, player1Move, player2Id, player2Move, winner}
      setPlayer1Id(data.player1Id);
      setPlayer1Move(data.player1Move);
      setPlayer2Id(data.player2Id);
      setPlayer2Move(data.player2Move);
      setRoundWinner(data.winner);
    });

    return () => {
      socket.off("rps-result");
    };
  }, [navigate]);

  const handleChoice = (move) => {
    if (!lobbyId || !myUserId) return;
    // Send my move to the server
    socket.emit("rps-move", {
      lobbyId,
      userId: myUserId,
      move, // "rock", "paper", or "scissors"
    });
  };

  // Helper to display the winner in text form
  const renderWinner = () => {
    if (!roundWinner) return null;
    if (roundWinner === "tie") return <p className="text-blue-600 font-bold">It’s a tie!</p>;
    if (roundWinner === myUserId) {
      return <p className="text-green-600 font-bold">You won!</p>;
    } else {
      return <p className="text-red-600 font-bold">{roundWinner} won!</p>;
    }
  };

  // If we know the other player's ID, show them
  const otherPlayerId =
    player1Id === myUserId ? player2Id : player1Id;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gray-100">
      {/* Header */}
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-center">
        <h1 className="text-2xl font-bold tracking-wide text-center">
          LAST MAN PLAYING
        </h1>
      </header>

      {/* Main Game Container */}
      <main className="flex-1 flex flex-col items-center py-6 w-full max-w-4xl">
        <Card className="w-full mb-6 p-4 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              Rock-Paper-Scissors (Multiplayer)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p>Your user ID: {myUserId}</p>
              <p>Opponent user ID: {otherPlayerId || "???"}</p>
            </div>

            {/* Last Round Moves */}
            {(player1Move || player2Move) && (
              <div className="text-center mb-4">
                <p>
                  <strong>{player1Id}</strong> chose{" "}
                  {player1Move ? moveEmoji[player1Move] : "?"} vs.{" "}
                  <strong>{player2Id}</strong> chose{" "}
                  {player2Move ? moveEmoji[player2Move] : "?"}
                </p>
                {renderWinner()}
              </div>
            )}

            {/* Move Buttons */}
            <div className="flex flex-row justify-center space-x-4 mb-4">
              <Button onClick={() => handleChoice("rock")}>✊ Rock</Button>
              <Button onClick={() => handleChoice("paper")}>✋ Paper</Button>
              <Button onClick={() => handleChoice("scissors")}>✌️ Scissors</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}