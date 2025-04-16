import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { Label } from "../components/ui/label";
import { socket } from "../lib/socket";
import { useNavigate } from "react-router-dom";
import Header from "../components/ui/Header";

const GAME_TIMER = 10;

export default function TypingGame() {
  const textToType =
    "This is a sample text for the typing game. Type as fast and accurately as you can. Good luck and have fun!";

  const navigate = useNavigate();

  // State for the user's input and timer.
  const [typedText, setTypedText] = useState("");
  const [timeLeft, setTimeLeft] = useState(GAME_TIMER);

  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const myUserId = localStorage.getItem("myUserId") || "Guest";
  const gameId = localStorage.getItem("gameId");
  const roundId = localStorage.getItem("roundId");
  const lobbyLeaderId = localStorage.getItem("lobbyLeaderId");

  useEffect(() => {
    console.log(gameId, roundId);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });

  useEffect(() => {
    const lobbyId = localStorage.getItem("lobbyId");
    if (lobbyId) {
      socket.emit("join-lobby", { lobbyId });
    }
  });

  useEffect(() => {
    if (timeLeft <= 0) {
      // Time's up => calculate WPM, accuracy, etc.
      const correctCount = textToType.split("").reduce((acc, char, index) => {
        return acc + (typedText[index] === char ? 1 : 0);
      }, 0);
      const accuracy =
        typedText.length > 0 ? (correctCount / typedText.length) * 100 : 0;
      const wpm = Math.round(correctCount / 5) * (60 / GAME_TIMER);

      console.log("Time's up!");
      console.log("WPM:", wpm, "Accuracy:", accuracy);

      // 1) Submit score to server
      submitScoreToServer(wpm)
        .then(() => {
          if (myUserId === lobbyLeaderId) {
            finalizeRoundOnServer(wpm)
              .then(() => navigate("/rps")) // ⬅️ go to RPS, not Leaderboard
              .catch((err) => console.error("Error finalizing round:", err));
          } else {
            console.log("Score submitted. Waiting for leader to finalize...");
          }
        })
        .catch((err) => {
          console.error("Error submitting score:", err);
        });

      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // useEffect(() => {
  //     socket.on("round-finalized", (data) => {
  //         console.log("Received round-finalized event:", data);
  //         navigate("/leaderboard");
  //     });
  //     return () => {
  //         socket.off("round-finalized");
  //     }
  // }, [navigate]);
  useEffect(() => {
    socket.on("round-finalized", () => navigate("/rps")); // ⬅️ same change
    return () => socket.off("round-finalized");
  }, [navigate]);

  const handleChange = (e) => {
    if (timeLeft <= 0) return;
    setTypedText(e.target.value);
  };

  const submitScoreToServer = async (wpm) => {
    try {
      // /games/:gameId/round/:roundId/submitScore
      const res = await fetch(
        `api/games/${gameId}/round/${roundId}/submitScore`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: myUserId,
            score: wpm,
          }),
        }
      );
      if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.message || "submitScore endpoint failed you dork");
      }
      return res.json();
    } catch (error) {
      console.error("Failed to submit score:", error);
      throw new Error(`submitScoreToServer failed: ${error.message}`);
    }
  };

  const finalizeRoundOnServer = async (wpm) => {
    try {
      // Only the leader can finalize the round
      if (myUserId !== lobbyLeaderId) {
        return; // Non-leaders should not attempt to finalize
      }

      // POST /games/:gameId/round/:roundId/finalize
      const res = await fetch(`api/games/${gameId}/round/${roundId}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: myUserId,
          score: wpm,
        }),
      });
      if (!res.ok) {
        const msg = await res.json();
        throw new Error(
          msg.message || "finalizeRound endpoint failed you dweeb"
        );
      }
      return res.json();
    } catch (error) {
      console.error("Failed to submit score:", error);
      throw new Error(`submitScoreToServer failed: ${error.message}`);
    }
  };

  const progressPercent = ((GAME_TIMER - timeLeft) / GAME_TIMER) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex flex-col flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <h2 className="text-3xl font-bold mb-4">Typing Frenzy</h2>

          <Card
            className="w-full mb-4 p-4 shadow-lg"
            style={{ height: "200px", overflowY: "auto" }}
            ref={containerRef}
          >
            <CardContent>
              <div className="whitespace-pre-wrap text-lg font-mono">
                {textToType.split("").map((char, index) => {
                  let className = "";
                  if (index < typedText.length) {
                    className =
                      typedText[index] === char
                        ? "text-green-600"
                        : "text-red-600";
                  } else if (index === typedText.length) {
                    className = "underline";
                  }
                  return (
                    <span key={index} className={className}>
                      {char}
                    </span>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Hidden input for capturing key strokes */}
          <Input
            ref={inputRef}
            value={typedText}
            onChange={handleChange}
            className="opacity-0 w-0 h-0"
          />

          {/* Progress Bar & Timer */}
          <div className="w-full mt-4">
            <Progress value={progressPercent} className="h-4" />
            <Label className="block text-center mt-2">
              Time Left: {timeLeft}s
            </Label>
          </div>
        </Card>
      </main>
    </div>
  );
}
