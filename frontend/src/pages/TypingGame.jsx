import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { Label } from "../components/ui/label";
import io from "socket.io-client";

const GAME_TIMER = 10;

export default function TypingGame() {
    const textToType =
        "This is a sample text for the typing game. Type as fast and accurately as you can. Good luck and have fun!";

    // State for the user's input and timer.
    const [typedText, setTypedText] = useState("");
    const [timeLeft, setTimeLeft] = useState(GAME_TIMER);

    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const socketRef = useRef(null);

    // Connect to the socket server once on mount.
    useEffect(() => {
        socketRef.current = io("http://localhost:3000"); // Update URL as needed
        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    // Auto-focus the hidden input when the component mounts.
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        if (!socketRef.current) return;

        socketRef.current.on('game-finished-broadcast', (data) => {
            console.log("Broadcast received:", data);
        })

        return () => {
            socketRef.current.off('game-finished-broadcast')
        }
    }, [])

    // Timer effect: only depends on timeLeft.
    useEffect(() => {
        if (timeLeft <= 0) {
            // When time is up, calculate metrics.
            const correctCount = textToType.split("").reduce((acc, char, index) => {
                return acc + (typedText[index] === char ? 1 : 0);
            }, 0);
            const accuracy =
                typedText.length > 0 ? (correctCount / typedText.length) * 100 : 0;
            const wpm = Math.round(correctCount / 5) * (60/GAME_TIMER);

            console.log("Game Over!");
            console.log("Accuracy:", accuracy.toFixed(2) + "%");
            console.log("Words Per Minute:", wpm);

            // Retrieve the userId from local storage.
            const myUserId = localStorage.getItem("myUserId") || "unknown";

            // Emit the game-finished event with userId, wpm, and accuracy.
            if (socketRef.current) {
                socketRef.current.emit("game-finished", { userId: myUserId, wpm, accuracy });
            }
            return;
        }
        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]); // Only timeLeft is in the dependency array

    // Calculate progress percentage.
    const progressPercent = ((60 - timeLeft) / 60) * 100;
    console.log("Progress Percent:", progressPercent);

    // Handle input changes.
    const handleChange = (e) => {
        if (timeLeft <= 0) return;
        setTypedText(e.target.value);
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gray-100">
            {/* Header */}
            <header className="w-full bg-gray-300 py-4 px-6 flex justify-center">
                <h1 className="text-2xl font-bold tracking-wide text-center">
                    LAST MAN PLAYING
                </h1>
            </header>

            {/* Main Content */}
            <main className="flex flex-col items-center py-6 w-full max-w-4xl">
                {/* Typing Frenzy Title */}
                <h2 className="text-3xl font-bold mb-4">Typing Frenzy</h2>

                {/* Text Box */}
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
                                        typedText[index] === char ? "text-green-600" : "text-red-600";
                                } else if (index === typedText.length) {
                                    className = "underline";
                                }
                                return (
                                    <span key={index} id={`char-${index}`} className={className}>
                    {char}
                  </span>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Hidden Input for capturing key strokes */}
                <Input
                    ref={inputRef}
                    value={typedText}
                    onChange={handleChange}
                    className="opacity-0 w-0 h-0"
                />

                {/* Progress Bar and Timer */}
                <div className="w-full mt-4">
                    {/* If the Shadcn Progress component remains invisible, compare with a fallback div */}
                    <Progress value={progressPercent} className="h-4" style={{ height: "1rem", backgroundColor: "black" }} />
                    <Label className="block text-center mt-2">Time Left: {timeLeft}s</Label>
                </div>
            </main>
        </div>
    );
}
