import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function CreateLobby() {
  // change with data later
  const username = "Nat"

  // default state
  const [lobbyName, setLobbyName] = useState("")
  const [maxPlayers, setMaxPlayers] = useState(2)
  const [isPrivate, setIsPrivate] = useState(false)
  const numRounds = maxPlayers + 1
  const navigate = useNavigate()

  const handleSubmit = async (e) => { 
    e.preventDefault()

    const finLobbyName = lobbyName.trim() || `${username}'s Lobby`

    const newLobbyData = {
      name: finLobbyName,
      maxPlayers,
      isPrivate,
      numRounds,
    }

    try {
      const res = await fetch("/lobbies/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLobbyData),
      })

      if (!res.ok) {
        throw new Error(`Error Creating Lobby: ${res.status}`)
      }

      const createdLobby = await res.json()
      console.log("Lobby created successfully", createdLobby)

      navigate("/loading-lobby")
    } catch (err) {
      console.error("Create Lobby Error:", err)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
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

      <main className="flex flex-col flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-6 bg-white shadow-lg">
          <CardHeader className="mb-6">
            <CardTitle className="text-3xl text-center">Create Lobby</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Lobby Name */}
              <div>
                <label className="block mb-1 font-medium">Lobby Name</label>
                <Input
                  // add restrictions to lobby names
                  type="text"
                  value={lobbyName}
                  onChange={(e) => setLobbyName(e.target.value)}
                  placeholder="name"
                  className="w-full"
                />
              </div>

              {/* Number of Players */}
              <div>
                <label className="block mb-1 font-medium">Number of Players</label>
                <select
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {[2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} players
                    </option>
                  ))}
                </select>
              </div>

              {/* Rounds (read-only) */}
              <div>
                <label className="block mb-1 font-medium">Rounds</label>
                <div className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2">
                  {numRounds} rounds
                </div>
              </div>

              {/* Public / Private Toggle */}
              <div className="flex gap-4 items-center">
                <label className="font-medium">Public</label>
                <input
                  type="radio"
                  name="privacy"
                  checked={!isPrivate}
                  onChange={() => setIsPrivate(false)}
                />

                <label className="font-medium">Private</label>
                <input
                  type="radio"
                  name="privacy"
                  checked={isPrivate}
                  onChange={() => setIsPrivate(true)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  onClick={handleBack}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Back
                </Button>

                <Button type="submit" className="bg-[#0D1117] text-white hover:bg-[#161B22]">
                  Create
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}