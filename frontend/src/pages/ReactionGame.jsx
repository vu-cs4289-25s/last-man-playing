import React, { useState, useEffect, useRef } from "react"
// If you plan to post results to a backend, uncomment:
// import axios from "axios"

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default function ReactionGame() {
  // =======================
  //      GAME STATES
  // =======================
  const [gamePhase, setGamePhase] = useState("preGame")  
  const [preGameTimeLeft, setPreGameTimeLeft] = useState(15)

  // "green" => must hold; "red" => must let go
  const [color, setColor] = useState("green")

  // Hidden from UI, used internally for each color cycle
  const [colorCycleTimeLeft, setColorCycleTimeLeft] = useState(0)

  const [roundsCompleted, setRoundsCompleted] = useState(0)  // Need 10 successful color changes
  const [strikes, setStrikes] = useState(0)                  // 3 => game ends

  // We'll store reaction times (in ms) for each successful round
  const [reactionTimes, setReactionTimes] = useState([])  

  // Show the last reaction time right after each successful turn
  const [lastReactionTime, setLastReactionTime] = useState(null)

  // When the color changes, we store the timestamp here
  const lastColorSwitchRef = useRef(null)

  // If the user is currently holding the mouse down
  const [isHolding, setIsHolding] = useState(false)

  // Overall timing
  const [gameStartTime, setGameStartTime] = useState(null)
  const [finalMessage, setFinalMessage] = useState("")

  /*************************************************
   * 1. PRE-GAME PHASE
   *************************************************/
  useEffect(() => {
    if (gamePhase !== "preGame") return
    
    // If user never presses within 15s, add a strike, reset timer
    if (preGameTimeLeft <= 0) {
      addStrike()
      setPreGameTimeLeft(15)
    }

    const timerId = setInterval(() => {
      setPreGameTimeLeft((t) => t - 1)
    }, 1000)

    return () => clearInterval(timerId)
  }, [gamePhase, preGameTimeLeft])

  const handleMouseDownPreGame = () => {
    // Player has pressed the blue button, start inGame
    setGamePhase("inGame")
    setGameStartTime(Date.now())

    // First color cycle (range is now 5–11 seconds, not 6–15)
    const randomDuration = randomInt(5, 11)
    setColorCycleTimeLeft(randomDuration)
    lastColorSwitchRef.current = Date.now()

    setPreGameTimeLeft(15)
    setIsHolding(true)
  }

  /*************************************************
   * 2. IN-GAME PHASE
   *************************************************/
  useEffect(() => {
    if (gamePhase !== "inGame") return

    // If 3 strikes or 10 successes, end
    if (strikes >= 3) {
      endGame(false)
      return
    }
    if (roundsCompleted >= 10) {
      endGame(true)
      return
    }

    // If the color cycle hits 0, flip color
    if (colorCycleTimeLeft <= 0) {
      handleEndOfColorCycle()
      return
    }

    const timerId = setInterval(() => {
      setColorCycleTimeLeft((t) => t - 1)
    }, 1000)

    return () => clearInterval(timerId)
  }, [gamePhase, colorCycleTimeLeft, strikes, roundsCompleted])

  function handleEndOfColorCycle() {
    // Here, we NO LONGER record reaction time
    // If the user has not done the correct action by now, that’s a fail
    // (No success => no reaction time => no increment)
    let success = false

    if (color === "green") {
      // They needed to press => success if isHolding===true
      success = isHolding
    } else {
      // color=red => success if isHolding===false
      success = !isHolding
    }

    if (!success) {
      addStrike()
    }
    // If success *had* happened, we recorded it in the mouse event 
    // so there's nothing to do here

    // Flip color
    const newColor = (color === "green") ? "red" : "green"
    setColor(newColor)

    // Next cycle: 5–11 seconds
    const randomDuration = randomInt(5, 11)
    setColorCycleTimeLeft(randomDuration)
    lastColorSwitchRef.current = Date.now()
  }

  /*************************************************
   * 3. STRIKES
   *************************************************/
  function addStrike() {
    setStrikes((s) => {
      const nextVal = s + 1
      if (nextVal >= 3) {
        endGame(false)
      }
      return nextVal
    })
  }

  /*************************************************
   * 4. END GAME
   *************************************************/
  function endGame(completedAllRounds) {
    setGamePhase("done")
    const totalGameTimeSec = ((Date.now() - (gameStartTime || Date.now())) / 1000).toFixed(2)

    if (!completedAllRounds) {
      setFinalMessage(
        `You earned 3 strikes! Game over.\nYou lasted ${totalGameTimeSec} seconds.`
      )
    } else {
      // Completed 10 color changes
      const sum = reactionTimes.reduce((acc, val) => acc + val, 0)
      const avgMs = sum / reactionTimes.length
      const avgSec = (avgMs / 1000).toFixed(3)

      setFinalMessage(
        `Congratulations! You completed 10 color changes.\n` +
          `Average Reaction Time: ${avgSec} seconds.\n` +
          `Total Game Time: ${totalGameTimeSec} s.`
      )
    }
    // Optional: Post results with axios
  }

  /*************************************************
   * 5. MOUSE DOWN & UP (Recording Reaction in These Events)
   *************************************************/
  function handleMouseDownInGame() {
    if (color === "green") {
      // Pressing green => correct => record reaction time
      const reaction = Date.now() - (lastColorSwitchRef.current || Date.now())
      // Save reaction
      setReactionTimes((arr) => [...arr, reaction])
      setLastReactionTime(reaction)
      setRoundsCompleted((r) => r + 1)

      setIsHolding(true)
    } else {
      // Pressing red => strike
      addStrike()
    }
  }

  function handleMouseUpInGame() {
    if (color === "red") {
      // Letting go on red => correct => record reaction
      const reaction = Date.now() - (lastColorSwitchRef.current || Date.now())
      setReactionTimes((arr) => [...arr, reaction])
      setLastReactionTime(reaction)
      setRoundsCompleted((r) => r + 1)

      setIsHolding(false)
    } else {
      // Let go on green => strike
      addStrike()
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 6. RENDER: With Centered NavBar (Figma Style)
  // ─────────────────────────────────────────────────────────────────
  if (gamePhase === "preGame") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        {/* Centered NavBar */}
        <header className="w-full bg-gray-300 py-4 px-6 flex justify-center">
          <h1 className="text-2xl font-bold tracking-wide text-center">
            LAST MAN PLAYING
          </h1>
        </header>

        <main className="flex flex-col items-center justify-center flex-1 p-4">
          <h2 className="text-3xl font-bold mb-4">RED LIGHT GREEN LIGHT</h2>
          <p>{preGameTimeLeft} seconds to start</p>

          <button
            style={{
              backgroundColor: "blue",
              color: "white",
              width: "200px",
              height: "200px",
              fontSize: "1.5rem",
              borderRadius: "50%",
            }}
            onMouseDown={handleMouseDownPreGame}
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
    )
  }

  if (gamePhase === "done") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <header className="w-full bg-gray-300 py-4 px-6 flex justify-center">
          <h1 className="text-2xl font-bold tracking-wide text-center">
            LAST MAN PLAYING
          </h1>
        </header>

        <main className="flex flex-col items-center justify-center flex-1 p-4">
          <h2 className="text-3xl font-bold mb-2">RED LIGHT GREEN LIGHT</h2>
          <p className="whitespace-pre-line mt-4 text-lg">{finalMessage}</p>
        </main>
      </div>
    )
  }

  // IN-GAME PHASE
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-center">
        <h1 className="text-2xl font-bold tracking-wide text-center">
          LAST MAN PLAYING
        </h1>
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
            ? isHolding
              ? "WAIT"
              : "HOLD"
            : isHolding
            ? "WAIT"
            : "LET GO"}
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
  )
}
