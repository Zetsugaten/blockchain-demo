import './index.css';
import { useState, useEffect, Component } from 'react';
import QRCode from 'react-qr-code';
import { BlockchainProvider, useBlockchain } from './context/BlockchainContext';

// ─── Error Boundary ──────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--rose)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <div style={{ fontWeight: 700, marginBottom: '.5rem' }}>Erro de renderização</div>
        <code style={{ fontSize: '.75rem', color: 'var(--t3)', wordBreak: 'break-all' }}>
          {this.state.error.message}
        </code>
        <br /><br />
        <button className="btn btn-ghost" onClick={() => window.location.reload()}>Recarregar</button>
      </div>
    );
    return this.props.children;
  }
}

// ─── Dramatic Notification Overlay ───────────────────────────────────────────
function NotificationOverlay() {
  const { notification, dismissNotification } = useBlockchain();
  if (!notification) return null;

  const emojis = { file_changed: '📦', tamper: '🚨', restored: '🔒' };

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
        <div className="notif-progress"><div className="notif-bar" /></div>
        <div style={{ fontSize: '0.68rem', color: 'var(--t3)' }}>Clique para fechar</div>
      </div>
    </div>
  );
}

// ─── Device Name Setup ────────────────────────────────────────────────────────
function NameSetup({ onDone }) {
  const { myIcon, setDeviceName } = useBlockchain();
  const [name, setName] = useState('');
  const suggestions = ['Notebook', 'Celular', 'Tablet', 'iPhone', 'Android'];

  function handleSubmit(n) {
    const val = (n || name).trim();
    if (!val) return;
    setDeviceName(val);
    onDone();
  }

  return (
    <div className="name-setup">
      <div className="name-card">
        <div style={{ fontSize: '3rem' }}>{myIcon || '💻'}</div>
        <h1 className="grad">Blockchain Demo</h1>
        <p>Identifique este dispositivo na rede para começar.</p>
        <div className="name-input-row">
          <input className="form-input" placeholder="Ex: Notebook do Gabriel"
            value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} autoFocus />
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
  const valid = stats?.validation?.valid !== false;

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
        <button className="btn btn-ghost btn-sm" onClick={resetDemo} title="Reiniciar demo">🔄</button>
      </div>
    </header>
  );
}

