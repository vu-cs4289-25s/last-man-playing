import React, { useEffect, useState } from "react"

function Lobbies() {
    const [lobbyList, setLobbyList] = useState([])
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetch("/api/lobbies/public")
        .then((res) => res.json())
        .then((data) => setLobbyList(data))
        .catch((error) => console.error("Lobbies error: ", error))
    }, [])

    // code or name?
    const filteredLobbies = lobbyList.filter(lobby =>
        lobby.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleJoin = (lobbyId) => {
        fetch(`/api/lobbies/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lobbyId }),
        })
          .then((res) => res.json())
          .then((result) => {
            console.log("Joined lobby:", result)
          })
          .catch((err) => console.error("Error joining lobby:", err))
      }

      return (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-2">Lobbies</h1>
          
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search for lobby"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 w-full max-w-md mb-4"
          />
    
          {/* Buttons to create new lobbies (could link to a “Create Lobby” page or open a modal) */}
          <div className="flex gap-2 mb-4">
            <button className="bg-gray-200 px-4 py-2" onClick={() => {/* open create private modal? */}}>
              Create Lobby
            </button>
          </div>
    
          {/* Lobby List */}
          <div className="grid md:grid-cols-2 gap-2 bg-gray-100 p-4">
            {filteredLobbies.map(lobby => (
              <div key={lobby.id} className="bg-blue-800 text-white p-4 flex justify-between items-center">
                <span>{lobby.name}</span>
                <span>{lobby.playerCount}/{lobby.maxPlayers}</span>
                <button onClick={() => handleJoin(lobby.id)}>Join</button>
              </div>
            ))}
          </div>
        </div>
      )
}

export default Lobbies
