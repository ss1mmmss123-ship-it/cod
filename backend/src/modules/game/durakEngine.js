const SUITS = ['♣', '♦', '♥', '♠'];
const RANKS = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const createDeck = () => SUITS.flatMap((suit) => RANKS.map((rank) => ({ suit, rank })));

const rankScore = (rank) => RANKS.indexOf(rank);

export function shuffleProvablyFair(deck, serverSeed, clientSeed, nonce) {
  const source = `${serverSeed}:${clientSeed}:${nonce}`;
  let hash = 0;
  for (let i = 0; i < source.length; i++) {
    hash = (hash << 5) - hash + source.charCodeAt(i);
    hash |= 0;
  }

  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.abs((hash + i * 9301 + 49297) % (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

export function createInitialState({ players, trumpCard, hands, attackerIndex }) {
  return {
    players,
    trumpSuit: trumpCard.suit,
    hands,
    table: [],
    attackerIndex,
    defenderIndex: (attackerIndex + 1) % players.length,
    phase: 'attack',
    turnDeadline: Date.now() + 30000,
    winner: null,
    status: 'active'
  };
}

export function validateMove(state, move, actorId) {
  const activePlayer = state.phase === 'attack' ? state.players[state.attackerIndex] : state.players[state.defenderIndex];
  if (activePlayer !== actorId) return { valid: false, reason: 'Not your turn' };

  const hand = state.hands[actorId] || [];
  if (!hand.find((c) => c.suit === move.card.suit && c.rank === move.card.rank)) {
    return { valid: false, reason: 'Card not in hand' };
  }

  if (state.phase === 'defend') {
    const attackCard = state.table[state.table.length - 1]?.attack;
    const beats =
      (move.card.suit === attackCard.suit && rankScore(move.card.rank) > rankScore(attackCard.rank)) ||
      (move.card.suit === state.trumpSuit && attackCard.suit !== state.trumpSuit);
    if (!beats) return { valid: false, reason: 'Invalid defend card' };
  }

  return { valid: true };
}

export function applyMove(state, move, actorId) {
  state.hands[actorId] = state.hands[actorId].filter((c) => !(c.suit === move.card.suit && c.rank === move.card.rank));
  if (state.phase === 'attack') {
    state.table.push({ attack: move.card, defend: null });
    state.phase = 'defend';
  } else {
    state.table[state.table.length - 1].defend = move.card;
    state.phase = 'attack';
    state.attackerIndex = (state.attackerIndex + 1) % state.players.length;
    state.defenderIndex = (state.attackerIndex + 1) % state.players.length;
  }

  const alivePlayers = state.players.filter((id) => (state.hands[id] || []).length > 0);
  if (alivePlayers.length === 1) {
    state.status = 'finished';
    state.winner = alivePlayers[0];
  }

  state.turnDeadline = Date.now() + 30000;
  return state;
}
