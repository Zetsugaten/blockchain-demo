import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const BlockchainContext = createContext(null);

// Em produção (Vercel), usa VITE_BACKEND_URL; em dev usa o hostname local
const BACKEND   = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:3001`;
const API_BASE  = `${BACKEND}/api`;
const WS_URL    = BACKEND.replace(/^http/, 'ws') + '/ws';


export function BlockchainProvider({ children }) {
  const [chain, setChain]         = useState([]);
  const [files, setFiles]         = useState([]);
  const [stats, setStats]         = useState(null);
  const [viewers, setViewers]     = useState([]);
  const [connected, setConnected] = useState(false);
  const [log, setLog]             = useState([]);
  const [mining, setMining]       = useState(false);
  const [serverIP, setServerIP]   = useState('');
  const [notification, setNotification] = useState(null); // dramatic overlay

  // MY viewer info
  const [myId, setMyId]       = useState('');
  const [myName, setMyName]   = useState('');
  const [myColor, setMyColor] = useState('#6366f1');
  const [myIcon, setMyIcon]   = useState('💻');

  const wsRef = useRef(null);

  const addLog = useCallback((icon, message, type = 'info') => {
    setLog(prev => [
      { id: Date.now() + Math.random(), icon, message, type, time: new Date().toLocaleTimeString('pt-BR') },
      ...prev.slice(0, 99)
    ]);
  }, []);

  const showNotification = useCallback((data) => {
    setNotification(data);
    setTimeout(() => setNotification(null), 6000);
  }, []);

  const applyPartial = useCallback((payload) => {
    if (payload.chain)   setChain(payload.chain);
    if (payload.files)   setFiles(payload.files);
    if (payload.stats)   setStats(payload.stats);
    if (payload.viewers) setViewers(payload.viewers);
  }, []);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);

      ws.onmessage = (evt) => {
        const { event, payload } = JSON.parse(evt.data);

        switch (event) {
          case 'INIT':
            setMyId(payload.viewerId);
            setMyName(payload.viewerName);
            setMyColor(payload.viewerColor);
            setMyIcon(payload.viewerIcon);
            setServerIP(payload.serverIP);
            applyPartial(payload);
            addLog('🔌', 'Conectado à blockchain');
            break;

          case 'STATE_UPDATE':
            applyPartial(payload);
            break;

          case 'FILE_CHANGED':
            applyPartial(payload);
            setMining(false);
            addLog('📦', `Bloco #${payload.block.index} — ${payload.file.name} modificado por ${payload.modifiedBy.name}`);
            showNotification({
              type: 'file_changed',
              title: '📦 ARQUIVO MODIFICADO',
              subtitle: payload.file.name,
              detail: `por ${payload.modifiedBy.name}`,
              blockIndex: payload.block.index,
              blockHash: payload.block.hash,
              color: 'emerald'
            });
            break;

          case 'VIEWER_JOINED':
            setViewers(payload.viewers);
            addLog('📡', `${payload.viewer.name} entrou na rede`);
            break;

          case 'VIEWER_LEFT':
            setViewers(payload.viewers);
            addLog('📡', `${payload.viewerName} saiu da rede`);
            break;

          case 'VIEWER_UPDATED':
            setViewers(payload.viewers);
            break;

          case 'TAMPER_DETECTED':
            applyPartial(payload);
            addLog('⚠️', `Adulteração detectada no Bloco #${payload.blockIndex}!`);
            showNotification({
              type: 'tamper',
              title: '🚨 ADULTERAÇÃO DETECTADA',
              subtitle: `Bloco #${payload.blockIndex} foi modificado`,
              detail: `por ${payload.hackedBy || 'atacante'}`,
              blockIndex: payload.blockIndex,
              blockHash: payload.tamperedBlock?.hash,
              color: 'rose'
            });
            break;

          case 'CHAIN_RESTORED':
            applyPartial(payload);
            addLog('✅', 'Cadeia restaurada e íntegra');
            showNotification({
              type: 'restored',
              title: '✅ CADEIA RESTAURADA',
              subtitle: 'Integridade verificada',
              detail: 'todos os hashes válidos',
              color: 'emerald'
            });
            break;

          case 'DEMO_RESET':
            applyPartial(payload);
            setFiles(payload.files || []);
            addLog('🔄', 'Demo reiniciado');
            break;

          default:
            break;
        }
      };

      ws.onclose = () => {
        setConnected(false);
        addLog('🔌', 'Reconectando…');
        setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
    }

    connect();
    return () => wsRef.current?.close();
  }, [addLog, applyPartial, showNotification]);

  // Set my device name
  const setDeviceName = useCallback((name) => {
    setMyName(name);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: 'SET_NAME', payload: { name } }));
    }
  }, []);

  // API methods
  const updateFile = useCallback(async (fileId, content, action = 'UPDATE') => {
    setMining(true);
    addLog('⛏️', `Minerando bloco para ${fileId}…`);
    const res = await fetch(`${API_BASE}/files/${fileId}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ viewerId: myId, viewerName: myName, content, action })
    });
    const data = await res.json();
    setMining(false);
    return data;
  }, [myId, myName, addLog]);

  const tamperBlock = useCallback(async (blockIndex) => {
    addLog('💥', `Adulterando Bloco #${blockIndex}…`);
    const res = await fetch(`${API_BASE}/tamper/block/${blockIndex}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ viewerName: myName })
    });
    return res.json();
  }, [myName, addLog]);

  const restoreChain = useCallback(async () => {
    const res = await fetch(`${API_BASE}/restore`, { method: 'POST' });
    return res.json();
  }, []);

  const resetDemo = useCallback(async () => {
    const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
    return res.json();
  }, []);

  const dismissNotification = useCallback(() => setNotification(null), []);

  return (
    <BlockchainContext.Provider value={{
      chain, files, stats, viewers, connected, log, mining,
      serverIP, notification, dismissNotification,
      myId, myName, myColor, myIcon,
      setDeviceName,
      updateFile, tamperBlock, restoreChain, resetDemo
    }}>
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const ctx = useContext(BlockchainContext);
  if (!ctx) throw new Error('useBlockchain must be used inside BlockchainProvider');
  return ctx;
}
