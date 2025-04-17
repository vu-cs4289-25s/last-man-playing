// frontend/src/pages/HowToPlay.jsx

import React from "react";
import Header from "../components/ui/Header";
import Accordion from "../components/ui/Accordion";

export default function HowToPlay() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex flex-col flex-1 items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6">How to Play</h1>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Game Rules</h2>
            <p className="mb-6">
              Last Man Playing is a series of mini-games where players compete
              to be the last one standing. Each game lasts 10 seconds, and
              players earn points based on their performance.
            </p>

            <h2 className="text-xl font-semibold mt-6">Getting Started</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Create or join a lobby</li>
              <li>Wait for all players to join</li>
              <li>Start the game when everyone is ready</li>
              <li>
                Compete in various mini-games
                <Accordion title="Typing Game">
                  <div className="space-y-2">
                    <p>Test your typing speed and accuracy!</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Type as many words as possible within 10 seconds</li>
                      <li>Words must be typed correctly to count</li>
                      <li>Player with the most correctly typed words wins</li>
                    </ul>
                  </div>
                </Accordion>
                <Accordion title="Rock Paper Scissors">
                  <div className="space-y-2">
                    <p>Classic game with a twist!</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Play against the computer in multiple rounds</li>
                      <li>Each round lasts 10 seconds</li>
                      <li>Player with the most wins gets the most points</li>
                      <li>
                        Standard rules: Rock beats Scissors, Scissors beats
                        Paper, Paper beats Rock
                      </li>
                    </ul>
                  </div>
                </Accordion>
                <Accordion title="Math Blitz">
                  <div className="space-y-2">
                    <p>Test your mental math skills!</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        Answer as many math questions as possible within 10
                        seconds
                      </li>
                      <li>Questions include basic arithmetic operations</li>
                      <li>Only correct answers count towards your score</li>
                      <li>Player with the most correct answers wins</li>
                    </ul>
                  </div>
                </Accordion>
                <Accordion title="Red Light Green Light">
                  <div className="space-y-2">
                    <p>Test your reaction time!</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Hold down the button when the light turns green</li>
                      <li>
                        Release the button immediately when the light turns red
                      </li>
                      <li>Fastest reaction time wins the most points</li>
                      <li>Game lasts 10 seconds with multiple light changes</li>
                    </ul>
                  </div>
                </Accordion>
                <Accordion title="Sequence Memory">
                  <div className="space-y-2">
                    <p>Test your memory and pattern recognition!</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Watch a sequence of patterns or colors</li>
                      <li>Repeat the sequence in the correct order</li>
                      <li>Sequences get progressively longer</li>
                      <li>Player who can follow the longest sequence wins</li>
                    </ul>
                  </div>
                </Accordion>
              </li>
              <li>Be the last player standing to win!</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
