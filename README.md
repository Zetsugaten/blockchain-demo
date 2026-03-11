# ⛓️ Blockchain Demo

Sistema demonstrativo de tecnologia **Blockchain** com interface React, construído para apresentações sobre inviolabilidade de dados. Suporta múltiplos dispositivos (PC + celulares) conectados simultaneamente via WebSocket.

## 🚀 Funcionalidades

- Cadeia de blocos SHA-256 com Proof of Work
- 3 arquivos monitorados em tempo real
- Múltiplos dispositivos simultâneos via QR Code
- Notificações dramáticas quando um arquivo é modificado
- Demonstração de adulteração e detecção de hash inválido

## 🏗️ Arquitetura

```
blockchain-demo/
├── backend/   → Node.js + Express + WebSocket (Railway)
└── frontend/  → React + Vite                  (Vercel)
```

## 💻 Rodando Localmente

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

Abra `http://localhost:5173` — celulares na mesma rede Wi-Fi podem acessar via IP exibido no QR Code.

## ☁️ Deploy em Produção

### 1. Backend → [Railway](https://railway.app)

1. Crie um projeto no Railway → **Deploy from GitHub**
2. Selecione a pasta `backend/` como Root Directory
3. Adicione a variável de ambiente:
   ```
   FRONTEND_URL=https://seu-projeto.vercel.app
   ```
4. Copie a URL gerada (ex: `https://blockchain-demo.railway.app`)

### 2. Frontend → [Vercel](https://vercel.com)

1. Importe o repositório no Vercel
2. Root Directory: `frontend/`
3. Adicione a variável de ambiente:
   ```
   VITE_BACKEND_URL=https://blockchain-demo.railway.app
   ```
4. Deploy!

## 🎬 Roteiro de Apresentação

1. Abra o app no notebook (tela principal)
2. Peça alguém da banca para escanear o QR Code com o celular
3. Edite um arquivo no notebook → todos os dispositivos recebem notificação
4. "Adultere" um bloco → sistema detecta instantaneamente
5. "Restaure" a cadeia → volta ao estado íntegro

## 🔧 Variáveis de Ambiente

| Serviço  | Variável          | Descrição                     |
|----------|-------------------|-------------------------------|
| Backend  | `FRONTEND_URL`    | URL do Vercel (para CORS)     |
| Backend  | `PORT`            | Porta (Railway define auto)   |
| Frontend | `VITE_BACKEND_URL`| URL do Railway (para API/WS)  |
