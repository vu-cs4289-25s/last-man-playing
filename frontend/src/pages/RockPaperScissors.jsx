import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Label } from "../components/ui/label";
import { socket } from "../lib/socket";
import { useNavigate } from "react-router-dom";
import Header from "../components/ui/Header";

const TOTAL_ROUNDS = 3;
const GAME_TIMER = 10; // ⬅️ 10‑second global clock
const MOVES = ["rock", "paper", "scissors"];
const EMOJI = { rock: "✊", paper: "✋", scissors: "✌️" };

export default function RockPaperScissors() {
  const navigate = useNavigate();
  const myUserId = localStorage.getItem("myUserId") || "Guest";
  const lobbyId = localStorage.getItem("lobbyId") || "";
  const leaderId = localStorage.getItem("lobbyLeaderId") || "";
  const gameId = localStorage.getItem("gameId");
  const roundId = localStorage.getItem("roundId");

  /* ───────────── state ───────────── */
  const [round, setRound] = useState(1);
  const [userMove, setUserMove] = useState(null);
  const [cpuMove, setCpuMove] = useState(null);
  const [result, setResult] = useState(null); // win | lose | tie
  const [wins, setWins] = useState(0);
  const [ties, setTies] = useState(0);

  const [timeLeft, setTimeLeft] = useState(GAME_TIMER);
  const [finished, setFinished] = useState(false);

  // [Protocol A] localStorage key
  const storageKey = `rps_${roundId}_${myUserId}`;

  // [Protocol A] restore state on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const { round: r, wins: w, ties: t, timeLeft: tl, finished: f } = JSON.parse(saved);
        setRound(r);
        setWins(w);
        setTies(t);
        setTimeLeft(tl);
        setFinished(f);
      } catch {}
    }
  }, [storageKey]);

  // [Protocol A] save state on change
  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ round, wins, ties, timeLeft, finished })
    );
  }, [storageKey, round, wins, ties, timeLeft, finished]);

  /* ───────────── socket setup ───────────── */
  useEffect(() => {
    lobbyId && socket.emit("join-lobby", { lobbyId });
    socket.on("round-finalized", () => navigate("/mathblitz"));
    return () => socket.off("round-finalized");
  }, [lobbyId, navigate]);

  /* ───────────── 10‑sec countdown ───────────── */
  useEffect(() => {
    if (timeLeft <= 0) {
      if (!finished) finishGame(); // auto‑finish
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, finished]);

  /* ───────────── gameplay ───────────── */
  const randCpu = () => MOVES[Math.floor(Math.random() * 3)];
  const judge = (u, c) =>
    u === c
      ? "tie"
      : (u === "rock" && c === "scissors") ||
        (u === "paper" && c === "rock") ||
        (u === "scissors" && c === "paper")
      ? "win"
      : "lose";

  const play = (move) => {
    if (finished || userMove) return; // ignore while showing result
    const cpu = randCpu();
    const res = judge(move, cpu);

    setUserMove(move);
    setCpuMove(cpu);
    setResult(res);
    if (res === "win") setWins((w) => w + 1);
    if (res === "tie") setTies((t) => t + 1);

    setTimeout(() => {
      if (round < TOTAL_ROUNDS) {
        setRound((r) => r + 1);
        setUserMove(null);
        setCpuMove(null);
        setResult(null);
      } else {
        finishGame();
      }
    }, 1200);
  };

  /* ───────────── finish / scoring ───────────── */
  const finishGame = async () => {
    if (finished) return;
    setFinished(true);

    // [Protocol A] clear saved state on game end
    localStorage.removeItem(storageKey);

    const score = wins * 100 + ties * 50;

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
        // No manual navigate here; wait for socket event
      }
      /* non‑leaders wait for socket event */
    } catch (e) {
      console.error("RPS submit/finalize error:", e);
      alert("Could not submit RPS score, see console.");
    }
  };

  const progress = ((GAME_TIMER - timeLeft) / GAME_TIMER) * 100;

  /* ───────────── UI ───────────── */
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex flex-col flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              Rock‑Paper‑Scissors vs John Doe
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center">
            <p className="mb-2">
              Round {round} / {TOTAL_ROUNDS}
            </p>

            {userMove && (
              <p className="mb-4">
                You {EMOJI[userMove]} vs John Doe {EMOJI[cpuMove]} —&nbsp;
                {result === "win" ? (
                  <span className="text-green-600">Win!</span>
                ) : result === "lose" ? (
                  <span className="text-red-600">Lose!</span>
                ) : (
                  <span className="text-blue-600">Tie!</span>
                )}
              </p>
            )}

            {!finished && !userMove && (
              <div className="flex justify-center gap-4 mb-4">
                {MOVES.map((m) => (
                  <Button key={m} onClick={() => play(m)}>
                    {EMOJI[m]} {m}
                  </Button>
                ))}
              </div>
            )}

            <p className="mb-4">
              Wins {wins} Ties {ties}
            </p>

            {/* 10‑sec progress bar */}
            <Progress value={progress} className="h-3" />
            <Label className="block mt-1">Time Left: {timeLeft}s</Label>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
