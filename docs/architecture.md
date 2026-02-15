# Architecture for 10k+ Concurrent Users

## High-level modules
1. **Gateway/API Layer**: Fastify REST + Socket.IO, horizontally scaled behind Nginx/ALB.
2. **Game Orchestrators**: Stateless Node workers consuming Redis pub/sub for table events.
3. **Authoritative Game Engine**: Validates every move server-side; clients are render-only.
4. **Blockchain Settlement Service**: Controlled signer service for escrow lock/settle.
5. **Data Layer**: PostgreSQL (transactions + history), Redis (sessions, rate limits, queue state).
6. **Fraud Monitoring Pipeline**: Event stream -> anomaly scoring -> admin alerts.

## Real-time flow
- Player joins table through websocket.
- Backend checks JWT, wallet signature, bankroll, and anti-bot score.
- Server commits move to append-only `game_events` and broadcasts canonical state.
- On winner detection, settlement service submits `settleGame` transaction.

## Provably fair shuffle
- `serverSeed` generated on start; only hash revealed initially (`seedHash`).
- `blockHash` + `clientSeed` + `serverSeed` generate final deterministic shuffle.
- End-game reveals `serverSeed`, allowing all players to verify deck order.

## Extra features
- **Referral system**: store `referral_code` / `invited_by` and distribute rewards from fee pool.
- **Tournament mode**: bracket service with escrow per round and scheduled start times.
- **Spectator mode**: read-only websocket channels with delayed card revelation.
- **Chat**: moderated per-table channels with toxicity and spam throttles.
- **Admin dashboard**: freeze accounts, force table cancel, inspect suspicious tables.
