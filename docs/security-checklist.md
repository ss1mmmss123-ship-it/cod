# Security Checklist

- [x] Server-authoritative game state and move validation.
- [x] JWT auth on API and websocket handshake.
- [x] Rate limiting for REST and websocket emits.
- [x] Reentrancy protection in escrow contract (`ReentrancyGuard`).
- [x] Safe token transfers via OpenZeppelin `SafeERC20`.
- [x] Max platform fee capped in contract (<=5%).
- [x] One-time settlement guard (`withdrawn` flag).
- [x] Full game event journaling (`game_events`).
- [ ] Integrate bot detection model (device fingerprint + behavior score).
- [ ] Add SIWE (Sign-In with Ethereum) nonce validation.
- [ ] Independent smart contract audit before mainnet.
- [ ] Secrets managed in HSM / cloud KMS.
