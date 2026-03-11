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

### 1. Backend → [Render](https://render.com) *(gratuito)*

1. Acesse [render.com](https://render.com) → **New → Web Service**
2. Conecte o repositório GitHub `blockchain-demo`
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free
4. Em **Environment Variables**, adicione:
   ```
   FRONTEND_URL=https://seu-projeto.vercel.app
   ```
5. Clique em **Create Web Service** e copie a URL gerada (ex: `https://blockchain-demo.onrender.com`)

> **Dica apresentação:** Abra a URL do Render 2-3 min antes de apresentar para o servidor "acordar" (plano gratuito dorme após 15 min sem uso).

### 2. Frontend → [Vercel](https://vercel.com) *(gratuito)*

1. Acesse [vercel.com/new](https://vercel.com/new) → importe `blockchain-demo`
2. **Root Directory:** `frontend`
3. Em **Environment Variables**, adicione:
   ```
   VITE_BACKEND_URL=https://blockchain-demo.onrender.com
   ```
4. Clique em **Deploy** ✔

> Após obter as duas URLs, atualize `FRONTEND_URL` no Render e `VITE_BACKEND_URL` no Vercel com os valores reais e faça Redeploy no Vercel.

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
