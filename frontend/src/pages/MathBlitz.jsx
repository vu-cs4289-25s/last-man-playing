import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { socket } from "../lib/socket";
import Header from "../components/ui/header";
import { useNavigate } from "react-router-dom";

const MathBlitz = () => {
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [question, setQuestion] = useState({ num1: 0, num2: 0 });
  const [answer, setAnswer] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(10);
  const [gameStarted, setGameStarted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const lobbyId = localStorage.getItem("lobbyId");
    const myUserId = localStorage.getItem("myUserId");

    if (!lobbyId || !myUserId) {
      console.error("Missing lobby ID or user ID");
      navigate("/lobbies");
      return;
    }

    socket.on("game-started", (data) => {
      console.log("Received game-started event:", data);
      if (data.players) {
        setPlayers(data.players);
        setGameStarted(true);
        generateQuestion();
        startTimer();
      }
    });

    socket.on("updatePlayers", (updatedPlayers) => {
      console.log("Received updatePlayers event:", updatedPlayers);
      setPlayers(updatedPlayers);
    });

    socket.on("gameOver", (winner) => {
      console.log("Received gameOver event:", winner);
      setGameOver(true);
      setPlayers(Array.isArray(winner) ? winner : [winner]);
    });

    socket.on("nextTurn", (nextPlayerIndex) => {
      console.log("Received nextTurn event:", nextPlayerIndex);
      setCurrentPlayerIndex(nextPlayerIndex);
      generateQuestion();
      startTimer();
    });

    return () => {
      socket.off("game-started");
      socket.off("updatePlayers");
      socket.off("gameOver");
      socket.off("nextTurn");
    };
  }, [navigate]);

  useEffect(() => {
    if (timer === 0) {
      handleAnswer();
    }
  }, [timer]);

  const startTimer = () => {
    console.log("Starting timer");
    setTimer(10);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(interval);
        }
        return prev - 1;
      });
    }, 1000);
  };

  const generateQuestion = () => {
    console.log("Generating new question");
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setQuestion({ num1, num2 });
  };

  const handleAnswer = () => {
    const correctAnswer = question.num1 * question.num2;
    if (parseInt(answer) !== correctAnswer) {
      socket.emit("wrongAnswer", currentPlayerIndex);
    } else {
      socket.emit("correctAnswer", currentPlayerIndex);
    }
    setAnswer("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAnswer();
    }
  };

  const calculatePosition = (index, total, radius) => {
    const angleInDegrees = (360 / total) * index;
    const angleInRadians = angleInDegrees * (Math.PI / 180);
    return {
      left: `${50 + radius * Math.cos(angleInRadians)}%`,
      top: `${50 + radius * Math.sin(angleInRadians)}%`,
      transform: "translate(-50%, -50%)",
    };
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <Header />
      {!gameStarted ? (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to Math Blitz!</h1>
          <p className="mb-4">Waiting for game to start...</p>
          <p className="mb-4">Number of Players: {players.length}</p>
        </div>
      ) : gameOver ? (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold">Winner: {players[0].name}</h2>
          <Button onClick={() => window.location.reload()} className="mt-2">
            Play Again
          </Button>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-4">Math Blitz</h1>
          <div className="relative w-full aspect-square max-w-2xl flex items-center justify-center">
            <div className="relative w-80 h-80 rounded-full border border-gray-400 flex items-center justify-center">
              {players.map((player, index) => {
                const position = calculatePosition(index, players.length, 40);
                return (
                  <div
                    key={player.id}
                    style={position}
                    className={`absolute bg-[#0D1117] text-white rounded-md px-4 py-2 flex items-center space-x-2 w-48 transform -translate-x-1/2 -translate-y-1/2`}
                  >
                    <img
                      src="/api/placeholder/24/24"
                      alt="Player avatar"
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="font-medium">
                      {player.name} ({player.lives} lives)
                    </span>
                  </div>
                );
              })}
              <div
                style={calculatePosition(
                  currentPlayerIndex,
                  players.length,
                  50
                )}
                className="absolute bg-white p-4 rounded-lg shadow-lg text-center"
              >
                <h2 className="text-xl font-bold">
                  {question.num1} × {question.num2}?
                </h2>
                <input
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="border p-2 mt-2"
                />
                <Button onClick={handleAnswer} className="mt-2">
                  Submit
                </Button>
                <div className="text-sm text-gray-500 mt-2">
                  Time left: {timer}s
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MathBlitz;
