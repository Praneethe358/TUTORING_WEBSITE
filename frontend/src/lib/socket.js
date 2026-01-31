import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
      
      // Reconnection configuration
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });
    
    socket.on('connect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Socket] Connected:', socket.id);
      }
    });
    
    socket.on('disconnect', (reason) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Socket] Disconnected:', reason);
      }
      
      // Reconnect if server initiated disconnect
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });
    
    socket.on('reconnect', (attemptNumber) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
      }
    });
    
    socket.on('reconnect_attempt', (attemptNumber) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Socket] Reconnection attempt', attemptNumber);
      }
    });
    
    socket.on('reconnect_error', (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Socket] Reconnection error:', error);
      }
    });
    
    socket.on('reconnect_failed', () => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Socket] Reconnection failed');
      }
    });
    
    socket.on('connect_error', (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Socket] Connection error:', error);
      }
    });
  }
  return socket;
};

export default getSocket;