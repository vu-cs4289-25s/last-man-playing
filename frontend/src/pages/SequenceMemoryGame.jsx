import { useState, useEffect, useRef } from "react";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Label } from "../components/ui/label";
import { socket } from "../lib/socket";
import { useNavigate } from "react-router-dom";

const GAME_TIMER = 60;
const GRID_SIZE = 9;

export default function SequenceMemoryGame() {
  // ========== Basic Info ==========
  const myUserId = localStorage.getItem("myUserId") || "Guest";
  const gameId = localStorage.getItem("gameId");
  const roundId = localStorage.getItem("roundId");
  const lobbyLeaderId = localStorage.getItem("lobbyLeaderId");
  const lobbyId = localStorage.getItem("lobbyId");

  const navigate = useNavigate();

  // ========== State ==========
  const [timeLeft, setTimeLeft] = useState(GAME_TIMER);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [sequence, setSequence] = useState([]);
  const [displayIndex, setDisplayIndex] = useState(-1);
  const [isDisplayingSequence, setIsDisplayingSequence] = useState(false);
  const [userMoves, setUserMoves] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // [ADDED] A flag to track whether we’ve restored from storage yet
  const [initialized, setInitialized] = useState(false);

  // ========== Effects ==========

  // On mount, join the lobby room via socket
  useEffect(() => {
    if (lobbyId) {
      socket.emit("join-lobby", { lobbyId });
    }
  }, [lobbyId]);

  // [REMOVED] This old effect:
  // useEffect(() => {
  //   generateNewSequence(currentLevel);
  // }, []);

  // [ADDED] Load state from localStorage on mount
  useEffect(() => {
    const savedStateJSON = localStorage.getItem(`sequenceMemory_${roundId}_${myUserId}`);
    if (savedStateJSON) {
      try {
        const savedState = JSON.parse(savedStateJSON);

        setTimeLeft(savedState.timeLeft ?? GAME_TIMER);
        setCurrentLevel(savedState.currentLevel ?? 1);
        setSequence(savedState.sequence ?? []);
        setDisplayIndex(savedState.displayIndex ?? -1);
        setIsDisplayingSequence(savedState.isDisplayingSequence ?? false);
        setUserMoves(savedState.userMoves ?? []);
        setGameOver(savedState.gameOver ?? false);
        setFinalScore(savedState.finalScore ?? 0);

        // Mark that we have loaded from local storage
        setInitialized(true);
        return;
      } catch (err) {
        console.error("Failed to parse localStorage state:", err);
      }
    }

    // If no saved state, generate a new sequence for level 1
    generateNewSequence(1);
    setInitialized(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // [ADDED] Each time any relevant state changes, save it to localStorage
  useEffect(() => {
    // If we haven’t initialized, skip saving so we don’t overwrite a real saved state
    if (!initialized) return;

    const stateToSave = {
      timeLeft,
      currentLevel,
      sequence,
      displayIndex,
      isDisplayingSequence,
      userMoves,
      gameOver,
      finalScore,
    };
    localStorage.setItem(`sequenceMemory_${roundId}_${myUserId}`, JSON.stringify(stateToSave));
  }, [
    timeLeft,
    currentLevel,
    sequence,
    displayIndex,
    isDisplayingSequence,
    userMoves,
    gameOver,
    finalScore,
    initialized,
    roundId,
    myUserId,
  ]);

  // Each second, decrement timeLeft. When timeLeft hits 0 => game over
  useEffect(() => {
    if (!initialized) return; // Wait for load
    if (timeLeft <= 0 || gameOver) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, gameOver, initialized]);

  // If time runs out => gameOver with the current level - 1 as the final score
  useEffect(() => {
    if (!initialized) return;
    if (timeLeft <= 0 && !gameOver) {
      handleGameEnd(currentLevel - 1);
    }
  }, [timeLeft, gameOver, currentLevel, initialized]);

  // When the game ends => submit score, then possibly finalize if leader
  useEffect(() => {
    if (!initialized) return;
    if (gameOver) {
      submitScoreToServer(finalScore)
        .then(() => {
          if (myUserId === lobbyLeaderId) {
            finalizeRoundOnServer(finalScore)
              .then(() => navigate("/rps"))
              .catch((err) => console.error("Error finalizing round:", err));
          } else {
            console.log("Score submitted. Waiting for leader to finalize...");
          }
        })
        .catch((err) => {
          console.error("Error submitting score:", err);
        });
    }
  }, [gameOver, finalScore, myUserId, lobbyLeaderId, navigate, initialized]);

  // Listen for "round-finalized" from the socket
  useEffect(() => {
    if (!initialized) return;

    const handleRoundFinalized = () => {
      console.log("Received round-finalized event (SequenceGame). Navigating...");
      navigate("/rps");
    };
    socket.on("round-finalized", handleRoundFinalized);

    return () => {
      socket.off("round-finalized", handleRoundFinalized);
    };
  }, [navigate, initialized]);

  // ========== Core Game Logic Functions ==========

  function generateNewSequence(level) {
    const newSeq = [];
    for (let i = 0; i < level; i++) {
      const randomSquare = Math.floor(Math.random() * GRID_SIZE);
      newSeq.push(randomSquare);
    }
    setSequence(newSeq);
    setDisplayIndex(-1);
    setUserMoves([]);
    revealSequence(newSeq);
  }

  function revealSequence(seq) {
    setIsDisplayingSequence(true);
    let idx = 0;
    const revealInterval = setInterval(() => {
      setDisplayIndex(seq[idx]);
      idx++;

      setTimeout(() => setDisplayIndex(-1), 400);

      if (idx >= seq.length) {
        clearInterval(revealInterval);
        setTimeout(() => {
          setIsDisplayingSequence(false);
        }, 400);
      }
    }, 800);
  }

  function handleSquareClick(index) {
    if (!initialized) return;
    if (isDisplayingSequence || gameOver) return;

    const updatedMoves = [...userMoves, index];
    setUserMoves(updatedMoves);

    if (updatedMoves.length === sequence.length) {
      if (checkSequenceCorrect(updatedMoves, sequence)) {
        const nextLevel = currentLevel + 1;
        setCurrentLevel(nextLevel);
        generateNewSequence(nextLevel);
      } else {
        handleGameEnd(currentLevel - 1);
      }
    }
  }

  function checkSequenceCorrect(userMovesArr, sequenceArr) {
    if (userMovesArr.length !== sequenceArr.length) return false;
    for (let i = 0; i < sequenceArr.length; i++) {
      if (userMovesArr[i] !== sequenceArr[i]) return false;
    }
    return true;
  }

  function handleGameEnd(score) {
    setGameOver(true);
    setFinalScore(score);

    // Clear saved local state so refresh won't replay the ended game
    localStorage.removeItem(`sequenceMemory_${roundId}_${myUserId}`);
  }

  // ========== Scoring & Round Finalization ==========

  async function submitScoreToServer(score) {
    try {
      const res = await fetch(`api/games/${gameId}/round/${roundId}/submitScore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: myUserId,
          score: score,
        }),
      });
      if (!res.ok) {
        const msg = await res.json();
        throw new Error(
          msg.message || "submitScore endpoint failed (SequenceMemoryGame)"
        );
      }
      return res.json();
    } catch (error) {
      console.error("Failed to submit score:", error);
      throw new Error(`submitScoreToServer failed: ${error.message}`);
    }
  }

  async function finalizeRoundOnServer(score) {
    try {
      const res = await fetch(`api/games/${gameId}/round/${roundId}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: myUserId,
          score: score,
        }),
      });
      if (!res.ok) {
        const msg = await res.json();
        throw new Error(
          msg.message || "finalizeRound endpoint failed (SequenceMemoryGame)"
        );
      }
      return res.json();
    } catch (error) {
      console.error("Failed to finalize round:", error);
      throw new Error(`finalizeRoundOnServer failed: ${error.message}`);
    }
  }

  // ========== Render ==========

  const progressPercent = ((GAME_TIMER - timeLeft) / GAME_TIMER) * 100;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gray-100">
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-center">
        <h1 className="text-2xl font-bold tracking-wide text-center">
          LAST MAN PLAYING
        </h1>
      </header>

      <main className="flex flex-col items-center py-6 w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-4">Sequence Memory</h2>

        {gameOver ? (
          <div className="text-center my-4">
            <h3 className="text-xl font-bold mb-2">Game Over!</h3>
            <p>Your final score: {finalScore}</p>
            <p>Waiting for next round...</p>
          </div>
        ) : (
          <>
            <p className="mb-2">Level: {currentLevel}</p>

            <Card className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: GRID_SIZE }, (_, index) => (
                  <div
                    key={index}
                    onClick={() => handleSquareClick(index)}
                    className={`
                      w-16 h-16 
                      border border-gray-400
                      flex items-center justify-center
                      cursor-pointer
                      ${
                        displayIndex === index ? "bg-yellow-300" : "bg-white"
                      }
                    `}
                  />
                ))}
              </div>
            </Card>

            <div className="w-full mt-4">
              <Progress value={progressPercent} className="h-4" />
              <Label className="block text-center mt-2">
                Time Left: {timeLeft}s
              </Label>
            </div>

            <div className="text-center mt-4">
              {isDisplayingSequence
                ? "Wait while we show the sequence..."
                : "Click the squares in the same order we showed you!"}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
