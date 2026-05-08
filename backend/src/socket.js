import { Server } from 'socket.io';
import { createAdapter } from 'socket.io-redis';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

export function initSocket(server, redisClient) {
  const io = new Server(server, {
    path: process.env.SOCKET_ROOT_PATH || '/socket.io',
    cors: { origin: '*' }
  });

  if (process.env.REDIS_URL) {
    const pubClient = new Redis(process.env.REDIS_URL);
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter({ pubClient, subClient }));
  }

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on('auth:register', (userId) => {
      socket.join(`user:${userId}`);
    });

    socket.on('joinSpot', (spotId) => socket.join(`spot:${spotId}`));
    socket.on('leaveSpot', (spotId) => socket.leave(`spot:${spotId}`));

    socket.on('gps:update', (data) => {
      // Broadcast to spot room
      if (data && data.spotId) {
        io.to(`spot:${data.spotId}`).emit('gps:position', data);
      }
    });

    socket.on('disconnect', () => {
      // handle
    });
  });

  return io;
}
