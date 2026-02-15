# Deployment Instructions

## 1. Infrastructure
- Kubernetes or ECS with separate services: `frontend`, `api-gateway`, `game-workers`, `settlement-worker`.
- Managed PostgreSQL (HA + point-in-time restore).
- Managed Redis with persistence enabled.
- Polygon RPC provider with failover endpoints.

## 2. Smart contract deployment
```bash
cd contracts
forge build
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --verify
```
- Store deployed escrow address in `BETTING_CONTRACT_ADDRESS`.
- Transfer contract ownership to secure multisig.

## 3. Backend deployment
```bash
cd backend
npm install
node src/server.js
```
- Run DB schema from `backend/prisma/schema.sql`.
- Configure autoscaling on CPU + active websocket count.

## 4. Frontend deployment
```bash
cd frontend
npm install
npm run build
```
- Serve `dist/` with CDN caching and WAF.

## 5. Observability
- Metrics: game latency, rejected moves, tx pending duration, fraud score spikes.
- Logs: structured JSON into ELK/OpenSearch.
- Tracing: OpenTelemetry across API + worker + blockchain calls.
