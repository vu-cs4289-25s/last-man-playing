import { io } from 'socket.io-client';

export const socket = io({
  autoConnect: false,
});

socket.on('connect_error', (err) => {
  console.error('Socket connect_error', err);
});