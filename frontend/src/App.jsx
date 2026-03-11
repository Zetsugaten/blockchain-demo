import './index.css';
import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { BlockchainProvider, useBlockchain } from './context/BlockchainContext';

// ─── Dramatic Notification Overlay ───────────────────────────────────────────
function NotificationOverlay() {
  const { notification, dismissNotification } = useBlockchain();
  if (!notification) return null;

  const emojis = {
    file_changed: '📦',
    tamper: '🚨',
    restored: '🔒'
  };

  return (
    <div className="notif-overlay" onClick={dismissNotification} style={{ pointerEvents: 'all', cursor: 'pointer' }}>
      <div className="notif-backdrop" />
      <div className={`notif-card ${notification.color}`}>
        <div className="notif-emoji">{emojis[notification.type] || '⚡'}</div>
        <div className="notif-title">{notification.title}</div>
        <div className="notif-subtitle">{notification.subtitle}</div>
        <div className="notif-detail">{notification.detail}</div>
        {notification.blockHash && (
          <div className="notif-hash">
            Bloco #{notification.blockIndex} · {notification.blockHash.slice(0, 32)}…
          </div>
        )}
        <div className="notif-progress">
          <div className="notif-bar" />
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--t3)' }}>Clique para fechar</div>
      </div>
    </div>
  );
}

