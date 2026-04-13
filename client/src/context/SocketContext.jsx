import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const watchIdRef = useRef(null);
  const gpsCallbacksRef = useRef(new Map());
  const etaCallbacksRef = useRef(new Set());
  const spotCallbacksRef = useRef(new Set());

  // Initialize socket connection
  useEffect(() => {
    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      if (user?._id) {
        socket.emit('auth:register', user._id);
      }
    });

    socket.on('disconnect', () => setConnected(false));

    // GPS position updates from server
    socket.on('gps:position', (data) => {
      const callbacks = gpsCallbacksRef.current.get(data.bookingId);
      if (callbacks) {
        callbacks.forEach(cb => cb(data));
      }
      // Also fire for 'all' subscribers
      const allCallbacks = gpsCallbacksRef.current.get('__all__');
      if (allCallbacks) {
        allCallbacks.forEach(cb => cb(data));
      }
    });

    // ETA updates from server
    socket.on('eta:update', (data) => {
      etaCallbacksRef.current.forEach(cb => cb(data));
    });

    // Spot availability updates
    socket.on('spotUpdate', (data) => {
      spotCallbacksRef.current.forEach(cb => cb(data));
    });

    // Driver position for owners
    socket.on('driver:position', (data) => {
      const callbacks = gpsCallbacksRef.current.get('__drivers__');
      if (callbacks) {
        callbacks.forEach(cb => cb(data));
      }
    });

    socket.on('driver:eta', (data) => {
      const callbacks = gpsCallbacksRef.current.get('__driverEta__');
      if (callbacks) {
        callbacks.forEach(cb => cb(data));
      }
    });

    socket.on('gps:stopped', (data) => {
      const callbacks = gpsCallbacksRef.current.get('__stopped__');
      if (callbacks) {
        callbacks.forEach(cb => cb(data));
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Re-register when user changes
  useEffect(() => {
    if (user?._id && socketRef.current?.connected) {
      socketRef.current.emit('auth:register', user._id);
    }
  }, [user]);

  // ─── GPS Broadcasting: Start watching position ───
  const startGPSBroadcast = useCallback((bookingId, spotId, destinationLat, destinationLng) => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, heading, speed } = pos.coords;
        if (socketRef.current?.connected) {
          socketRef.current.emit('gps:update', {
            bookingId,
            lat: latitude,
            lng: longitude,
            heading: heading || 0,
            speed: speed || 0,
            spotId,
            destinationLat,
            destinationLng
          });
        }
      },
      (err) => console.warn('GPS broadcast error:', err.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
    );

    watchIdRef.current = id;
    return id;
  }, []);

  const stopGPSBroadcast = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // ─── Subscribe to a booking's GPS feed ───
  const subscribeToGPS = useCallback((bookingId, callback) => {
    if (socketRef.current) {
      socketRef.current.emit('gps:subscribe', bookingId);
    }
    if (!gpsCallbacksRef.current.has(bookingId)) {
      gpsCallbacksRef.current.set(bookingId, new Set());
    }
    gpsCallbacksRef.current.get(bookingId).add(callback);

    return () => {
      const set = gpsCallbacksRef.current.get(bookingId);
      if (set) {
        set.delete(callback);
        if (set.size === 0) gpsCallbacksRef.current.delete(bookingId);
      }
      if (socketRef.current) {
        socketRef.current.emit('gps:unsubscribe', bookingId);
      }
    };
  }, []);

  // ─── Subscribe to ETA updates ───
  const onETAUpdate = useCallback((callback) => {
    etaCallbacksRef.current.add(callback);
    return () => etaCallbacksRef.current.delete(callback);
  }, []);

  // ─── Subscribe to spot updates ───
  const onSpotUpdate = useCallback((callback) => {
    spotCallbacksRef.current.add(callback);
    return () => spotCallbacksRef.current.delete(callback);
  }, []);

  // ─── Owner: subscribe to driver positions on their spots ───
  const subscribeToDrivers = useCallback((callback) => {
    if (!gpsCallbacksRef.current.has('__drivers__')) {
      gpsCallbacksRef.current.set('__drivers__', new Set());
    }
    gpsCallbacksRef.current.get('__drivers__').add(callback);
    return () => {
      const set = gpsCallbacksRef.current.get('__drivers__');
      if (set) set.delete(callback);
    };
  }, []);

  const subscribeToDriverETA = useCallback((callback) => {
    if (!gpsCallbacksRef.current.has('__driverEta__')) {
      gpsCallbacksRef.current.set('__driverEta__', new Set());
    }
    gpsCallbacksRef.current.get('__driverEta__').add(callback);
    return () => {
      const set = gpsCallbacksRef.current.get('__driverEta__');
      if (set) set.delete(callback);
    };
  }, []);

  const onGPSStopped = useCallback((callback) => {
    if (!gpsCallbacksRef.current.has('__stopped__')) {
      gpsCallbacksRef.current.set('__stopped__', new Set());
    }
    gpsCallbacksRef.current.get('__stopped__').add(callback);
    return () => {
      const set = gpsCallbacksRef.current.get('__stopped__');
      if (set) set.delete(callback);
    };
  }, []);

  // ─── Join/leave spot rooms ───
  const joinSpot = useCallback((spotId) => {
    if (socketRef.current) socketRef.current.emit('joinSpot', spotId);
  }, []);

  const leaveSpot = useCallback((spotId) => {
    if (socketRef.current) socketRef.current.emit('leaveSpot', spotId);
  }, []);

  // ─── Owner: request all active drivers ───
  const requestActiveDrivers = useCallback((spotIds) => {
    if (socketRef.current) socketRef.current.emit('owner:getDrivers', spotIds);
  }, []);

  const onActiveDrivers = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('owner:activeDrivers', callback);
    }
    return () => {
      if (socketRef.current) socketRef.current.off('owner:activeDrivers', callback);
    };
  }, []);

  // ─── Emit GPS stop ───
  const emitGPSStop = useCallback((bookingId) => {
    if (socketRef.current) socketRef.current.emit('gps:stop', bookingId);
    stopGPSBroadcast();
  }, [stopGPSBroadcast]);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      connected,
      startGPSBroadcast,
      stopGPSBroadcast,
      subscribeToGPS,
      onETAUpdate,
      onSpotUpdate,
      subscribeToDrivers,
      subscribeToDriverETA,
      onGPSStopped,
      joinSpot,
      leaveSpot,
      requestActiveDrivers,
      onActiveDrivers,
      emitGPSStop
    }}>
      {children}
    </SocketContext.Provider>
  );
};
