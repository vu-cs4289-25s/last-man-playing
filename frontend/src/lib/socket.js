import { io } from 'socket.io-client';

export const socket = io('/', {
  path: '/socket.io',
  autoConnect: true,
});

socket.on('connect_error', (err) => {
  console.error('Socket connect_error', err);
});