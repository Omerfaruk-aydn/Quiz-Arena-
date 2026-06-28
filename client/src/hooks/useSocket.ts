import { useEffect, useRef, useState } from 'react';
import { getSocket, disconnectSocket, type QuizSocket } from '../socket/socketClient';

interface UseSocketOptions {
  autoConnect?: boolean;
}

export function useSocket(options: UseSocketOptions = { autoConnect: true }) {
  const { autoConnect } = options;
  const socketRef = useRef<QuizSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!autoConnect) return;
    const socket = getSocket();
    socketRef.current = socket;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [autoConnect]);

  return {
    socket: socketRef.current,
    isConnected,
    disconnect: disconnectSocket,
  };
}
