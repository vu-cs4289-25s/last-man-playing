import React, { useState, useEffect, useRef } from "react";
import { socket } from "../lib/socket";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function ReactionGame() {
  const [gamePhase, setGamePhase] = useState("pregame"); // "pregame", "ingame", "done"
  const [pregameTimeLeft, setPregameTimeLeft] = useState(15);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [finalMessage, setFinalMessage] = useState("");

  const [color, setColor] = useState("green"); // "green" => hold, "red" => release
  const [colorCycleTimeLeft, setColorCycleTimeLeft] = useState(0);

  const [roundsCompleted, setRoundsCompleted] = useState(0); // need 10 successes
  const [strikes, setStrikes] = useState(0); // 3 => out
  const [hasSucceededThisCycle, setHasSucceededThisCycle] = useState(false);

  const [isHolding, setIsHolding] = useState(false); // if user is physically pressing
  const [isHovering, setIsHovering] = useState(false);

  // Reaction times
  const [reactionTimes, setReactionTimes] = useState([]);
  const [lastReactionTime, setLastReactionTime] = useState(null);

  // timestamp of last color flip
  const lastColorSwitchRef = useRef(null);
  const lobbyId = localStorage.getItem("lobbyId"); // || ""
  const userId = localStorage.getItem("myUserId"); // || "Guest"
  const username = localStorage.getItem("myUsername") || "Guest";

  // Protocol A: localStorage key
  const storageKey = `reactionGame_${userId}`;

  // Protocol A: restore state on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const s = JSON.parse(saved);
        setGamePhase(s.gamePhase);
        setPregameTimeLeft(s.pregameTimeLeft);
        setGameStartTime(s.gameStartTime);
        setFinalMessage(s.finalMessage);
        setColor(s.color);
        setColorCycleTimeLeft(s.colorCycleTimeLeft);
        setRoundsCompleted(s.roundsCompleted);
        setStrikes(s.strikes);
        setHasSucceededThisCycle(s.hasSucceededThisCycle);
        setIsHolding(s.isHolding);
        setIsHovering(s.isHovering);
        setReactionTimes(s.reactionTimes);
        setLastReactionTime(s.lastReactionTime);
      } catch {}
    }
  }, [storageKey]);

  // Protocol A: save state on change
  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        gamePhase,
        pregameTimeLeft,
        gameStartTime,
        finalMessage,
        color,
        colorCycleTimeLeft,
        roundsCompleted,
        strikes,
        hasSucceededThisCycle,
        isHolding,
        isHovering,
        reactionTimes,
        lastReactionTime,
      })
    );
  }, [
    storageKey,
    gamePhase,
    pregameTimeLeft,
    gameStartTime,
    finalMessage,
    color,
    colorCycleTimeLeft,
    roundsCompleted,
    strikes,
    hasSucceededThisCycle,
    isHolding,
    isHovering,
    reactionTimes,
    lastReactionTime,
  ]);

  // pregame
  useEffect(() => {
    if (gamePhase !== "pregame") return;
    // add strike if user never begins game
    if (pregameTimeLeft <= 0) {
      addStrike();
      setPregameTimeLeft(15);
    }
    // timer decrements per second
    const timerId = setInterval(() => {
      setPregameTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [gamePhase, pregameTimeLeft]);

  // start game when player presses down
  function handleMouseDownPregame() {
    setGamePhase("ingame");
    setGameStartTime(Date.now());

    const duration = randomInt(5, 10); // 5 - 11 secs for color change
    setColorCycleTimeLeft(duration);
    lastColorSwitchRef.current = Date.now();

    setPregameTimeLeft(15);
    setIsHolding(true);
  }

  // ingame
  useEffect(() => {
    if (gamePhase !== "ingame") return;

    // End if 3 strikes or 10 successes
    if (strikes >= 3) {
      endGame(false);
      return;
    }
    if (roundsCompleted >= 10) {
      endGame(true);
      return;
    }

    // edit: If time for this color cycle is up, just flip color—no auto strike
    if (colorCycleTimeLeft <= 0) {
      handleEndOfColorCycle();
      return;
    }

    const timerId = setInterval(() => {
      setColorCycleTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [gamePhase, colorCycleTimeLeft, strikes, roundsCompleted]);

  useEffect(() => {
    socket.on("reaction-progress", (data) => {
      console.log("Reaction progress =>", data);
    });

    socket.on("reaction-all-done", (payload) => {
      console.log("All done =>", payload);
    });

    socket.on("reaction-go-leaderboard", () => {
      // e.g. navigate("/leaderboard");
    });

    return () => {
      socket.off("reaction-progress");
      socket.off("reaction-all-done");
      socket.off("reaction-go-leaderboard");
    };
  }, []);

  function handleEndOfColorCycle() {
    // If the user has not done the correct action by now, that’s a fail
    setHasSucceededThisCycle(false);
    let success = color === "green" ? isHolding : !isHolding;

    if (!success) {
      addStrike();
    }

    // flip color
    const newColor = color === "green" ? "red" : "green";
    setColor(newColor);
    const duration = randomInt(5, 10);
    setColorCycleTimeLeft(duration);
    lastColorSwitchRef.current = Date.now();
  }

  function addStrike() {
    setStrikes((prev) => {
      const nextVal = prev + 1;
      if (nextVal >= 3) {
        endGame(false);
      }
      return nextVal;
    });
  }

  function endGame(success) {
    setGamePhase("done");
    const totalTimeSec = (
      (Date.now() - (gameStartTime || Date.now())) /
      1000
    ).toFixed(2);

    if (!success) {
      setFinalMessage(
        `You earned 3 strikes! Game over.\nYou lasted ${totalTimeSec} seconds.`
      );
    } else {
      const sum = reactionTimes.reduce((acc, val) => acc + val, 0);
      const avgMs = sum / reactionTimes.length;
      const avgSec = (avgMs / 1000).toFixed(3);

      setFinalMessage(
        `Congratulations! You completed 10 color changes.\nAverage Reaction Time: ${avgSec} seconds.`
      );
    }

    const sum = reactionTimes.reduce((acc, val) => acc + val, 0);
    const avgMs = reactionTimes.length > 0 ? sum / reactionTimes.length : 999999;
    const avgSec = parseFloat((avgMs / 1000).toFixed(3));

    const isOut = !success;
    socket.emit("reaction-finished", {
      lobbyId,
      userId,
      isOut,
      totalTimeSec: parseFloat(totalTimeSec),
      avgReactionSec: avgSec,
      username,
    });

    // Protocol A: clear saved state on game end
    localStorage.removeItem(storageKey);
  }

  function handleMouseDownInGame() {
    if (color === "green") {
      if (!hasSucceededThisCycle) {
        const reaction =
          Date.now() - (lastColorSwitchRef.current || Date.now());
        setReactionTimes((arr) => [...arr, reaction]);
        setLastReactionTime(reaction);
        setRoundsCompleted((r) => r + 1);
        setHasSucceededThisCycle(true);
      }
      setIsHolding(true);
    } else {
      addStrike();
      setIsHolding(true);
    }
  }

  function handleMouseUpInGame() {
    if (color === "red") {
      if (!hasSucceededThisCycle) {
        const reaction =
          Date.now() - (lastColorSwitchRef.current || Date.now());
        setReactionTimes((arr) => [...arr, reaction]);
        setLastReactionTime(reaction);
        setRoundsCompleted((r) => r + 1);
        setHasSucceededThisCycle(true);
      }
      setIsHolding(false);
    } else {
      addStrike();
      setIsHolding(false);
    }
  }

  const normalGreen = "#008000";
  const darkGreen = "#005500";
  const normalRed = "#FF0000";
  const darkRed = "#AA0000";

  let buttonBgColor;
  if (color === "green") {
    buttonBgColor = isHolding ? darkGreen : normalGreen;
  } else {
    buttonBgColor = isHolding ? darkRed : normalRed;
  }

  if (gamePhase === "pregame") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        {/* Nav */}
        <header className="w-full bg-gray-300 py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wide">LAST MAN PLAYING</h1>
          <div className="flex items-center space-x-4">
            <span className="text-xl font-bold"></span>
            <img
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-gray-500"
            />
          </div>
        </header>

        <main className="flex flex-col items-center justify-center flex-1 p-4">
          <h2 className="text-3xl font-bold mb-4">RED LIGHT GREEN LIGHT</h2>
          <p>{pregameTimeLeft} seconds to start</p>

          <button
            style={{
              backgroundColor: isHovering ? "#0000a0" : "blue",
              color: "white",
              width: 200,
              height: 200,
              fontSize: "1.5rem",
              borderRadius: "50%",
            }}
            onMouseDown={handleMouseDownPregame}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            HOLD DOWN TO START
          </button>

          <div className="mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                style={{
                  color: i < strikes ? "red" : "brown",
                  fontSize: "2rem",
                  marginRight: 5,
                }}
              >
                X
              </span>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (gamePhase === "done") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <header className="w-full bg-gray-300 py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wide">LAST MAN PLAYING</h1>
          <div className="flex items-center space-x-4">
            <span className="text-xl font-bold"></span>
            <img
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-gray-500"
            />
          </div>
        </header>

        <main className="flex flex-col items-center justify-center flex-1 p-4">
          <h2 className="text-3xl font-bold mb-2">RED LIGHT GREEN LIGHT</h2>
          <p className="whitespace-pre-line mt-4 text-lg">{finalMessage}</p>
        </main>
      </div>
    );
  }

  // IN-GAME
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">LAST MAN PLAYING</h1>
        <div className="flex items-center space-x-4">
          <span className="text-xl font-bold"></span>
          <img
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-gray-500"
          />
        </div>
      </header>

      <main className="flex flex-col items-center justify-center flex-1 p-4">
        <h2 className="text-3xl font-bold mb-2">RED LIGHT GREEN LIGHT</h2>

        <p>Color Changes Completed: {roundsCompleted}/10</p>
        <p>Strikes: {strikes}/3</p>

        {lastReactionTime && (
          <p className="mt-2">
            Last Reaction: {(lastReactionTime / 1000).toFixed(3)} seconds
          </p>
        )}

        <button
          style={{
            backgroundColor: buttonBgColor,
            color: "white",
            width: 200,
            height: 200,
            fontSize: "1.5rem",
            borderRadius: "50%",
          }}
          onMouseDown={handleMouseDownInGame}
          onMouseUp={handleMouseUpInGame}
        >
          {color === "green"
            ? isHolding
              ? "WAIT"
              : "HOLD"
            : isHolding
            ? "LET GO"
            : "WAIT"}
        </button>

        <div className="mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              style={{
                color: i < strikes ? "red" : "brown",
                fontSize: "2rem",
                marginRight: 5,
              }}
            >
                X
            </span>
          ))}
        </div>
      </main>
    </div>
  );
}
