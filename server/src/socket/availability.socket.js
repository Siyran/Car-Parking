// In-memory store for real-time GPS data (ephemeral — not persisted to DB)
const activeDrivers = new Map(); // bookingId -> { lat, lng, heading, speed, userId, spotId, updatedAt }
const userSockets = new Map();   // userId -> socketId
const socketUsers = new Map();   // socketId -> userId

export const getActiveDrivers = () => activeDrivers;

/**
 * Calculate ETA using OSRM (free, no API key needed).
 * Returns { duration (seconds), distance (meters), geometry } or null on failure.
 */
export const fetchETAFromOSRM = async (fromLat, fromLng, toLat, toLng) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === 'Ok' && data.routes?.length > 0) {
      const route = data.routes[0];
      return {
        duration: Math.round(route.duration),   // seconds
        distance: Math.round(route.distance),   // meters
        geometry: route.geometry                 // GeoJSON LineString
      };
    }
    return null;
  } catch (err) {
    console.error('OSRM ETA fetch failed:', err.message);
    return null;
  }
};

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // ─── Authentication: Register user → socket mapping ───
    socket.on('auth:register', (userId) => {
      if (!userId) return;
      userSockets.set(userId, socket.id);
      socketUsers.set(socket.id, userId);
      console.log(`🔑 User registered: ${userId} → ${socket.id}`);
    });

    // ─── Spot room management (existing functionality) ───
    socket.on('joinSpot', (spotId) => {
      socket.join(`spot:${spotId}`);
    });

    socket.on('leaveSpot', (spotId) => {
      socket.leave(`spot:${spotId}`);
    });

    // ─── GPS: Driver sends live position ───
    socket.on('gps:update', async (data) => {
      const { bookingId, lat, lng, heading, speed, spotId, destinationLat, destinationLng } = data;
      if (!bookingId || lat == null || lng == null) return;

      const userId = socketUsers.get(socket.id);

      // Store in ephemeral memory
      activeDrivers.set(bookingId, {
        lat, lng, heading: heading || 0, speed: speed || 0,
        userId, spotId,
        updatedAt: Date.now()
      });

      // Broadcast to anyone watching this booking
      io.to(`booking:${bookingId}`).emit('gps:position', {
        bookingId, lat, lng, heading: heading || 0, speed: speed || 0
      });

      // Broadcast to the spot room (so owners can see all incoming drivers)
      if (spotId) {
        io.to(`spot:${spotId}`).emit('driver:position', {
          bookingId, userId, lat, lng, heading: heading || 0, speed: speed || 0
        });
      }

      // Calculate ETA if destination is provided
      if (destinationLat != null && destinationLng != null) {
        const eta = await fetchETAFromOSRM(lat, lng, destinationLat, destinationLng);
        if (eta) {
          const etaPayload = { bookingId, ...eta };
          socket.emit('eta:update', etaPayload);
          io.to(`booking:${bookingId}`).emit('eta:update', etaPayload);
          if (spotId) {
            io.to(`spot:${spotId}`).emit('driver:eta', { bookingId, userId, ...eta });
          }
        }
      }
    });

    // ─── GPS: Subscribe to a booking's GPS feed ───
    socket.on('gps:subscribe', (bookingId) => {
      socket.join(`booking:${bookingId}`);

      // Send the last known position immediately if available
      const lastPos = activeDrivers.get(bookingId);
      if (lastPos) {
        socket.emit('gps:position', {
          bookingId,
          lat: lastPos.lat,
          lng: lastPos.lng,
          heading: lastPos.heading,
          speed: lastPos.speed
        });
      }
    });

    socket.on('gps:unsubscribe', (bookingId) => {
      socket.leave(`booking:${bookingId}`);
    });

    // ─── GPS: Stop tracking (booking ended) ───
    socket.on('gps:stop', (bookingId) => {
      activeDrivers.delete(bookingId);
      io.to(`booking:${bookingId}`).emit('gps:stopped', { bookingId });
    });

    // ─── Owner: Get all active drivers for their spots ───
    socket.on('owner:getDrivers', (spotIds) => {
      if (!Array.isArray(spotIds)) return;
      const drivers = [];
      for (const [bookingId, driver] of activeDrivers.entries()) {
        if (spotIds.includes(driver.spotId)) {
          drivers.push({ bookingId, ...driver });
        }
      }
      socket.emit('owner:activeDrivers', drivers);
    });

    // ─── Disconnect cleanup ───
    socket.on('disconnect', () => {
      const userId = socketUsers.get(socket.id);
      if (userId) {
        userSockets.delete(userId);
        socketUsers.delete(socket.id);
      }

      // Clean up any GPS tracking for this driver
      for (const [bookingId, driver] of activeDrivers.entries()) {
        if (driver.userId === userId) {
          activeDrivers.delete(bookingId);
          io.to(`booking:${bookingId}`).emit('gps:stopped', { bookingId });
        }
      }

      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  // Periodic cleanup of stale GPS entries (older than 5 minutes)
  setInterval(() => {
    const staleThreshold = Date.now() - 5 * 60 * 1000;
    for (const [bookingId, driver] of activeDrivers.entries()) {
      if (driver.updatedAt < staleThreshold) {
        activeDrivers.delete(bookingId);
        io.to(`booking:${bookingId}`).emit('gps:stopped', { bookingId });
      }
    }
  }, 60 * 1000);
};
