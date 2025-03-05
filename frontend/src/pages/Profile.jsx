// frontend/src/pages/Profile.jsx

import React from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function Profile() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gray-100">
      {/* Header */}
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">LAST MAN PLAYING</h1>
        {/* Profile Icon */}
        <img
          src="https://via.placeholder.com/40" // Replace with actual profile image URL
          alt="Profile"
          className="w-10 h-10 rounded-full border-2 border-gray-500"
        />
      </header>

      {/* Profile Section */}
      <main className="flex flex-col items-center mt-8 w-full max-w-3xl">
        {/* Avatar & User Info */}
        <div className="flex items-center w-full px-10">
          <img
            src="https://via.placeholder.com/150" // Replace with actual avatar URL
            alt="Avatar"
            className="w-36 h-36 rounded-full border-4 border-white shadow-lg"
          />
          <div className="ml-8">
            <h2 className="text-2xl font-bold">PLAYER USERNAME</h2>
            <p className="text-gray-600 mt-2">STATUS</p>
            {/* Status Bar */}
            <div className="w-64 bg-gray-200 rounded-full h-3 mt-2">
              <div className="bg-black h-3 rounded-full w-3/4"></div>
            </div>
            {/* Edit Avatar Button */}
            <Button className="mt-4 bg-[#0D1117] text-white hover:bg-[#161B22]">
              EDIT AVATAR
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full border-t my-6"></div>

        {/* Statistics Section */}
        <h3 className="text-lg font-semibold self-start px-10 mb-4">STATISTICS</h3>
        <div className="grid grid-cols-3 gap-6 w-full px-10">
          <Card className="p-6 bg-gray-300 flex flex-col items-center">
            <p className="text-sm text-gray-600">COMPLETED GAMES</p>
            <h4 className="text-xl font-bold">CLASSIC</h4>
          </Card>
          <Card className="p-6 bg-gray-300 flex flex-col items-center">
            <p className="text-sm text-gray-600">ALL TIME HIGH</p>
            <h4 className="text-xl font-bold">RATING</h4>
          </Card>
          <Card className="p-6 bg-gray-300 flex flex-col items-center">
            <p className="text-sm text-gray-600">UNNAMED STAT</p>
            <h4 className="text-xl font-bold">STAT</h4>
          </Card>
        </div>
      </main>
    </div>
  );
}