// ─── Device Name Setup (first-time modal) ────────────────────────────────────
function NameSetup({ onDone }) {
  const { myIcon, myColor, setDeviceName } = useBlockchain();
  const [name, setName] = useState('');

  const suggestions = ['Notebook', 'Celular', 'Tablet', 'PC da Sala', 'iPhone', 'Android'];

  function handleSubmit(n) {
    const finalName = (n || name).trim();
    if (!finalName) return;
    setDeviceName(finalName);
    onDone();
  }

  return (
    <div className="name-setup">
      <div className="name-card">
        <div style={{ fontSize: '3rem' }}>{myIcon}</div>
        <h1 className="grad">Blockchain Demo</h1>
        <p>Identifique este dispositivo na rede para começar. Seu nome aparecerá para todos os participantes em tempo real.</p>

        <div className="name-input-row">
          <input
            className="form-input"
            placeholder="Ex: Notebook do Gabriel"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          <button className="btn btn-primary" onClick={() => handleSubmit()}>Entrar →</button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
          {suggestions.map(s => (
            <button key={s} className="btn btn-ghost btn-sm" onClick={() => handleSubmit(s)}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
function Header() {
  const { stats, connected, mining, myName, myIcon, resetDemo } = useBlockchain();
  const valid = stats?.validation?.valid ?? true;

  return (
    <header className="header">
      <div className="header-brand">
        <span className="logo">⛓️</span>
        <span className="grad">BlockChain Demo</span>
        <span style={{ color: 'var(--t3)', fontWeight: 400, fontSize: '0.82rem' }}>— Inviolabilidade</span>
      </div>
      <div className="header-right">
        {mining && <span className="pill pill-mine"><span className="dot blink" />Minerando…</span>}
        <span className={`pill ${!connected ? 'pill-offline' : valid ? 'pill-valid' : 'pill-invalid'}`}>
          <span className="dot blink" />
          {!connected ? 'Conectando…' : valid ? 'Íntegra' : '⚠ Corrompida'}
        </span>
        <span style={{ fontSize: '0.78rem', color: 'var(--t2)' }}>{myIcon} {myName}</span>
        <button className="btn btn-ghost btn-sm" onClick={resetDemo}>🔄</button>
      </div>
    </header>
  );
}

// ─── Stats Row ────────────────────────────────────────────────────────────────
function StatsRow() {
  const { chain, viewers, stats } = useBlockchain();
  const valid = stats?.validation?.valid ?? true;

  return (
    <div className="stats-row" style={{ paddingTop: '1.1rem' }}>
      <div className="stat">
        <div className="stat-lbl">Blocos</div>
        <div className="stat-val">{chain.length}</div>
        <div className="stat-sub">na cadeia</div>
      </div>
      <div className="stat">
        <div className="stat-lbl">Dispositivos</div>
        <div className="stat-val" style={{ background: 'linear-gradient(135deg,var(--emerald),var(--cyan))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          {viewers.length}
        </div>
        <div className="stat-sub">conectados agora</div>
      </div>
      <div className="stat">
        <div className="stat-lbl">Cadeia</div>
        <div className="stat-val" style={{ background: valid ? 'linear-gradient(135deg,var(--emerald),#34d399)' : 'linear-gradient(135deg,var(--rose),#fb7185)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', fontSize:'1.1rem', marginTop:6 }}>
          {valid ? '✓ ÍNTEGRA' : '✗ INVÁLIDA'}
        </div>
        <div className="stat-sub">verificação em tempo real</div>
      </div>
      <div className="stat">
        <div className="stat-lbl">Dificuldade PoW</div>
        <div className="stat-val" style={{ background: 'linear-gradient(135deg,var(--amber),var(--rose))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{stats?.difficulty ?? 2}</div>
        <div className="stat-sub">zeros SHA-256</div>
      </div>
    </div>
  );
}

// ─── Blockchain Visualizer ───────────────────────────────────────────────────
function BlockchainVisualizer() {
  const { chain, stats, tamperBlock, myName } = useBlockchain();
  const [selected, setSelected] = useState(null);
  const [newIdx, setNewIdx] = useState(null);

  // Flash new block
  useEffect(() => {
    if (chain.length > 1) {
      const last = chain[chain.length - 1];
      setNewIdx(last.index);
      const t = setTimeout(() => setNewIdx(null), 3000);
      return () => clearTimeout(t);
    }
  }, [chain.length]);

  const validation = stats?.validation;
  const tamperedIndices = new Set(
    (validation?.errors || []).filter(e => e.type === 'HASH_MISMATCH').map(e => e.blockIndex)
  );

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="icon" style={{ color: 'var(--indigo)' }}>⛓️</span>
          Cadeia de Blocos
          <span style={{ fontSize: '0.65rem', color: 'var(--t3)', background: 'var(--bg-card2)', padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border)', fontFamily: 'var(--mono)' }}>
            SHA-256
          </span>
        </div>
        {validation && !validation.valid && (
          <span style={{ fontSize: '0.72rem', color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: 4 }}>
            ⚠️ {validation.errors?.length} erro(s)
          </span>
        )}
      </div>

      <div className="chain-wrap">
        {chain.length === 0 ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200, color:'var(--t3)', fontSize:'.85rem' }}>
            Carregando…
          </div>
        ) : (
          <div className="chain-scroll">
            {chain.map((block, i) => {
              const isGenesis = block.index === 0;
              const isTampered = tamperedIndices.has(block.index);
              const prevBlock = chain[i - 1];
              const chainBroken = prevBlock && block.previousHash !== prevBlock.hash;
              const isNew = block.index === newIdx;

              return (
                <div key={block.index} className="chain-item">
                  {i > 0 && (
                    <div className={`chain-arrow ${chainBroken ? 'broken' : ''}`} title={chainBroken ? '⚠️ Cadeia quebrada!' : 'Link válido'}>
                      {chainBroken ? '✗' : '→'}
                    </div>
                  )}
                  <div
                    className={`block ${isGenesis ? 'genesis' : ''} ${isTampered ? 'tampered' : ''} ${selected?.index === block.index ? 'selected' : ''}`}
                    onClick={() => setSelected(selected?.index === block.index ? null : block)}
                  >
                    <div className={`block-head ${isGenesis ? 'block-genesis-head' : ''}`}>
                      <span className="block-idx">#{block.index}</span>
                      {isGenesis ? <span className="block-tag tag-genesis">GENESIS</span>
                        : isTampered ? <span className="block-tag tag-tampered">ADULTERADO</span>
                        : isNew ? <span className="block-tag tag-new">NOVO!</span>
                        : <span className="block-tag tag-ok">{block.data?.action || 'OK'}</span>}
                    </div>
                    <div className="block-body">
                      <div className="hash-lbl">Hash</div>
                      <div className={`hash-val ${isTampered ? 'red' : ''}`}>{block.hash}</div>
                      <div className="hash-lbl">Hash Anterior</div>
                      <div className="prev-hash">{block.previousHash || '—'}</div>
                      <div className="block-footer">
                        <span className="block-by">{isGenesis ? '⚙️ Sistema' : `📡 ${block.data?.modifiedBy?.split(' ')[0] || '?'}`}</span>
                        <span className="block-nonce">n:{block.nonce}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <div className="card-header" style={{ borderBottom: 'none' }}>
            <div className="card-title" style={{ fontSize: '.78rem' }}>🔍 Bloco #{selected.index}</div>
            <div className="card-actions">
              {selected.index > 0 && (
                <button className="btn btn-danger btn-sm" onClick={() => tamperBlock(selected.index)}>
                  💥 Adulterar Bloco
                </button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>
          </div>
          <div className="detail-body">
            <div className="detail-row">
              <div className="detail-lbl">Hash Completo</div>
              <div className="detail-val" style={{ color: tamperedIndices.has(selected.index) ? 'var(--rose)' : 'var(--emerald)' }}>
                {chain.find(b => b.index === selected.index)?.hash}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div className="detail-row">
                <div className="detail-lbl">Nonce</div>
                <div className="detail-val">{selected.nonce}</div>
              </div>
              <div className="detail-row">
                <div className="detail-lbl">Data/Hora</div>
                <div className="detail-val">{new Date(selected.timestamp).toLocaleString('pt-BR')}</div>
              </div>
            </div>
            {selected.data && (
              <div className="detail-row">
                <div className="detail-lbl">Dados do Bloco</div>
                <div className="detail-val" style={{ whiteSpace: 'pre-wrap', maxHeight: 110, overflow: 'auto' }}>
                  {JSON.stringify(selected.data, null, 2)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Files Panel ─────────────────────────────────────────────────────────────
function FilesPanel() {
  const { files, chain, updateFile } = useBlockchain();
  const [editingFile, setEditingFile] = useState(null);
  const [changedId, setChangedId]     = useState(null);

  // Flash on change
  useEffect(() => {
    if (chain.length > 1) {
      const last = chain[chain.length - 1];
      if (last.data?.fileId) {
        setChangedId(last.data.fileId);
        setTimeout(() => setChangedId(null), 2000);
      }
    }
  }, [chain.length]);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="icon" style={{ color: 'var(--amber)' }}>📁</span>
          Arquivos Monitorados
        </div>
        <span style={{ fontSize: '.68rem', color: 'var(--t3)' }}>hash SHA-256 em tempo real</span>
      </div>

      <div className="files-grid">
        {files.map(file => {
          const latestRecord = [...chain].reverse().find(b => b.data?.fileId === file.id);
          const chainHash = latestRecord?.data?.fileHash;
          const mismatch = chainHash && chainHash !== file.hash;

          return (
            <div key={file.id} className={`file-row ${changedId === file.id ? 'just-changed' : ''}`}>
              <div className="file-big-icon">{file.icon}</div>
              <div className="file-info">
                <div className="file-name-row">
                  <span className="file-name">{file.name}</span>
                  <span className="file-ver">v{file.version}</span>
                </div>
                <div className={`file-hash ${mismatch ? 'mismatch' : ''}`}>
                  {file.hash}
                </div>
                {mismatch && <div className="mismatch-badge">⚠️ Hash inválido — adulterado!</div>}
                <div className="file-meta">
                  {file.description} · por <strong>{file.lastModifiedBy === 'SYSTEM' ? 'Sistema' : file.lastModifiedBy}</strong>
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setEditingFile(file)}>
                ✏️
              </button>
            </div>
          );
        })}
      </div>

      {editingFile && (
        <FileEditorModal
          file={editingFile}
          onSave={updateFile}
          onClose={() => setEditingFile(null)}
        />
      )}
    </div>
  );
}

function FileEditorModal({ file, onSave, onClose }) {
  const [content, setContent] = useState(file.content);
  const [action, setAction]   = useState('UPDATE');
  const [saving, setSaving]   = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(file.id, content, action);
    setSaving(false);
    onClose();
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div className="modal-title">{file.icon} Editar {file.name}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-lbl">Tipo de Ação</label>
            <select className="form-select" value={action} onChange={e => setAction(e.target.value)}>
              <option value="UPDATE">UPDATE — Atualização</option>
              <option value="CREATE">CREATE — Criação</option>
              <option value="DELETE">DELETE — Remoção</option>
              <option value="SIGN">SIGN — Assinatura Digital</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-lbl">Conteúdo (JSON)</label>
            <textarea className="form-textarea" value={content} onChange={e => setContent(e.target.value)} spellCheck={false} />
          </div>
          <div className="form-info">
            💡 Ao confirmar, um novo bloco será minerado com o hash SHA-256 do conteúdo, encadeado ao bloco anterior. Todos os dispositivos serão notificados em tempo real.
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '⛏️ Minerando bloco…' : '✓ Registrar na Blockchain'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Viewers Panel ────────────────────────────────────────────────────────────
function ViewersPanel() {
  const { viewers, myId, serverIP } = useBlockchain();
  const frontendURL = `http://${serverIP}:5173`;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="icon" style={{ color: 'var(--cyan)' }}>📡</span>
          Dispositivos na Rede
        </div>
        <span style={{ fontSize: '.68rem', color: 'var(--t2)' }}>{viewers.length} online</span>
      </div>

      <div className="viewers-list">
        {viewers.length === 0 ? (
          <div style={{ padding: '1.1rem', textAlign: 'center', color: 'var(--t3)', fontSize: '.8rem' }}>
            Aguardando conexões…
          </div>
        ) : (
          viewers.map(v => (
            <div key={v.id} className={`viewer-row ${v.id === myId ? 'me' : ''}`}>
              <div className="viewer-avatar" style={{ borderColor: v.color, background: v.color + '22' }}>
                {v.icon}
              </div>
              <div className="viewer-info">
                <div className="viewer-name">{v.name}</div>
                <div className="viewer-sub">entrou {new Date(v.connectedAt).toLocaleTimeString('pt-BR')}</div>
              </div>
              {v.id === myId && <span className="viewer-badge">Você</span>}
            </div>
          ))
        )}
      </div>

      {/* QR Code for mobile access — always visible */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <div className="card-header" style={{ borderBottom: 'none' }}>
          <div className="card-title" style={{ fontSize: '.78rem' }}>
            📱 Conectar pelo Celular
          </div>
        </div>
        <div className="qr-panel">
          {serverIP && serverIP !== 'localhost' ? (
            <>
              <div className="qr-box">
                <QRCode value={frontendURL} size={148} />
              </div>
              <div className="qr-url">{frontendURL}</div>
              <div className="qr-hint">
                📶 Conecte o celular na <strong>mesma rede Wi-Fi</strong> e escaneie o QR Code.
              </div>
            </>
          ) : (
            <div className="qr-hint" style={{ padding: '1rem 0' }}>
              ⏳ Aguardando IP da rede…<br />
              <span style={{ fontSize: '0.68rem', color: 'var(--t3)' }}>Certifique-se de estar conectado ao Wi-Fi.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tamper Panel ─────────────────────────────────────────────────────────────
function TamperPanel() {
  const { chain, files, stats, tamperBlock, restoreChain } = useBlockchain();
  const nonGenesis = chain.filter(b => b.index > 0);
  const validation = stats?.validation;
  const corrupted = validation && !validation.valid;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="icon" style={{ color: 'var(--rose)' }}>🛡️</span>
          Demonstração — Inviolabilidade
        </div>
      </div>

      <div className="tamper-body">
        <div className="tamper-warning">
          <span>⚡</span>
          <div>
            <strong style={{ color: 'var(--t1)', display: 'block', marginBottom: 3 }}>Modo de Demonstração</strong>
            Adulteração será detectada instantaneamente por todos os dispositivos via hashes SHA-256 encadeados.
          </div>
        </div>

        {nonGenesis.length > 0 && (
          <div>
            <div style={{ fontSize: '.68rem', fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 7 }}>
              Adulterar Bloco
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {nonGenesis.slice(-6).map(b => (
                <button key={b.index} className="btn btn-danger btn-sm" onClick={() => tamperBlock(b.index)}>
                  💥 Bloco #{b.index}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Validation */}
        <div>
          {corrupted ? (
            <div className="validation-errors">
              {validation.errors.map((err, i) => (
                <div key={i} className="validation-err">
                  <div className="validation-err-title">{err.type}</div>
                  {err.message}
                </div>
              ))}
            </div>
          ) : (
            <div className="validation-ok">
              <span style={{ fontSize: '1.1rem' }}>🔒</span>
              Todos os hashes verificados — cadeia íntegra
            </div>
          )}
        </div>

        {corrupted && (
          <button className="btn btn-success btn-full btn-lg" onClick={restoreChain}>
            🔧 Restaurar Integridade da Cadeia
          </button>
        )}

        {nonGenesis.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: '.78rem' }}>
            Edite um arquivo para criar blocos e habilitar a demonstração
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Activity Log ─────────────────────────────────────────────────────────────
function ActivityLog() {
  const { log } = useBlockchain();
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="icon" style={{ color: 'var(--purple)' }}>📋</span>
          Log em Tempo Real
        </div>
        <span style={{ fontSize: '.68rem', color: 'var(--t3)' }}>{log.length} eventos</span>
      </div>
      <div className="log-wrap">
        {log.length === 0 ? (
          <div style={{ padding: '1.2rem', textAlign: 'center', color: 'var(--t3)', fontSize: '.8rem' }}>
            Aguardando eventos…
          </div>
        ) : log.map(item => (
          <div key={item.id} className="log-item">
            <span className="log-icon">{item.icon}</span>
            <div>
              <div className="log-msg">{item.message}</div>
              <div className="log-time">{item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Connection Banner ────────────────────────────────────────────────────────
function ConnectionBanner() {
  const { connected } = useBlockchain();
  if (connected) return null;
  return (
    <div className="conn-banner">
      ⚠️ Conectando ao servidor em &nbsp;<code>localhost:3001</code>… Certifique-se de que o backend está rodando.
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function AppContent() {
  const { myName } = useBlockchain();
  const [nameSet, setNameSet] = useState(false);

  // Show name setup if no name yet (wait for WS to assign default)
  if (!nameSet) {
    return <NameSetup onDone={() => setNameSet(true)} />;
  }

  return (
    <div className="app">
      <Header />
      <ConnectionBanner />
      <StatsRow />

      <div className="layout">
        <div className="col-left">
          <BlockchainVisualizer />
          <FilesPanel />
        </div>
        <div className="col-right">
          <ViewersPanel />
          <TamperPanel />
          <ActivityLog />
        </div>
      </div>

      <NotificationOverlay />
    </div>
  );
}

export default function App() {
  return (
    <BlockchainProvider>
      <AppContent />
    </BlockchainProvider>
  );
}
