CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  wallet_address VARCHAR(64) UNIQUE,
  nickname VARCHAR(32) NOT NULL,
  rating INT DEFAULT 1000,
  tier VARCHAR(32) DEFAULT 'Bronze',
  referral_code VARCHAR(16) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY,
  creator_id UUID REFERENCES users(id),
  token_address VARCHAR(64) NOT NULL,
  buy_in NUMERIC(18,6) NOT NULL,
  max_players INT NOT NULL CHECK (max_players BETWEEN 2 AND 6),
  status VARCHAR(16) NOT NULL,
  contract_game_id VARCHAR(70) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_events (
  id BIGSERIAL PRIMARY KEY,
  game_id UUID NOT NULL,
  actor_id VARCHAR(64) NOT NULL,
  event_type VARCHAR(32) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_results (
  game_id UUID PRIMARY KEY,
  winner_id VARCHAR(64) NOT NULL,
  seed_hash VARCHAR(66) NOT NULL,
  server_seed VARCHAR(66) NOT NULL,
  block_hash VARCHAR(66) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tx_hash VARCHAR(80) UNIQUE NOT NULL,
  tx_type VARCHAR(16) NOT NULL,
  amount NUMERIC(18,6) NOT NULL,
  token_symbol VARCHAR(16) NOT NULL,
  status VARCHAR(16) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
