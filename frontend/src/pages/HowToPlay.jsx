// frontend/src/pages/HowToPlay.jsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function HowToPlay() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gray-100">
      {/* Centered Navbar */}
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-center">
        <h1 className="text-2xl font-bold tracking-wide text-center">
          LAST MAN PLAYING
        </h1>
      </header>

      {/* Centered How to Play Card */}
      <main className="flex justify-center items-center flex-1 w-full">
        <Card className="w-[500px] shadow-lg rounded-lg">
          {/* How to Play Title */}
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              HOW TO PLAY
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* Instructions */}
            <p className="text-center text-gray-700 mb-6">Text rules etc etc</p>

            {/* Play Button */}
            <div className="flex justify-center">
              <Button className="bg-[#0D1117] text-white hover:bg-[#161B22]">
                PLAY
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}