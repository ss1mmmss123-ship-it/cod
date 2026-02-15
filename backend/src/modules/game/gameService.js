import crypto from 'crypto';
import { applyMove, createDeck, createInitialState, shuffleProvablyFair, validateMove } from './durakEngine.js';
import { db } from '../../services/db.js';

const games = new Map();

export function createGame({ tableId, players, clientSeed, blockHash }) {
  const serverSeed = crypto.randomBytes(32).toString('hex');
  const seedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');
  const shuffled = shuffleProvablyFair(createDeck(), `${serverSeed}:${blockHash}`, clientSeed, Date.now());

  const hands = {};
  players.forEach((id, idx) => {
    hands[id] = shuffled.slice(idx * 6, idx * 6 + 6);
  });

  const state = createInitialState({
    players,
    trumpCard: shuffled[shuffled.length - 1],
    hands,
    attackerIndex: 0
  });

  const game = { id: tableId, seedHash, serverSeed, blockHash, state, createdAt: new Date().toISOString() };
  games.set(tableId, game);
  return game;
}

export function getGame(tableId) {
  return games.get(tableId);
}

export async function handleMove({ tableId, move, actorId }) {
  const game = games.get(tableId);
  if (!game) throw new Error('Game not found');

  const verdict = validateMove(game.state, move, actorId);
  if (!verdict.valid) throw new Error(verdict.reason);

  game.state = applyMove(game.state, move, actorId);

  await db.query(
    `INSERT INTO game_events (game_id, actor_id, event_type, payload) VALUES ($1, $2, $3, $4)`,
    [tableId, actorId, 'move', JSON.stringify(move)]
  );

  return game;
}

export async function finalizeGame(tableId) {
  const game = games.get(tableId);
  if (!game?.state?.winner) return null;

  await db.query(
    `INSERT INTO game_results (game_id, winner_id, seed_hash, server_seed, block_hash) VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (game_id) DO NOTHING`,
    [tableId, game.state.winner, game.seedHash, game.serverSeed, game.blockHash]
  );

  return game.state.winner;
}
