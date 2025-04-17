// frontend/src/lib/socket.js

import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const socket = SOCKET_URL
    ? io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    })
    : io({ path: "/socket.io", transports: ["websocket", "polling"] });

socket.on("connect", () => {
  console.log("Socket connected successfully!");
});

socket.on("connect_error", (err) => {
  console.error("Socket connect_error:", err);
});
