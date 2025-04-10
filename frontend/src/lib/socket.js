/************************************************
 * File: frontend/src/lib/socket.js
 ************************************************/
import { io } from "socket.io-client";

// Make sure this matches your backend server port
const BACKEND_URL = "http://localhost:3000"; // Change this to match your backend port

export const socket = io("/", {
  path: "/socket.io",
  autoConnect: true,
  withCredentials: true, // Add this for CORS
});

socket.on("connect_error", (err) => {
  console.error("Socket connect_error:", err);
});
