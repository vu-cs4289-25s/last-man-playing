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
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [previousAnswer, setPreviousAnswer] = useState(null);
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

    // Listen for game start
    socket.on("game-started", (data) => {
      console.log("Game started event received:", data);
      if (data.players && Array.isArray(data.players)) {
        setPlayers(data.players);
        setCurrentPlayerIndex(data.currentPlayerIndex || 0);
        setQuestion(data.question || { num1: 0, num2: 0 });
        setGameStarted(true);
        setIsMyTurn(
          data.players[data.currentPlayerIndex || 0]?.userId === myUserId
        );
        startTimer();
      }
    });

    // Listen for next turn
    socket.on("next-turn", (data) => {
      if (data.players && Array.isArray(data.players)) {
        setPlayers(data.players);
        setCurrentPlayerIndex(data.currentPlayerIndex || 0);
        setQuestion(data.question || { num1: 0, num2: 0 });
        setPreviousAnswer(data.previousAnswer || null);
        setIsMyTurn(
          data.players[data.currentPlayerIndex || 0]?.userId === myUserId
        );
        setAnswer("");
        startTimer();
      }
    });

    // Listen for game over
    socket.on("game-over", (data) => {
      console.log("Game over event received:", data);
      if (data.winner) {
        setGameOver(true);
        setPlayers(data.players);
        // Store the game results in localStorage
        localStorage.setItem(
          "gameResults",
          JSON.stringify({
            players: data.players,
            timestamp: new Date().toISOString(),
          })
        );
        // Navigate to leaderboard after a short delay
        setTimeout(() => {
          navigate("/leaderboard");
        }, 3000);
      }
    });

    // Check if we're already in a game
    socket.emit("check-game-status", { lobbyId });

    socket.on("game-status", (data) => {
      if (data.gameStarted && data.players && Array.isArray(data.players)) {
        setGameStarted(true);
        setPlayers(data.players);
        setCurrentPlayerIndex(data.currentPlayerIndex || 0);
        setQuestion(data.question || { num1: 0, num2: 0 });
        setIsMyTurn(
          data.players[data.currentPlayerIndex || 0]?.userId === myUserId
        );
        startTimer();
      }
    });

    return () => {
      socket.off("game-started");
      socket.off("next-turn");
      socket.off("game-over");
      socket.off("game-status");
    };
  }, [navigate]);

  useEffect(() => {
    if (timer === 0 && isMyTurn) {
      handleTimeOut();
    }
  }, [timer]);

  const startTimer = () => {
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

  const handleAnswer = () => {
    if (!isMyTurn) return;

    const lobbyId = localStorage.getItem("lobbyId");
    socket.emit("submit-answer", { lobbyId, answer });
  };

  const handleTimeOut = () => {
    const lobbyId = localStorage.getItem("lobbyId");
    socket.emit("time-out", { lobbyId });
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
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gray-100">
      <Header />
      {!gameStarted ? (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-bold mb-4">
            Waiting for game to start...
          </h1>
          <p className="text-gray-600">Players in game: {players.length}</p>
        </div>
      ) : gameOver ? (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold">Winner: {players[0]?.username}</h2>
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
                    key={player.userId}
                    style={position}
                    className={`absolute bg-[#0D1117] text-white rounded-md px-4 py-2 flex items-center space-x-2 w-48 transform -translate-x-1/2 -translate-y-1/2`}
                  >
                    <img
                      src={player.profilePic || "https://placekitten.com/40/40"}
                      alt="Player avatar"
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="font-medium">
                      {player.username} ({player.lives} lives)
                    </span>
                  </div>
                );
              })}
              {players.length > 0 && (
                <div
                  style={calculatePosition(
                    currentPlayerIndex,
                    players.length,
                    50
                  )}
                  className="absolute bg-white p-4 rounded-lg shadow-lg text-center"
                >
                  <h2 className="text-xl font-bold">
                    {question?.num1} × {question?.num2}?
                  </h2>
                  {isMyTurn ? (
                    <>
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
                    </>
                  ) : (
                    <div className="text-gray-500 mt-2">
                      Waiting for {players[currentPlayerIndex]?.username}'s turn
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {previousAnswer && (
            <div className="mt-4 text-center">
              <p className="text-lg">
                Previous answer: {previousAnswer.correct ? "Correct" : "Wrong"}{" "}
                ({previousAnswer.answer})
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MathBlitz;
