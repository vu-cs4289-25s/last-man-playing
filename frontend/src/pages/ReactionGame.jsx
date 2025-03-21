import React, { useState, useEffect, useRef } from "react";
// import axios from "axios"; // for sending final results to backend

// no shadcn
// error with handling double/triple clicks and not properly exiting 

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function ReactionGame() {
  const [gamePhase, setGamePhase] = useState("preGame"); 
  const [preGameTimeLeft, setPreGameTimeLeft] = useState(15); 
  const [color, setColor] = useState("green");
  const [colorCycleTimeLeft, setColorCycleTimeLeft] = useState(0); 
  const [roundsCompleted, setRoundsCompleted] = useState(0); 
  const [strikes, setStrikes] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]); 
  const lastColorSwitchRef = useRef(null);
  const [isHolding, setIsHolding] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [finalMessage, setFinalMessage] = useState("");

  useEffect(() => {
    if (gamePhase !== "preGame") return;
    if (preGameTimeLeft <= 0) {
      addStrike();
      setPreGameTimeLeft(15);
    }

    const timerId = setInterval(() => {
      setPreGameTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [gamePhase, preGameTimeLeft]);

  const handleMouseDownPreGame = () => {
    setGamePhase("inGame");
    setGameStartTime(Date.now());
    const randomDuration = randomInt(6, 15);
    setColorCycleTimeLeft(randomDuration);
    lastColorSwitchRef.current = Date.now();
    setPreGameTimeLeft(15);
    setIsHolding(true);
  };

  useEffect(() => {
    if (gamePhase !== "inGame") return;
    if (strikes >= 3 || roundsCompleted >= 10) return;
    if (colorCycleTimeLeft <= 0) {
      handleEndOfColorCycle();
      return;
    }

    const timerId = setInterval(() => {
      setColorCycleTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [gamePhase, colorCycleTimeLeft, strikes, roundsCompleted]);

  function handleEndOfColorCycle() {
    let success = false;
    if (color === "green") {
      success = isHolding;
    } else {
      success = !isHolding;
    }

    if (!success) {
      addStrike();
    } else {
      const reaction = Date.now() - lastColorSwitchRef.current;
      setReactionTimes((arr) => [...arr, reaction]);
      setRoundsCompleted((r) => r + 1);
    }

    const newColor = color === "green" ? "red" : "green";
    setColor(newColor);

    const randomDuration = randomInt(6, 15);
    setColorCycleTimeLeft(randomDuration);
    lastColorSwitchRef.current = Date.now();

    if (strikes + 1 >= 3 && !success) {
      endGame(false);
    } else if (roundsCompleted + 1 >= 10 && success) {
      endGame(true);
    }
  }

  function addStrike() {
    setStrikes((s) => s + 1);
  }

  function endGame(completedAllRounds) {
    setGamePhase("done");
    const totalGameTimeSec = ((Date.now() - gameStartTime) / 1000).toFixed(2);

    if (!completedAllRounds) {
      setFinalMessage(
        `You earned 3 strikes! Game over. You lasted ${totalGameTimeSec} seconds.`
      );
    } else {
      const avgMs =
        reactionTimes.reduce((sum, val) => sum + val, 0) / reactionTimes.length;
      const avgSec = (avgMs / 1000).toFixed(3);
      setFinalMessage(
        `Congratulations! You completed 10 color changes.\n` +
          `Average Reaction Time: ${avgSec} seconds.\n` +
          `Total Game Time: ${totalGameTimeSec} s.`
      );
    }

    const payload = {
      completedAllRounds,
      totalTime: totalGameTimeSec,
      reactionTimes,
      strikes,
    };
    axios.post("/api/gameResults", payload).catch((err) => {
      console.error("Error posting results:", err);
    });
  }

  function handleMouseDownInGame() {
    if (color === "green") {
      setIsHolding(true);
    } else {
      addStrike();
    }
  }

  function handleMouseUpInGame() {
    if (color === "red") {
      setIsHolding(false);
    } else {
      addStrike();
    }
  }

  if (gamePhase === "preGame") {
    return (
      <div className="p-4">
        <h1>LAST MAN PLAYING</h1>
        <p>RED LIGHT GREEN LIGHT</p>
        <p>{preGameTimeLeft} seconds to start</p>
        <button
          style={{ backgroundColor: "blue", color: "white" }}
          onMouseDown={handleMouseDownPreGame}
        >
          HOLD DOWN TO START
        </button>

        <div>
          {/* Display strikes */}
          {Array.from({ length: 3 }).map((_, i) => {
            const active = i < strikes;
            return (
              <span key={i} style={{ color: active ? "red" : "brown" }}>
                X{" "}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  if (gamePhase === "done") {
    return (
      <div className="p-4">
        <h1>LAST MAN PLAYING</h1>
        <p>{finalMessage}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1>LAST MAN PLAYING</h1>
      <p>RED LIGHT GREEN LIGHT</p>

      <p>Color Changes Completed: {roundsCompleted}/10</p>
      <p>Strikes: {strikes}/3</p>

      <div>
        {/* Show the color cycle time left */}
        <h2>{colorCycleTimeLeft}</h2>

        {/* The big button */}
        <button
          style={{
            backgroundColor: color === "green" ? "green" : "red",
            color: "white",
            width: "200px",
            height: "200px",
            fontSize: "1.5rem",
            borderRadius: "50%",
          }}
          onMouseDown={handleMouseDownInGame}
          onMouseUp={handleMouseUpInGame}
        >
          {color === "green" 
            ? (isHolding ? "WAIT" : "HOLD") 
            : (isHolding ? "WAIT" : "LET GO")}
        </button>
      </div>

      <div className="mt-4">
        {Array.from({ length: 3 }).map((_, i) => {
          const active = i < strikes;
          return (
            <span key={i} style={{ color: active ? "red" : "brown", fontSize: "2rem", marginRight: 5 }}>
              X
            </span>
          );
        })}
      </div>
    </div>
  );
}
