// frontend/src/pages/Home.jsx

import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gray-100">
      {/* Header */}
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-center">
        <h1 className="text-2xl font-bold tracking-wide text-center">
          LAST MAN PLAYING
        </h1>
      </header>

      {/* Main Card */}
      <main className="flex justify-center items-center flex-1 w-full">
        <div className="bg-white shadow-lg rounded-lg p-10 w-[400px] flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-6">WELCOME</h2>

          {/* Buttons */}
          <div className="flex flex-col w-full space-y-4">
            <Button className="w-full" onClick={() => navigate("/login")}>
              LOG IN
            </Button>
            <Button className="w-full" onClick={() => navigate("/register")}>
              REGISTER
            </Button>
            <Button className="w-full" onClick={() => navigate("/lobbies")}>
              PLAY AS GUEST
              </Button>
            <Button className="w-full" onClick={() => navigate("/how-to-play")}>
              HOW TO PLAY
            </Button>
            <Button className="w-full" onClick={() => navigate("/profile")}>
              PROFILE
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}