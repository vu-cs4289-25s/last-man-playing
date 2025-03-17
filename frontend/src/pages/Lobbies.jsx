// import React, { useEffect, useState } from "react"

// function Lobbies() {
//     const [lobbyList, setLobbyList] = useState([])
//     const [searchTerm, setSearchTerm] = useState("")

//     useEffect(() => {
//         fetch("/api/lobbies/public")
//         .then((res) => res.json())
//         .then((data) => setLobbyList(data))
//         .catch((error) => console.error("Lobbies error: ", error))
//     }, [])

//     // code or name?
//     const filteredLobbies = lobbyList.filter(lobby =>
//         lobby.name.toLowerCase().includes(searchTerm.toLowerCase())
//     )

//     const handleJoin = (lobbyId) => {
//         fetch(`/api/lobbies/join`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ lobbyId }),
//         })
//           .then((res) => res.json())
//           .then((result) => {
//             console.log("Joined lobby:", result)
//           })
//           .catch((err) => console.error("Error joining lobby:", err))
//       }

//       return (
//         <div className="p-4">
//           <h1 className="text-2xl font-bold mb-2">Lobbies</h1>
          
//           {/* Search Bar */}
//           <input
//             type="text"
//             placeholder="Search for lobby"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="border p-2 w-full max-w-md mb-4"
//           />
    
//           {/* Buttons to create new lobbies (could link to a “Create Lobby” page or open a modal) */}
//           <div className="flex gap-2 mb-4">
//             <button className="bg-gray-200 px-4 py-2" onClick={() => {/* open create private modal? */}}>
//               Create Lobby
//             </button>
//           </div>
    
//           {/* Lobby List */}
//           <div className="grid md:grid-cols-2 gap-2 bg-gray-100 p-4">
//             {filteredLobbies.map(lobby => (
//               <div key={lobby.id} className="bg-blue-800 text-white p-4 flex justify-between items-center">
//                 <span>{lobby.name}</span>
//                 <span>{lobby.playerCount}/{lobby.maxPlayers}</span>
//                 <button onClick={() => handleJoin(lobby.id)}>Join</button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )
// }

// export default Lobbies

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
// import { Input } from "../components/ui/input";
// import { Button } from "../components/ui/button";

// export default function CreateLobby() {
//   // change with data later
//   const username = "Nat"

//   // default state
//   const [lobbyName, setLobbyName] = useState("")
//   const [maxPlayers, setMaxPlayers] = useState(2)
//   const [isPrivate, setIsPrivate] = useState(false)
//   const numRounds = maxPlayers + 1
//   const navigate = useNavigate()

//   const handleSubmit = async (e) => { 
//     e.preventDefault()

//     const finLobbyName = lobbyName.trim() || `${username}'s Lobby`

//     const newLobbyData = {
//       name: finLobbyName,
//       maxPlayers,
//       isPrivate,
//       numRounds,
//     }

//     try {
//       const res = await fetch("/lobbies/create", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newLobbyData),
//       })

//       if (!res.ok) {
//         throw new Error(`Error Creating Lobby: ${res.status}`)
//       }

//       const createdLobby = await res.json()
//       console.log("Lobby created successfully", createdLobby)

//       navigate("/loading-lobby")
//     } catch (err) {
//       console.error("Create Lobby Error:", err)
//     }
//   }

//   const handleBack = () => {
//     navigate(-1)
//   }

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100">
//       {/* Top Navbar/Header */}
//       <header className="w-full bg-gray-300 py-4 px-6 flex justify-between items-center">
//         <h1 className="text-2xl font-bold tracking-wide">LAST MAN PLAYING</h1>
//         <img
//           src="/api/placeholder/40/40"
//           alt="Profile"
//           className="w-10 h-10 rounded-full border-2 border-gray-500"
//         />
//       </header>

//       <main className="flex flex-col flex-1 items-center justify-center p-4">
//         <Card className="w-full max-w-2xl p-6 bg-white shadow-lg">
//           <CardHeader className="mb-6">
//             <CardTitle className="text-3xl text-center">Create Lobby</CardTitle>
//           </CardHeader>

//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Lobby Name */}
//               <div>
//                 <label className="block mb-1 font-medium">Lobby Name</label>
//                 <Input
//                   type="text"
//                   value={lobbyName}
//                   onChange={(e) => setLobbyName(e.target.value)}
//                   placeholder="name"
//                   className="w-full"
//                 />
//               </div>