// ─── Stats Row ────────────────────────────────────────────────────────────────
function StatsRow() {
  const { chain, viewers, stats } = useBlockchain();
  const valid = stats?.validation?.valid !== false;
  const difficulty = stats?.difficulty ?? 2;

  return (
    <div className="stats-row" style={{ paddingTop: '1.1rem' }}>
      <div className="stat">
        <div className="stat-lbl">Blocos</div>
        <div className="stat-val">{chain.length}</div>
        <div className="stat-sub">na cadeia</div>
      </div>
      <div className="stat">
        <div className="stat-lbl">Dispositivos</div>
        <div className="stat-val" style={{ background: 'linear-gradient(135deg,var(--emerald),var(--cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {viewers.length}
        </div>
        <div className="stat-sub">conectados agora</div>
      </div>
      <div className="stat">
        <div className="stat-lbl">Integridade</div>
        <div className="stat-val" style={{
          background: valid ? 'linear-gradient(135deg,var(--emerald),#34d399)' : 'linear-gradient(135deg,var(--rose),#fb7185)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          fontSize: '1rem', marginTop: 8
        }}>
          {valid ? '✓ ÍNTEGRA' : '✗ INVÁLIDA'}
        </div>
        <div className="stat-sub">verificação em tempo real</div>
      </div>
      <div className="stat">
        <div className="stat-lbl">Dificuldade PoW</div>
        <div className="stat-val" style={{ background: 'linear-gradient(135deg,var(--amber),var(--rose))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {difficulty}
        </div>
        <div className="stat-sub">zeros SHA-256</div>
      </div>
    </div>
  );
}

// ─── How It Works banner ──────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { icon: '📄', color: 'var(--amber)',    title: '1. Dado entra',              desc: 'Um arquivo é modificado por qualquer dispositivo' },
    { icon: '🔢', color: 'var(--indigo-l)', title: '2. SHA-256 gera o Hash',     desc: 'Conteúdo vira uma "impressão digital" única de 64 hex' },
    { icon: '🔗', color: 'var(--cyan)',     title: '3. Bloco é encadeado',       desc: 'Hash do bloco anterior entra no novo bloco' },
    { icon: '🔒', color: 'var(--emerald)', title: '4. Imutável',                 desc: 'Alterar um dado muda o hash e quebra todos os seguintes' },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="icon" style={{ color: 'var(--purple)' }}>💡</span>
          Como Funciona
        </div>
        <span style={{ fontSize: '.68rem', color: 'var(--t3)' }}>o princípio da inviolabilidade</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            padding: '.9rem', borderRight: i < 3 ? '1px solid var(--border)' : 'none',
            display: 'flex', flexDirection: 'column', gap: 6
          }}>
            <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
            <div style={{ fontSize: '.72rem', fontWeight: 700, color: s.color }}>{s.title}</div>
            <div style={{ fontSize: '.65rem', color: 'var(--t2)', lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Blockchain Visualizer ───────────────────────────────────────────────────
function BlockchainVisualizer() {
  const { chain, stats, tamperBlock } = useBlockchain();
  const [selected, setSelected] = useState(null);
  const [newIdx, setNewIdx] = useState(null);

  useEffect(() => {
    if (chain.length > 1) {
      const last = chain[chain.length - 1];
      setNewIdx(last.index);
      const t = setTimeout(() => setNewIdx(null), 3000);
      return () => clearTimeout(t);
    }
  }, [chain.length]);

  const validation = stats?.validation;
  const tamperedSet = new Set(
    (validation?.errors || []).filter(e => e.type === 'HASH_MISMATCH').map(e => e.blockIndex)
  );

  // Find selected block from chain (always fresh)
  const selectedBlock = selected != null ? chain.find(b => b.index === selected) : null;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="icon" style={{ color: 'var(--indigo)' }}>⛓️</span>
          Cadeia de Blocos
          <span style={{ fontSize: '0.62rem', color: 'var(--t3)', background: 'var(--bg-card2)', padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border)', fontFamily: 'var(--mono)' }}>
            SHA-256 · clique para inspecionar
          </span>
        </div>
        {validation && !validation.valid && (
          <span style={{ fontSize: '0.72rem', color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: 4 }}>
            ⚠️ {validation.errors?.length} elo(s) quebrado(s)
          </span>
        )}
      </div>

      <div className="chain-wrap">
        {chain.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--t3)', fontSize: '.85rem' }}>
            Aguardando blocos…
          </div>
        ) : (
          <div className="chain-scroll">
            {chain.map((block, i) => {
              const isGenesis  = block.index === 0;
              const isTampered = tamperedSet.has(block.index);
              const prevBlock  = chain[i - 1];
              const chainBroken = prevBlock && block.previousHash !== prevBlock.hash;
              const isNew      = block.index === newIdx;
              const isSelected = selected === block.index;

              return (
                <div key={block.index} className="chain-item">
                  {i > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 2px', flexShrink: 0 }}>
                      <div className={`chain-arrow ${chainBroken ? 'broken' : ''}`}
                        title={chainBroken ? '⚠️ Hash anterior não confere — elo quebrado!' : '✅ Hash anterior confere — elo válido'}>
                        {chainBroken ? '✗' : '→'}
                      </div>
                      {chainBroken && <div style={{ fontSize: '.5rem', color: 'var(--rose)', fontWeight: 700, marginTop: 2 }}>QUEBRADO</div>}
                    </div>
                  )}
                  <div
                    className={`block${isGenesis ? ' genesis' : ''}${isTampered ? ' tampered' : ''}${isSelected ? ' selected' : ''}`}
                    onClick={() => setSelected(isSelected ? null : block.index)}
                  >
                    <div className={`block-head${isGenesis ? ' block-genesis-head' : ''}`}>
                      <span className="block-idx">Bloco #{block.index}</span>
                      {isGenesis   ? <span className="block-tag tag-genesis">GENESIS</span>
                       : isTampered ? <span className="block-tag tag-tampered">⚠ ADULTERADO</span>
                       : isNew      ? <span className="block-tag tag-new">✨ NOVO</span>
                       :              <span className="block-tag tag-ok">{block.data?.action || '✓ OK'}</span>}
                    </div>
                    <div className="block-body">
                      <div className="hash-lbl">🔑 ID do Bloco (Hash)</div>
                      <div className={`hash-val${isTampered ? ' red' : ''}`}>{block.hash.slice(0, 28)}…</div>
                      <div className="hash-lbl" style={{ marginTop: 4 }}>🔗 Elo com bloco #{block.index > 0 ? block.index - 1 : '—'}</div>
                      <div className="prev-hash" style={{ color: chainBroken ? 'var(--rose)' : undefined }}>
                        {block.previousHash === '0' ? '— (origem)' : block.previousHash.slice(0, 24) + '…'}
                      </div>
                      <div className="block-footer">
                        <span className="block-by">{isGenesis ? '⚙️ Sistema' : `📡 ${block.data?.modifiedBy || '?'}`}</span>
                        <span className="block-nonce" title="Proof of Work">PoW:{block.nonce}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedBlock && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <div className="card-header" style={{ borderBottom: 'none' }}>
            <div className="card-title" style={{ fontSize: '.78rem' }}>🔍 Inspecionando Bloco #{selectedBlock.index}</div>
            <div className="card-actions">
              {selectedBlock.index > 0 && (
                <button className="btn btn-danger btn-sm" onClick={() => tamperBlock(selectedBlock.index)}>
                  💥 Simular Adulteração
                </button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕ Fechar</button>
            </div>
          </div>
          <div className="detail-body">
            <div className="detail-row">
              <div className="detail-lbl">🔑 Hash deste bloco (impressão digital única)</div>
              <div className="detail-val" style={{ color: tamperedSet.has(selectedBlock.index) ? 'var(--rose)' : 'var(--emerald)', fontWeight: 600 }}>
                {selectedBlock.hash}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-lbl">🔗 Hash do bloco anterior (elo da corrente)</div>
              <div className="detail-val">{selectedBlock.previousHash}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div className="detail-row">
                <div className="detail-lbl">⛏️ Nonce (Proof of Work)</div>
                <div className="detail-val">{selectedBlock.nonce}</div>
              </div>
              <div className="detail-row">
                <div className="detail-lbl">🕐 Registrado em</div>
                <div className="detail-val">{new Date(selectedBlock.timestamp).toLocaleString('pt-BR')}</div>
              </div>
            </div>
            {selectedBlock.data?.fileName && (
              <div className="detail-row">
                <div className="detail-lbl">📁 Arquivo registrado</div>
                <div className="detail-val" style={{ color: 'var(--amber)' }}>
                  {selectedBlock.data.fileName} — versão {selectedBlock.data.version}
                </div>
              </div>
            )}
            {selectedBlock.data?.fileHash && (
              <div className="detail-row">
                <div className="detail-lbl">🔑 Hash SHA-256 do conteúdo</div>
                <div className="detail-val">{selectedBlock.data.fileHash}</div>
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
        {(files || []).map(file => {
          const latestRecord = [...chain].reverse().find(b => b.data?.fileId === file.id);
          const chainHash = latestRecord?.data?.fileHash;
          const mismatch  = chainHash && chainHash !== file.hash;

          return (
            <div key={file.id} className={`file-row${changedId === file.id ? ' just-changed' : ''}`}>
              <div className="file-big-icon">{file.icon}</div>
              <div className="file-info">
                <div className="file-name-row">
                  <span className="file-name">{file.name}</span>
                  <span className="file-ver">v{file.version}</span>
                </div>
                <div className={`file-hash${mismatch ? ' mismatch' : ''}`}>{file.hash}</div>
                {mismatch && <div className="mismatch-badge">⚠️ Hash inválido — conteúdo adulterado!</div>}
                <div className="file-meta">{file.description} · por <strong>{file.lastModifiedBy === 'SYSTEM' ? 'Sistema' : file.lastModifiedBy}</strong></div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setEditingFile(file)}>✏️ Editar</button>
            </div>
          );
        })}
      </div>

      {editingFile && (
        <FileEditorModal file={editingFile} onSave={updateFile} onClose={() => setEditingFile(null)} />
      )}
    </div>
  );
}

function FileEditorModal({ file, onSave, onClose }) {
  const [content, setContent] = useState(file.content || '');
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
              <option value="UPDATE">UPDATE — Atualização de dados</option>
              <option value="CREATE">CREATE — Criação de registro</option>
              <option value="DELETE">DELETE — Remoção de registro</option>
              <option value="SIGN">SIGN — Assinatura Digital</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-lbl">Conteúdo (JSON)</label>
            <textarea className="form-textarea" value={content}
              onChange={e => setContent(e.target.value)} spellCheck={false} />
          </div>
          <div className="form-info">
            💡 Ao confirmar, um novo bloco será minerado com o hash SHA-256 deste conteúdo, encadeado ao bloco anterior. Todos os dispositivos serão notificados instantaneamente.
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

// ─── Viewers / QR Panel ───────────────────────────────────────────────────────
function ViewersPanel() {
  const { viewers, myId } = useBlockchain();
  const frontendURL = window.location.origin;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="icon" style={{ color: 'var(--cyan)' }}>📡</span>
          Dispositivos Conectados
        </div>
        <span style={{ fontSize: '.68rem', color: 'var(--t2)' }}>{viewers.length} online</span>
      </div>

      <div className="viewers-list">
        {viewers.length === 0 ? (
          <div style={{ padding: '1.1rem', textAlign: 'center', color: 'var(--t3)', fontSize: '.8rem' }}>
            Aguardando conexões…
          </div>
        ) : viewers.map(v => (
          <div key={v.id} className={`viewer-row${v.id === myId ? ' me' : ''}`}>
            <div className="viewer-avatar" style={{ borderColor: v.color || '#6366f1', background: (v.color || '#6366f1') + '22' }}>
              {v.icon || '💻'}
            </div>
            <div className="viewer-info">
              <div className="viewer-name">{v.name}</div>
              <div className="viewer-sub">entrou às {new Date(v.connectedAt).toLocaleTimeString('pt-BR')}</div>
            </div>
            {v.id === myId && <span className="viewer-badge">Você</span>}
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }}>
        <div className="card-header" style={{ borderBottom: 'none' }}>
          <div className="card-title" style={{ fontSize: '.78rem' }}>📱 Escanear para Entrar</div>
        </div>
        <div className="qr-panel">
          <div className="qr-box">
            <QRCode value={frontendURL} size={148} />
          </div>
          <div className="qr-url">{frontendURL}</div>
          <div className="qr-hint">
            📶 Conecte o celular na <strong>mesma rede</strong> e escaneie — ou acesse a URL acima.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tamper Panel ─────────────────────────────────────────────────────────────
function TamperPanel() {
  const { chain, stats, tamperBlock, restoreChain } = useBlockchain();
  const nonGenesis = chain.filter(b => b.index > 0);
  const validation = stats?.validation;
  const corrupted  = validation && !validation.valid;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="icon" style={{ color: 'var(--rose)' }}>🛡️</span>
          Demonstrar Inviolabilidade
        </div>
      </div>
      <div className="tamper-body">
        <div className="tamper-warning">
          <span>⚡</span>
          <div>
            <strong style={{ color: 'var(--t1)', display: 'block', marginBottom: 3 }}>Simulação de Ataque</strong>
            Adulteração detectada instantaneamente via hashes SHA-256 encadeados.
          </div>
        </div>

        {nonGenesis.length > 0 ? (
          <div>
            <div style={{ fontSize: '.68rem', fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 7 }}>
              Adulterar bloco
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {nonGenesis.slice(-6).map(b => (
                <button key={b.index} className="btn btn-danger btn-sm" onClick={() => tamperBlock(b.index)}>
                  💥 Bloco #{b.index}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: '.78rem' }}>
            Edite um arquivo para criar blocos e habilitar esta seção
          </div>
        )}

        {corrupted ? (
          <>
            <div className="validation-errors">
              {validation.errors.map((err, i) => (
                <div key={i} className="validation-err">
                  <div className="validation-err-title">{err.type}</div>
                  {err.message}
                </div>
              ))}
            </div>
            <button className="btn btn-success btn-full btn-lg" onClick={restoreChain}>
              🔧 Restaurar Integridade da Cadeia
            </button>
          </>
        ) : (
          <div className="validation-ok">
            <span style={{ fontSize: '1.1rem' }}>🔒</span>
            Todos os hashes verificados — cadeia íntegra
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
      ⚠️ Conectando ao backend… Aguarde ou verifique se o servidor Render está ativo.
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function AppContent() {
  const [nameSet, setNameSet] = useState(false);

  if (!nameSet) return <NameSetup onDone={() => setNameSet(true)} />;

  return (
    <div className="app">
      <Header />
      <ConnectionBanner />
      <StatsRow />
      <div className="layout">
        <div className="col-left">
          <HowItWorks />
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
    <ErrorBoundary>
      <BlockchainProvider>
        <AppContent />
      </BlockchainProvider>
    </ErrorBoundary>
  );
}
