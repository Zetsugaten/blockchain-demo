const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

const { Blockchain } = require('./src/blockchain');
const { FileTracker } = require('./src/fileTracker');

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

app.use(cors({
  origin: FRONTEND_URL === '*' ? '*' : [FRONTEND_URL, /localhost/, /127\.0\.0\.1/],
  methods: ['GET', 'POST']
}));
app.use(express.json());

// ─── Local IP ─────────────────────────────────────────────────────────────────
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  let fallback = null;
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        // Prefer local LAN (Wi-Fi) addresses
        if (/^192\.168\./.test(iface.address) || /^10\./.test(iface.address) ||
            /^172\.(1[6-9]|2\d|3[01])\./.test(iface.address)) {
          return iface.address;
        }
        if (!fallback) fallback = iface.address;
      }
    }
  }
  return fallback || 'localhost';
}
const LOCAL_IP = getLocalIP();

// ─── Core modules ─────────────────────────────────────────────────────────────
const blockchain = new Blockchain();
const fileTracker = new FileTracker();

// ─── Viewer session store ─────────────────────────────────────────────────────
// viewers: Map<wsClient, { id, name, color, connectedAt }>
const viewers = new Map();

const VIEWER_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#f43f5e',
  '#06b6d4', '#a855f7', '#ec4899', '#84cc16'
];
let colorIndex = 0;

const DEVICE_ICONS = ['💻', '📱', '🖥️', '⌚', '📟', '🖨️'];

// ─── WebSocket broadcast ───────────────────────────────────────────────────────
function broadcast(event, payload, excludeClient = null) {
  const message = JSON.stringify({ event, payload, ts: Date.now() });
  wss.clients.forEach(client => {
    if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function broadcastAll(event, payload) {
  broadcast(event, payload, null);
}

function getViewersList() {
  return Array.from(viewers.values()).map(v => ({
    id: v.id, name: v.name, color: v.color, icon: v.icon, connectedAt: v.connectedAt
  }));
}

function broadcastState() {
  broadcastAll('STATE_UPDATE', {
    chain: blockchain.toJSON(),
    files: fileTracker.getAll(),
    stats: blockchain.getChainStats(),
    viewers: getViewersList()
  });
}

// ─── WebSocket connection handling ─────────────────────────────────────────────
wss.on('connection', (ws, req) => {
  const viewerId = uuidv4();
  const color = VIEWER_COLORS[colorIndex % VIEWER_COLORS.length];
  const icon = DEVICE_ICONS[colorIndex % DEVICE_ICONS.length];
  colorIndex++;

  // Default name — client can rename
  const viewerName = `Dispositivo ${viewers.size + 1}`;

  viewers.set(ws, { id: viewerId, name: viewerName, color, icon, connectedAt: Date.now() });
  console.log(`[WS] Connected: ${viewerName} (${viewerId.slice(0, 8)})`);

  // Send full state to new client
  ws.send(JSON.stringify({
    event: 'INIT',
    payload: {
      viewerId,
      viewerName,
      viewerColor: color,
      viewerIcon: icon,
      chain: blockchain.toJSON(),
      files: fileTracker.getAll(),
      stats: blockchain.getChainStats(),
      viewers: getViewersList(),
      serverIP: LOCAL_IP,
      serverPort: PORT
    }
  }));

  // Notify everyone a new viewer joined
  broadcast('VIEWER_JOINED', {
    viewer: viewers.get(ws),
    viewers: getViewersList()
  }, ws);

  // Handle messages from client
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'SET_NAME') {
        const viewer = viewers.get(ws);
        if (viewer) {
          viewer.name = msg.payload.name.slice(0, 24);
          broadcastAll('VIEWER_UPDATED', { viewers: getViewersList() });
        }
      }
    } catch (e) { /* ignore */ }
  });

  ws.on('close', () => {
    const viewer = viewers.get(ws);
    if (viewer) {
      console.log(`[WS] Disconnected: ${viewer.name}`);
      viewers.delete(ws);
      broadcastAll('VIEWER_LEFT', {
        viewerId: viewer.id,
        viewerName: viewer.name,
        viewers: getViewersList()
      });
    }
  });

  ws.on('error', () => ws.close());
});

