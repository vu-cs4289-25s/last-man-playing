// frontend/src/pages/Login.jsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gray-100">
      {/* Top Navbar/Header */}
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">LAST MAN PLAYING</h1>
        <img
          src="/api/placeholder/40/40"
          alt="Profile"
          className="w-10 h-10 rounded-full border-2 border-gray-500"
        />
      </header>

      {/* Centered Login Card */}
      <main className="flex justify-center items-center flex-1 w-full">
        <Card className="w-[450px] shadow-lg rounded-lg">
          {/* Login Title */}
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              LOG IN
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* Input Fields */}
            <div className="space-y-4">
              <div className="flex flex-col">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input id="username" placeholder="Enter your username" />
              </div>

              <div className="flex flex-col">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input id="password" type="password" placeholder="Enter your password" />
              </div>

              {/* Submit Button */}
              <Button className="w-full bg-[#0D1117] text-white hover:bg-[#161B22]">
                Save changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}