import React, { useState } from "react"

function CreateLobby() {
  const [lobbyName, setLobbyName] = useState("")
  const [numPlayers, setNumPlayers] = useState(4)
  const [isPrivate, setIsPrivate] = useState(false)

  const handleCreateLobby = (event) => {
    event.preventDefault()

    fetch("/api/lobbies/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: lobbyName,
        maxPlayers: numPlayers,
        private: isPrivate
      }),
    })
      .then((res) => res.json())
      .then((newLobby) => {
        console.log("Lobby created:", newLobby)
      })
      .catch((err) => console.error("Error creating lobby:", err))
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Create a Lobby</h2>
      <form onSubmit={handleCreateLobby} className="space-y-4 w-full max-w-md">
        <div>
          <label className="block font-medium">Lobby Name</label>
          <input
            type="text"
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
            className="border px-2 py-1 w-full"
          />
        </div>

        <div>
          <label className="block font-medium"># of Players</label>
          <input
            type="number"
            min={2}
            value={numPlayers}
            onChange={(e) => setNumPlayers(Number(e.target.value))}
            className="border px-2 py-1 w-full"
          />
        </div>

        <div>
          <p className="block font-medium mb-1">Is this room private?</p>
          <label className="mr-4">
            <input
              type="radio"
              checked={isPrivate === true}
              onChange={() => setIsPrivate(true)}
            />{" "}
            Yes
          </label>
          <label>
            <input
              type="radio"
              checked={isPrivate === false}
              onChange={() => setIsPrivate(false)}
            />{" "}
            No
          </label>
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Create
        </button>
      </form>
    </div>
  )
}

export default CreateLobby
