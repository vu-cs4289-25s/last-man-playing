import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HowToPlay from "./pages/HowToPlay";
import Profile from "./pages/Profile"; // <-- Import Profile Page
import "./index.css";
import Leaderboard from "./pages/Leaderboard";
import LoadingLobby from "./pages/LoadingLobby";
import CreateLobby from "./pages/CreateLobby";
import Lobbies from "./pages/Lobbies";
import ReactionGame from "./pages/ReactionGame";
import RockPaperScissors from "./pages/RockPaperScissors";
import TypingGame from "./pages/TypingGame.jsx";
import MathBlitz from "./pages/MathBlitz";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/how-to-play"
          element={
            <ProtectedRoute>
              <HowToPlay />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loadinglobby"
          element={
            <ProtectedRoute>
              <LoadingLobby />
            </ProtectedRoute>
          }
        />
        <Route
          path="/createlobby"
          element={
            <ProtectedRoute>
              <CreateLobby />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lobbies"
          element={
            <ProtectedRoute>
              <Lobbies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reactiongame"
          element={
            <ProtectedRoute>
              <ReactionGame />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rps"
          element={
            <ProtectedRoute>
              <RockPaperScissors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/typinggame"
          element={
            <ProtectedRoute>
              <TypingGame />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mathblitz"
          element={
            <ProtectedRoute>
              <MathBlitz />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
