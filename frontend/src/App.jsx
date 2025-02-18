import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HowToPlay from "./pages/HowToPlay";
import Profile from "./pages/Profile"; // <-- Import Profile Page
import "./index.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/profile" element={<Profile />} /> {/* Add Profile Route */}
      </Routes>
    </Router>
  );
}