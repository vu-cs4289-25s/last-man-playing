/************************************************
 * File: frontend/src/lib/socket.js
 ************************************************/
import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:3000';

export const socket = io(BACKEND_URL, {
  autoConnect: false,
});

socket.on('connect_error', (err) => {
  console.error('Socket connect_error:', err);
});