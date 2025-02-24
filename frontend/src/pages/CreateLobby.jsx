// import React, { useState } from "react"

// function CreateLobby() {
//   const [lobbyName, setLobbyName] = useState("")
//   const [numPlayers, setNumPlayers] = useState(4)
//   const [isPrivate, setIsPrivate] = useState(false)

//   const handleCreateLobby = (event) => {
//     event.preventDefault()

//     fetch("/api/lobbies/create", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         name: lobbyName,
//         maxPlayers: numPlayers,
//         private: isPrivate
//       }),
//     })
//       .then((res) => res.json())
//       .then((newLobby) => {
//         console.log("Lobby created:", newLobby)
//       })
//       .catch((err) => console.error("Error creating lobby:", err))
//   }

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Create a Lobby</h2>
//       <form onSubmit={handleCreateLobby} className="space-y-4 w-full max-w-md">
//         <div>
//           <label className="block font-medium">Lobby Name</label>
//           <input
//             type="text"
//             value={lobbyName}
//             onChange={(e) => setLobbyName(e.target.value)}
//             className="border px-2 py-1 w-full"
//           />
//         </div>

//         <div>
//           <label className="block font-medium"># of Players</label>
//           <input
//             type="number"
//             min={2}
//             value={numPlayers}
//             onChange={(e) => setNumPlayers(Number(e.target.value))}
//             className="border px-2 py-1 w-full"
//           />
//         </div>

//         <div>
//           <p className="block font-medium mb-1">Is this room private?</p>
//           <label className="mr-4">
//             <input
//               type="radio"
//               checked={isPrivate === true}
//               onChange={() => setIsPrivate(true)}
//             />{" "}
//             Yes
//           </label>
//           <label>
//             <input
//               type="radio"
//               checked={isPrivate === false}
//               onChange={() => setIsPrivate(false)}
//             />{" "}
//             No
//           </label>
//         </div>

//         <button
//           type="submit"
//           className="bg-indigo-600 text-white px-4 py-2 rounded"
//         >
//           Create
//         </button>
//       </form>
//     </div>
//   )
// }

// export default CreateLobby

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
      {/* Top Navbar/Header */}
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">LAST MAN PLAYING</h1>
        <img
          src="/api/placeholder/40/40"
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