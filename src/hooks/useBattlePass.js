import { useEffect, useRef, useState } from 'react';
import { BattlePassClient } from '../bluetooth/battlePassClient';
import { parseBattlePassData } from '../bluetooth/battlePassParser';

export const useBattlePass = ({ onSpeed, onLog }) => {
  const [status, setStatus] = useState('disconnected');
  const handlersRef = useRef({ onSpeed, onLog });
  const clientRef = useRef(null);

  useEffect(() => {
    handlersRef.current = { onSpeed, onLog };
  }, [onSpeed, onLog]);

  useEffect(() => {
    clientRef.current = new BattlePassClient({
      onPacket: (_bytes, dataView) => {
        const speed = parseBattlePassData(dataView);
        if (speed > 0) handlersRef.current.onSpeed(speed);
      },
      onStatus: (event) => {
        setStatus(event.type);
        handlersRef.current.onLog(event.type === 'connected' ? 'Battle Pass connesso.' : 'Battle Pass disconnesso.');
      },
    });
    return () => clientRef.current?.disconnect();
  }, []);

  return {
    status,
    isConnected: status === 'connected',
    connect: () => clientRef.current?.connect().catch((error) => handlersRef.current.onLog(`Bluetooth: ${error.message}`)),
    disconnect: () => clientRef.current?.disconnect(),
  };
};
