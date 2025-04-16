// frontend/src/lib/socket.js

import { io } from "socket.io-client";

export const socket = io("http://localhost:4000", {
  path: "/socket.io",
  autoConnect: true,
  withCredentials: true,
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("Socket connected successfully!");
});

socket.on("connect_error", (err) => {
  console.error("Socket connect_error:", err);
});
