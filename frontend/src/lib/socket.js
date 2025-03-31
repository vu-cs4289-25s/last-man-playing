/************************************************
 * File: frontend/src/lib/socket.js
 ************************************************/
import { io } from 'socket.io-client';

// This points to your local dev server at port 3000, which proxies to 4000
const BACKEND_URL = 'http://localhost:3000';

export const socket = io(BACKEND_URL, {
  autoConnect: false, // We'll connect manually from components
});

// Debug error
socket.on('connect_error', (err) => {
  console.error('Socket connect_error:', err);
});