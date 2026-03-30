export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('joinSpot', (spotId) => {
      socket.join(`spot:${spotId}`);
    });

    socket.on('leaveSpot', (spotId) => {
      socket.leave(`spot:${spotId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};
