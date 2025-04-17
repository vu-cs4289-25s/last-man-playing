import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HowToPlay from "./pages/HowToPlay";
import Profile from "./pages/Profile";
import "./index.css";
import Leaderboard from "./pages/Leaderboard";
import LoadingLobby from "./pages/LoadingLobby";
import CreateLobby from "./pages/CreateLobby";
import Lobbies from "./pages/Lobbies";
import ReactionGame from "./pages/ReactionGame";
import RockPaperScissors from "./pages/RockPaperScissors";
import TypingGame from "./pages/TypingGame.jsx";
import { UserProvider } from "../context/UserContext.jsx";
import MathBlitz from "./pages/MathBlitz";
import SequenceMemoryGame from "./pages/SequenceMemoryGame.jsx";


export default function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/how-to-play" element={<HowToPlay />} />
          <Route path="/profile" element={<Profile />} />{" "}
          {/* Add Profile Route */}
          <Route path="/leaderboard" element={<Leaderboard />} />{" "}
          {/* Add Leaderboard Route after games are made */}
          <Route path="/loadinglobby" element={<LoadingLobby />} />{" "}
          {/* Add loading lobby Route after games state development*/}
          <Route path="/createlobby" element={<CreateLobby />} />
          <Route path="/lobbies" element={<Lobbies />} />
          <Route path="/reactiongame" element={<ReactionGame />} />
          <Route path="/rps" element={<RockPaperScissors />} />
          <Route path="/typinggame" element={<TypingGame />} />
          <Route path="/mathblitz" element={<MathBlitz />} />
          <Route path="/sequencegame" element={<SequenceMemoryGame />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}
