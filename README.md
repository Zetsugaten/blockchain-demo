<div align="center">

# ⛓️ Blockchain Demo

**Sistema demonstrativo de tecnologia Blockchain com suporte a múltiplos dispositivos em tempo real.**

[![React](https://img.shields.io/badge/Frontend-React_+_Vite-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![WebSocket](https://img.shields.io/badge/Realtime-WebSocket-010101?style=flat-square&logo=socket.io)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)](https://render.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[🌐 Demo ao Vivo](https://blockchain-demo-khaki.vercel.app) · [📦 Backend](https://blockchain-demo-ftr9.onrender.com/api/chain) · [🐛 Issues](https://github.com/Zetsugaten/blockchain-demo/issues)

![Blockchain Demo Preview](https://img.shields.io/badge/Status-Em_Produção-brightgreen?style=flat-square)

</div>

---

## 📋 Sobre o Projeto

Sistema desenvolvido como parte do TCC sobre **inviolabilidade em blockchain**. Demonstra em tempo real:

- ✅ Como cada bloco é **encadeado** ao anterior via SHA-256
- ✅ Por que **qualquer alteração** é detectada instantaneamente
- ✅ Funcionamento do **Proof of Work** (mineração)
- ✅ Sincronização entre **múltiplos dispositivos** via WebSocket

> Desenvolvido para ser usado ao vivo em apresentações: o apresentador modifica um arquivo no notebook enquanto a banca acompanha pelo celular — tudo em tempo real.

---

## 🧱 Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        Rede Local / Internet                     │
│                                                                  │
│   📱 Celular          💻 Notebook          🖥️ Projetor           │
│      │                    │                    │                 │
│      └──────────┬─────────┘                    │                │
│                 │                              │                 │
│         ┌───────▼──────────┐                  │                 │
│         │  WebSocket (WS)  │──────────────────┘                 │
│         ├──────────────────┤                                     │
│         │  Node.js Backend │  ← blockchain.js (SHA-256, PoW)    │
│         │  Express + WS    │  ← fileTracker.js                  │
│         └──────────────────┘                                     │
│                 │                                               │
│         ┌───────▼──────────┐                                   │
│         │ React Frontend   │  ← App.jsx, BlockchainContext     │
│         │ (Vite)           │                                   │
│         └──────────────────┘                                   │
└─────────────────────────────────────────────────────────────────┘
```

| Camada     | Tecnologia                        | Hospedagem |
|------------|-----------------------------------|------------|
| Frontend   | React 18 + Vite + react-qr-code   | Vercel     |
| Backend    | Node.js + Express + ws            | Render     |
| Realtime   | WebSocket (`ws`)                  | —          |
| Hashing    | SHA-256 implementado nativamente  | —          |

---

## ✨ Funcionalidades

| Feature                         | Descrição |
|---------------------------------|-----------|
| 🔗 **Blockchain funcional**      | Cadeia com SHA-256 real, Proof of Work e validação |
| 📡 **Multi-dispositivo**         | Vários dispositivos conectados simultaneamente via WS |
| 📱 **QR Code automático**        | QR gerado com a URL correta (local ou Vercel) |
| 🚨 **Notificação dramática**     | Overlay em tela cheia quando arquivo é modificado ou adulterado |
| 🛡️ **Detecção de adulteração**  | Qualquer alteração nos blocos é detectada em tempo real |
| 🔧 **Restauração**               | Botão para restaurar a integridade da cadeia |
| 📊 **Log de eventos**            | Feed em tempo real de todas as ações do sistema |
| 💡 **Painel educativo**          | Explicação visual dos 4 passos da blockchain |

---

## 🚀 Rodando Localmente

### Pré-requisitos
- [Node.js 18+](https://nodejs.org)
- Git

### Backend

```bash
cd backend
npm install
node server.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host
```

Acesse `http://localhost:5173`. Dispositivos na mesma rede Wi-Fi podem entrar via QR Code.

---

## ☁️ Deploy em Produção

### 1. Backend → [Render](https://render.com) *(gratuito)*

1. Novo projeto → **Web Service** → conecte o repositório
2. Configure:

   | Campo | Valor |
   |-------|-------|
   | Root Directory | `backend` |
   | Build Command | `npm install` |
   | Start Command | `node server.js` |
   | Instance Type | **Free** |

3. Variável de ambiente:
   ```
   FRONTEND_URL = https://seu-projeto.vercel.app
   ```

> ⚠️ O plano gratuito do Render "adormece" após 15 min sem uso. Abra a URL do backend ~2 min antes de apresentar.

### 2. Frontend → [Vercel](https://vercel.com) *(gratuito)*

1. Importe o repositório → Root Directory: `frontend`
2. Variável de ambiente:
   ```
   VITE_BACKEND_URL = https://seu-backend.onrender.com
   ```
3. **Deploy** ✔

---

## 🔑 Variáveis de Ambiente

| Serviço  | Variável            | Valor de Exemplo |
|----------|---------------------|------------------|
| Backend  | `FRONTEND_URL`      | `https://blockchain-demo-khaki.vercel.app` |
| Backend  | `PORT`              | Definido automaticamente pelo Render |
| Frontend | `VITE_BACKEND_URL`  | `https://blockchain-demo-ftr9.onrender.com` |

---

## 📁 Estrutura do Projeto

```
blockchain-demo/
├── backend/
│   ├── src/
│   │   ├── blockchain.js      # Core: SHA-256, PoW, validação
│   │   ├── fileTracker.js     # Monitoramento de arquivos
│   │   └── deviceManager.js
│   ├── server.js              # Express + WebSocket
│   ├── Procfile
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx            # Todos os componentes UI
    │   ├── index.css          # Design system
    │   └── context/
    │       └── BlockchainContext.jsx  # Estado global + WS
    ├── vercel.json
    └── package.json
```

---

## 📄 Licença

MIT © [Zetsugaten](https://github.com/Zetsugaten)
