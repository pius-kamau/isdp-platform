import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

const SOCKET_URL = 'https://isdp-backend.onrender.com';

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('❌ No token found, skipping socket connection');
      return;
    }

    // Only create socket if it doesn't exist
    if (socketRef.current && socketRef.current.connected) {
      console.log('✅ Socket already connected');
      return;
    }

    console.log('🔄 Initializing socket connection...', SOCKET_URL);
    
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      forceNew: false,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      setIsConnected(true);
      
      // Send user online event
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          newSocket.emit('user_online', { userId: user.id });
          console.log('📡 Sent user_online event for:', user.id);
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected. Reason:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      
      // Re-send user online event on reconnect
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          newSocket.emit('user_online', { userId: user.id });
          console.log('📡 Sent user_online event on reconnect for:', user.id);
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Reconnect attempt:', attemptNumber);
    });

    return () => {
      console.log('🧹 Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Separate effect to handle token changes and reconnection
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && socketRef.current && !socketRef.current.connected) {
      console.log('🔄 Token found, reconnecting socket...');
      socketRef.current.connect();
    }
  }, [localStorage.getItem('accessToken')]);

  const value = {
    socket: socketRef.current,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    console.warn('useSocket must be used within a SocketProvider');
    return null;
  }
  return context.socket;
}

export function useSocketConnection() {
  const context = useContext(SocketContext);
  if (!context) {
    console.warn('useSocketConnection must be used within a SocketProvider');
    return false;
  }
  return context.isConnected;
}

export default SocketContext;
