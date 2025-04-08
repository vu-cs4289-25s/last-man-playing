// /************************************************
//  * File: frontend/src/lib/socket.js
//  ************************************************/
// import { io } from 'socket.io-client';

// // const BACKEND_URL = 'http://localhost:3000';

// // export const socket = io(BACKEND_URL, {
// //   autoConnect: false,
// // });

// // socket.on('connect_error', (err) => {
// //   console.error('Socket connect_error:', err);
// // });

// export const socket = io('/', {
//   path: '/socket.io',
//   autoConnect: true,
// });

// socket.on('connect_error', (err) => {
//   console.error('Socket connect_error', err);
// });

/************************************************
 * File: frontend/src/lib/socket.js
 ************************************************/
import { io } from 'socket.io-client';

export const socket = io({
  autoConnect: false,
});

socket.on('connect_error', (err) => {
  console.error('Socket connect_error:', err);
});