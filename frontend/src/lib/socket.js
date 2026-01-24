import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true
    });
    
    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
    });
    
    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });
    
    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
    });
  }
  return socket;
};

export default getSocket;