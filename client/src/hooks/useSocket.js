import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

export function useSocket(roomId) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('talklink_token');
    const isGuest = localStorage.getItem('talklink_is_guest') === 'true';
    const savedRoomId = localStorage.getItem('talklink_room_id');
    const targetRoomId = roomId || savedRoomId;

    if (!token || !targetRoomId) {
      return;
    }

    const newSocket = io('http://localhost:3000', {
      auth: {
        token,
        senderType: isGuest ? 'guest' : 'host',
        roomId: parseInt(targetRoomId)
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [roomId]);

  return socket;
}

export function useSocketEvents(socket, eventHandlers) {
  useEffect(() => {
    if (!socket || !eventHandlers) return;

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [socket, eventHandlers]);
}
