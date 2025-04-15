/************************************************
 * File: frontend/src/lib/socket.js
 ************************************************/
import { io } from "socket.io-client";

// Make sure this matches your backend server port
const BACKEND_URL = "http://localhost:4000"; // Change to match backend port

export const socket = io(BACKEND_URL, {
  autoConnect: false,
  withCredentials: true, // Add this for CORS
});

socket.on("connect_error", (err) => {
  console.error("Socket connect_error:", err);
});