// ─── REST API ──────────────────────────────────────────────────────────────────

// Server info (IP, URL for QR code)
app.get('/api/info', (req, res) => {
  res.json({
    localIP: LOCAL_IP,
    port: PORT,
    frontendURL: `http://${LOCAL_IP}:5173`,
    viewers: getViewersList()
  });
});

// GET full blockchain
app.get('/api/chain', (req, res) => {
  res.json({ chain: blockchain.toJSON(), stats: blockchain.getChainStats() });
});

// GET all files
app.get('/api/files', (req, res) => {
  res.json(fileTracker.getAll());
});

// GET chain validation
app.get('/api/validate', (req, res) => {
  res.json(blockchain.isChainValid());
});

// POST modify a file → creates a new block
app.post('/api/files/:fileId/update', (req, res) => {
  const { fileId } = req.params;
  const { viewerId, viewerName, content, action = 'UPDATE' } = req.body;

  if (!viewerId || !content) {
    return res.status(400).json({ error: 'viewerId and content are required' });
  }

  const file = fileTracker.get(fileId);
  if (!file) return res.status(404).json({ error: 'File not found' });

  try {
    const updateResult = fileTracker.update(fileId, content, viewerName || viewerId);

    const block = blockchain.addBlock({
      action,
      fileId,
      fileName: file.name,
      fileHash: updateResult.newHash,
      previousFileHash: updateResult.oldHash,
      version: updateResult.version,
      modifiedBy: viewerName || viewerId,
      modifiedById: viewerId
    }, viewerName || viewerId);

    // Broadcast to ALL devices — this is the dramatic moment!
    broadcastAll('FILE_CHANGED', {
      block: { index: block.index, hash: block.hash, data: block.data, nonce: block.nonce },
      file: fileTracker.get(fileId),
      modifiedBy: { id: viewerId, name: viewerName },
      chain: blockchain.toJSON(),
      stats: blockchain.getChainStats()
    });

    res.json({
      success: true,
      block: { index: block.index, hash: block.hash, nonce: block.nonce },
      file: fileTracker.get(fileId),
      validation: blockchain.isChainValid()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST tamper with a block
app.post('/api/tamper/block/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const { viewerName } = req.body;

  try {
    const tamperedBlock = blockchain.tamperBlock(index, {
      message: '🚨 DADOS ADULTERADOS!',
      hackedAt: new Date().toISOString(),
      hackedBy: viewerName || 'Atacante Desconhecido'
    });
    const validation = blockchain.isChainValid();

    broadcastAll('TAMPER_DETECTED', {
      blockIndex: index,
      tamperedBlock: { index: tamperedBlock.index, hash: tamperedBlock.hash },
      validation,
      hackedBy: viewerName,
      chain: blockchain.toJSON(),
      stats: blockchain.getChainStats()
    });

    res.json({ success: true, validation });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST restore chain
app.post('/api/restore', (req, res) => {
  blockchain.restoreChain();
  broadcastAll('CHAIN_RESTORED', {
    chain: blockchain.toJSON(),
    stats: blockchain.getChainStats()
  });
  res.json({ success: true });
});

// POST reset demo
app.post('/api/reset', (req, res) => {
  blockchain.chain = [blockchain.createGenesisBlock()];
  const ft = fileTracker.files;
  for (const fid in ft) {
    ft[fid].history = [];
    ft[fid].version = 1;
    ft[fid].lastModifiedBy = 'SYSTEM';
    ft[fid].lastModifiedAt = Date.now();
  }
  broadcastAll('DEMO_RESET', {
    chain: blockchain.toJSON(),
    files: fileTracker.getAll(),
    stats: blockchain.getChainStats()
  });
  res.json({ success: true });
});

// ─── Start ─────────────────────────────────────────────────────────────────────
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🔗 Blockchain Demo Backend`);
  console.log(`   Local:     http://localhost:${PORT}/api`);
  console.log(`   Rede:      http://${LOCAL_IP}:${PORT}/api`);
  console.log(`   Frontend:  ${FRONTEND_URL}`);
  console.log(`   (para conectar celulares use o IP acima)\n`);
});
