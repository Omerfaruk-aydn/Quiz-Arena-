import { useEffect, useState } from 'react';
import { getSocket, disconnectSocket, type QuizSocket } from '../socket/socketClient';

interface UseSocketOptions {
  autoConnect?: boolean;
}

export function useSocket(options: UseSocketOptions = { autoConnect: true }) {
  const { autoConnect } = options;
  const [socket, setSocket] = useState<QuizSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!autoConnect) return;
    const s = getSocket();
    setSocket(s);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    setIsConnected(s.connected);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, [autoConnect]);

  return {
    socket,
    isConnected,
    disconnect: disconnectSocket,
  };
}
