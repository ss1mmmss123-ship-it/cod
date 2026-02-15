# DurakChain Platform

Production-focused monorepo for a multiplayer Durak betting platform with blockchain escrow.

## Stack
- **Frontend:** React + Vite + Tailwind + Zustand + Socket.IO client
- **Backend:** Node.js + Fastify + Socket.IO + PostgreSQL + Redis + JWT
- **Blockchain:** Solidity smart contract (OpenZeppelin + Chainlink VRF-ready seed model)
- **Infra:** Docker Compose, Nginx reverse proxy patterns, scalable stateless game workers

## Quick start
```bash
cp .env.example .env
./scripts/bootstrap.sh
```

See `docs/deployment.md` and `docs/security-checklist.md` for production hardening.
