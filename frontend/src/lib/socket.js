// frontend/src/lib/socket.js

import { io } from 'socket.io-client';

// IMPORTANT: Replace 'http://localhost:3000' with your actual backend URL if needed.
const BACKEND_URL = 'http://localhost:3000';

// Create a single Socket.IO client instance and export it.
// autoConnect: false allows us to connect manually in the component if desired.
export const socket = io(BACKEND_URL, {
  autoConnect: false,
});

// Optional: Listen for connection errors globally.
socket.on('connect_error', (err) => {
  console.error('Socket connect_error:', err);
});