//               {/* Number of Players */}
//               <div>
//                 <label className="block mb-1 font-medium">Number of Players</label>
//                 <select
//                   value={maxPlayers}
//                   onChange={(e) => setMaxPlayers(Number(e.target.value))}
//                   className="w-full border border-gray-300 rounded-md px-3 py-2"
//                 >
//                   {[2, 3, 4, 5].map((num) => (
//                     <option key={num} value={num}>
//                       {num} players
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Rounds (read-only) */}
//               <div>
//                 <label className="block mb-1 font-medium">Rounds</label>
//                 <div className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2">
//                   {numRounds} rounds
//                 </div>
//               </div>

//               {/* Public / Private Toggle */}
//               <div className="flex gap-4 items-center">
//                 <label className="font-medium">Public</label>
//                 <input
//                   type="radio"
//                   name="privacy"
//                   checked={!isPrivate}
//                   onChange={() => setIsPrivate(false)}
//                 />

//                 <label className="font-medium">Private</label>
//                 <input
//                   type="radio"
//                   name="privacy"
//                   checked={isPrivate}
//                   onChange={() => setIsPrivate(true)}
//                 />
//               </div>

//               {/* Action Buttons */}
//               <div className="flex justify-between mt-8">
//                 <Button
//                   type="button"
//                   onClick={handleBack}
//                   className="bg-gray-200 text-gray-700 hover:bg-gray-300"
//                 >
//                   Back
//                 </Button>

//                 <Button type="submit" className="bg-[#0D1117] text-white hover:bg-[#161B22]">
//                   Create
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </main>
//     </div>
//   )
// }

// frontend/src/pages/Lobbies.jsx

import React, { useEffect, useState }  from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
//import create lobby button from shadcn
//import lobby buttons from shadcn
//import shadcn menu item

function normalizeLobbyName(str) {
  return str.toLowerCase().replace(/[^a-z0-9 ]/g, "")
}

export default function Lobbies () {
  // lobbylist has to include lobby name, num of players joined, num of players in lobby
  const [lobbies, setLobbies] = useState([])
  //search lobbynames
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetch ("/api/lobbies/public").then((res) => res.json()).then((data) => {setLobbies(data)})
    .catch((error) => {console.error("Lobbies error:", error)    
    })

  }, [])

  const filteredLobbies = lobbies.filter((lobby) =>
    normalizeLobbyName(lobby.name).includes(normalizeLobbyName(searchTerm))
  )

  const handleJoin = (lobbyId) => {
    fetch("/api/lobbies/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lobbyId }),
    })
      .then((res) => res.json())
      .then((result) => {
        console.log("Joined lobby:", result)
        // Go to LoadingLobby page (adjust route as needed)
        navigate("/loading-lobby")
      })
      .catch((err) => console.error("Error joining lobby:", err))
  }

  const handleCreateLobby = () => {
    navigate("/CreateLobby")
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login")
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">LAST MAN PLAYING</h1>
        {/* Profile Icon */}
        <div className="flex items-center gap-4">
          <img
              src="https://via.placeholder.com/40" // Replace with actual profile image URL
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-gray-500"
          />
          <Button onClick={handleLogout} className="bg-red-500 text-white hover:bg-red-600">
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-4 flex flex-col items-center">
        <Card className="w-full max-w-5xl">
          {/* Title & Search */}
          <CardHeader>
            <CardTitle className="text-2xl font-bold">LOBBIES</CardTitle>
          </CardHeader>

          <CardContent>
            {/* Search Input */}
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search for lobby"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md"
              />
            </div>

            {/* Create Lobby Buttons */}
            <div className="mb-4 flex gap-2">
              <Button
                onClick={() => handleCreateLobby(true)}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Create Lobby
              </Button>
            </div>

            {/* Lobbies List Container */}
            {/* 
              Option A (Tailwind-only approach): 
              Just wrap the list in a div with a fixed max-height, overflow-y-auto 
            */}
            <div className="bg-white border p-4 rounded-md max-h-[400px] overflow-y-auto">
              {/* Option B: If you have a ScrollArea component from shadcn:
                  <ScrollArea className="h-96 w-full">
                    {...map lobbies...}
                  </ScrollArea>
               */}
              {filteredLobbies.length === 0 ? (
                <p className="text-gray-500">No lobbies found.</p>
              ) : (
                filteredLobbies.map((lobby) => (
                  <div
                    key={lobby.id}
                    className="bg-blue-800 text-white rounded-md p-4 mb-2 flex justify-between items-center"
                  >
                    <span className="font-semibold">{lobby.name}</span>
                    <span>
                      {lobby.playerCount}/{lobby.maxPlayers}
                    </span>
                    <Button onClick={() => handleJoin(lobby.id)}>
                      Join
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )

}



//navbar
//lobbies header
//create fram thru html/style
