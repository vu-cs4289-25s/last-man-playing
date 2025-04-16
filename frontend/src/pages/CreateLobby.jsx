/************************************************
 * File: frontend/src/pages/CreateLobby.jsx
 ************************************************/
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function CreateLobby() {
  const navigate = useNavigate();
  const [lobbyName, setLobbyName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [lobbyPassword, setLobbyPassword] = useState("");
  const [username, setUsername] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(2); // not setting lobbies to max num players
  const numRounds = maxPlayers - 1;


  // On mount, ensure we have a user ID
  useEffect(() => {
    if (!localStorage.getItem("myUserId")) {
      localStorage.setItem("myUserId", crypto.randomUUID());
    }
  }, []);

  // On mount, retrieve the saved name
  useEffect(() => {
    const savedName = localStorage.getItem("myUsername") || "";
    setUsername(savedName);
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("myUserId");
    if (!userId) {
      console.error("No userId found. Creating one on the fly.");
    } // is this for guest login?

    const body = {
      lobby_name: lobbyName || `${username}'s Lobby`,
      is_private: isPrivate,
      password: isPrivate ? lobbyPassword : null,
      user_id: userId,
      max_players: maxPlayers,
    };


    try { //setMaxPLayers with dropdown 2, 3, 4, 5, 6
      const res = await fetch("/api/lobbies/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        console.log("Lobby created:", data);
        // Store the new lobby ID for reference if you want
        let leader = localStorage.getItem("myUserId");
        localStorage.setItem("lobbyLeaderId", leader)
        localStorage.setItem("lobbyId", data.lobby.lobby_id);

        navigate("/loadinglobby");
      } else {
        console.error("Create Lobby error:", data);
      }
    } catch (err) {
      console.error("Create Lobby Error:", err);
    }
  };

  // make back button
  const handleBack = () => {
    navigate("/lobbies");
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">LAST MAN PLAYING</h1>
        <img
          src="https://via.placeholder.com/40"
          alt="Profile"
          className="w-10 h-10 rounded-full border-2 border-gray-500"
        />
      </header>

      <main className="flex flex-col flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-6 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Create Lobby</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-1 font-medium">Lobby Name</label>
                <Input
                  type="text"
                  value={lobbyName}
                  onChange={(e) => setLobbyName(e.target.value)}
                  placeholder="Enter Lobby Name"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Number of Players</label>
                 <select
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                     {num} players
                    </option>
                   ))}
                </select>
              </div>

              <div>
                 <label className="block mb-1 font-medium">Rounds</label>
                 <div className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2">
                   {numRounds} rounds
                 </div>
               </div>

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

              {isPrivate && (
                <div>
                  <label className="block mb-1 font-medium">Lobby Password</label>
                  <Input
                    type="text"
                    value={lobbyPassword}
                    onChange={(e) => setLobbyPassword(e.target.value)}
                    placeholder="Enter lobby password"
                    className="w-full"
                  />
                </div>
              )}

            <div className="flex justify-between mt-8">
                <Button
                   type="button"
                   onClick={handleBack}
                   className="bg-gray-200 text-gray-700 hover:bg-gray-300">
                   Back
                </Button>

                <Button type="submit" className="bg-green-600 text-white hover:bg-green-700">
                  Create
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}