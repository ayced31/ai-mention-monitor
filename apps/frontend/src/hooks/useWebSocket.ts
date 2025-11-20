import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';
import { useRealtimeStore } from '@/stores/realtimeStore';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { accessToken, isAuthenticated } = useAuthStore();
  const { setConnected, addEvent } = useRealtimeStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    // Connect socket
    socketRef.current = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    socketRef.current.on('mention:new', (data) => {
      addEvent({
        type: 'mention:new',
        data,
        timestamp: new Date().toISOString(),
      });
    });

    socketRef.current.on('alert:triggered', (data) => {
      addEvent({
        type: 'alert:triggered',
        data,
        timestamp: new Date().toISOString(),
      });
    });

    socketRef.current.on('query:checked', (data) => {
      addEvent({
        type: 'query:checked',
        data,
        timestamp: new Date().toISOString(),
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, accessToken, setConnected, addEvent]);

  const subscribeToBrand = (brandId: string) => {
    socketRef.current?.emit('subscribe:brand', brandId);
  };

  const unsubscribeFromBrand = (brandId: string) => {
    socketRef.current?.emit('unsubscribe:brand', brandId);
  };

  const subscribeToQuery = (queryId: string) => {
    socketRef.current?.emit('subscribe:query', queryId);
  };

  const unsubscribeFromQuery = (queryId: string) => {
    socketRef.current?.emit('unsubscribe:query', queryId);
  };

  return {
    subscribeToBrand,
    unsubscribeFromBrand,
    subscribeToQuery,
    unsubscribeFromQuery,
  };
};
