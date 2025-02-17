import React from "react";
import { Button } from "../components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Header */}
      <div className="w-full bg-gray-300 py-3 px-6">
        <h1 className="text-2xl font-bold tracking-wide">LAST MAN PLAYING</h1>
      </div>

      {/* Main Card */}
      <div className="bg-white shadow-lg rounded-lg p-10 mt-10 w-[400px] flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-6">WELCOME</h2>

        {/* Buttons */}
        <div className="flex flex-col w-full space-y-4">
          <Button className="w-full bg-[#0D1117] text-white hover:bg-[#161B22]">
            LOG IN
          </Button>
          <Button className="w-full bg-[#0D1117] text-white hover:bg-[#161B22]">
            REGISTER
          </Button>
          <Button className="w-full bg-[#0D1117] text-white hover:bg-[#161B22]">
            PLAY AS GUEST
          </Button>
          <Button className="w-full bg-[#0D1117] text-white hover:bg-[#161B22]">
            HOW TO PLAY
          </Button>
        </div>
      </div>
    </div>
  );
}