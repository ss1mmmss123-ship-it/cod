import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { env } from './config/env.js';
import { healthController } from './controllers/healthController.js';
import { createGame, finalizeGame, getGame, handleMove } from './modules/game/gameService.js';

const app = Fastify({ logger: true });
await app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
await app.register(jwt, { secret: env.JWT_SECRET });
await app.register(rateLimit, { max: 60, timeWindow: '1 minute' });

app.get('/health', healthController);

app.post('/auth/guest', async (req, reply) => {
  const { nickname } = req.body;
  const token = await reply.jwtSign({ sub: `guest:${Date.now()}`, nickname });
  return { token };
});

app.post('/tables/start', async (req) => {
  const { tableId, players, clientSeed, blockHash } = req.body;
  const game = createGame({ tableId, players, clientSeed, blockHash });
  return { tableId: game.id, seedHash: game.seedHash, trumpSuit: game.state.trumpSuit };
});

const httpServer = createServer(app.server);
const io = new Server(httpServer, {
  cors: { origin: env.CORS_ORIGIN }
});

io.on('connection', (socket) => {
  socket.on('table:join', ({ tableId, playerId }) => {
    socket.join(tableId);
    socket.data.playerId = playerId;
    io.to(tableId).emit('table:presence', { playerId, status: 'online' });
  });

  socket.on('game:move', async ({ tableId, move }) => {
    try {
      const actorId = socket.data.playerId;
      const game = await handleMove({ tableId, move, actorId });
      io.to(tableId).emit('game:state', game.state);

      if (game.state.status === 'finished') {
        const winner = await finalizeGame(tableId);
        io.to(tableId).emit('game:finished', { winner, seedReveal: game.serverSeed, seedHash: game.seedHash });
      }
    } catch (error) {
      socket.emit('game:error', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    if (socket.data.playerId) {
      io.emit('table:presence', { playerId: socket.data.playerId, status: 'offline' });
    }
  });
});

await app.ready();
httpServer.listen(env.PORT, '0.0.0.0', () => {
  app.log.info(`Server running on ${env.PORT}`);
});

process.on('SIGTERM', async () => {
  await app.close();
  process.exit(0);
});
