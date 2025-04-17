import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { Label } from "../components/ui/label";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";
import Header from "../components/ui/Header";

const GAME_TIMER = 15;

export default function MathGame() {
  const navigate = useNavigate();
  const myUserId = localStorage.getItem("myUserId") || "Guest";
  const gameId = localStorage.getItem("gameId");
  const roundId = localStorage.getItem("roundId");
  const lobbyId = localStorage.getItem("lobbyId");
  const leaderId = localStorage.getItem("lobbyLeaderId");

  // ───────────── Protocol A key ─────────────
  const storageKey = `mathBlitz_${roundId}_${myUserId}`;

  const [question, setQuestion] = useState(generateQuestion());
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIMER);
  const [finished, setFinished] = useState(false);

  // ───────────── Protocol A: restore on mount ─────────────
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const {
          question: q,
          score: s,
          timeLeft: tl,
          finished: f,
        } = JSON.parse(saved);
        setQuestion(q);
        setScore(s);
        setTimeLeft(tl);
        setFinished(f);
      } catch {}
    }
  }, [storageKey]);

  // ───────────── Protocol A: save on change ─────────────
  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ question, score, timeLeft, finished })
    );
  }, [storageKey, question, score, timeLeft, finished]);

  useEffect(() => {
    if (lobbyId) socket.emit("join-lobby", { lobbyId });
    socket.on("round-finalized", () => navigate("/sequencegame"));
    return () => socket.off("round-finalized");
  }, [navigate, lobbyId]);

  useEffect(() => {
    if (timeLeft <= 0 && !finished) {
      endGame();
      return;
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, finished]);

  function generateQuestion() {
    const a = Math.floor(Math.random() * 10 + 1);
    const b = Math.floor(Math.random() * 10 + 1);
    return { a, b, answer: a + b };
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (parseInt(answer) === question.answer) {
      setScore((s) => s + 10);
    }
    setQuestion(generateQuestion());
    setAnswer("");
  }

  async function endGame() {
    if (finished) return;
    setFinished(true);

    // ───────────── Protocol A: clear saved state on game end ─────────────
    localStorage.removeItem(storageKey);

    try {
      await fetch(`/api/games/${gameId}/round/${roundId}/submitScore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: myUserId, score }),
      });

      if (myUserId === leaderId) {
        await fetch(`/api/games/${gameId}/round/${roundId}/finalize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: myUserId }),
        });
        navigate("/sequencegame");
      }
    } catch (err) {
      console.error("Error submitting math game score:", err);
    }
  }

  const progress = ((GAME_TIMER - timeLeft) / GAME_TIMER) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex flex-col flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              Math Blitz
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {!finished ? (
              <>
                <p className="text-lg mb-4">
                  {question.a} + {question.b} = ?
                </p>
                <form
                  onSubmit={handleSubmit}
                  className="flex justify-center mb-4"
                >
                  <Input
                    type="number"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-32 text-center"
                    autoFocus
                  />
                </form>
                <p className="mb-4">Score: {score}</p>
              </>
            ) : (
              <p className="text-lg">Game Over! Final Score: {score}</p>
            )}
            <Progress value={progress} className="h-3" />
            <Label className="block mt-2">Time Left: {timeLeft}s</Label>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
