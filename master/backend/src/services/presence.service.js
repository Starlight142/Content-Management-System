const { WebSocketServer, WebSocket } = require('ws');
const mongoose = require('mongoose');
const User = require('../database/models/User');

// Active connections: Map<ws, { userId, clientType, isAlive, connectedAt }>
const clients = new Map();
let wss = null;

/**
 * Broadcast JSON payload to all connected clients
 */
const broadcast = (type, payload = {}) => {
  if (!wss) return;
  const message = JSON.stringify({ type, ...payload, timestamp: new Date().toISOString() });
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (err) {
        console.error('Error broadcasting message to client:', err.message);
      }
    }
  }
};

/**
 * Count active WebSocket connections for a given user ID
 */
const getActiveSocketCount = (userId) => {
  if (!userId) return 0;
  let count = 0;
  for (const info of clients.values()) {
    if (String(info.userId) === String(userId)) {
      count++;
    }
  }
  return count;
};

/**
 * Get array of unique online user IDs
 */
const getOnlineUserIds = () => {
  const ids = new Set();
  for (const info of clients.values()) {
    if (info.userId) {
      ids.add(String(info.userId));
    }
  }
  return Array.from(ids);
};

/**
 * Mark user online in MongoDB and broadcast to all connected apps
 */
const handleUserOnline = async (userId, clientType = 'web') => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return;
  try {
    const updated = await User.findByIdAndUpdate(
      userId,
      { isOnline: true, lastActiveAt: new Date() },
      { new: true }
    ).select('-passwordHash');

    if (updated) {
      broadcast('USER_STATUS_CHANGED', {
        userId: String(userId),
        isOnline: true,
        lastActiveAt: updated.lastActiveAt,
        workingStatus: updated.workingStatus,
        role: updated.role,
        clientType,
      });
      console.log(`🟢 User Online [${clientType}]: ${updated.username} (${userId})`);
    }
  } catch (err) {
    console.error(`Error marking user ${userId} online:`, err.message);
  }
};

/**
 * Mark user offline in MongoDB when no active connections remain
 */
const handleUserOffline = async (userId) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return;
  const remainingCount = getActiveSocketCount(userId);
  if (remainingCount > 0) {
    // User still has another connection open (e.g. web and mobile)
    return;
  }

  try {
    const updated = await User.findByIdAndUpdate(
      userId,
      { isOnline: false, lastActiveAt: new Date() },
      { new: true }
    ).select('-passwordHash');

    if (updated) {
      broadcast('USER_STATUS_CHANGED', {
        userId: String(userId),
        isOnline: false,
        lastActiveAt: updated.lastActiveAt,
        workingStatus: updated.workingStatus,
        role: updated.role,
      });
      console.log(`⚪ User Offline: ${updated.username} (${userId})`);
    }
  } catch (err) {
    console.error(`Error marking user ${userId} offline:`, err.message);
  }
};

/**
 * Reset all online statuses in MongoDB on server start
 */
const resetAllPresence = async () => {
  try {
    const result = await User.updateMany({}, { isOnline: false });
    console.log(`🔄 Reset presence in database: ${result.modifiedCount} users set to offline on server startup.`);
  } catch (err) {
    console.error('Error resetting presence in database:', err.message);
  }
};

/**
 * Initialize WebSocket Server attached to HTTP server
 */
const initPresenceServer = (httpServer) => {
  wss = new WebSocketServer({ server: httpServer });

  // Reset database presence state on startup
  resetAllPresence();

  wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    clients.set(ws, {
      userId: null,
      clientType: 'unknown',
      isAlive: true,
      connectedAt: new Date(),
    });

    // Send immediate sync list of currently online users
    try {
      ws.send(
        JSON.stringify({
          type: 'ONLINE_USERS_SYNC',
          onlineUserIds: getOnlineUserIds(),
          timestamp: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.error('Error sending sync to client:', err.message);
    }

    ws.on('pong', () => {
      const info = clients.get(ws);
      if (info) info.isAlive = true;
    });

    ws.on('message', async (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        const info = clients.get(ws) || {};

        switch (data.type) {
          case 'IDENTIFY': {
            const { userId, clientType = 'web' } = data;
            if (userId) {
              info.userId = String(userId);
              info.clientType = clientType;
              clients.set(ws, info);
              await handleUserOnline(userId, clientType);

              // Acknowledge identification
              ws.send(
                JSON.stringify({
                  type: 'IDENTIFY_ACK',
                  userId,
                  onlineUserIds: getOnlineUserIds(),
                })
              );
            }
            break;
          }

          case 'HEARTBEAT': {
            const userId = data.userId || info.userId;
            if (userId) {
              await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });
            }
            ws.send(JSON.stringify({ type: 'HEARTBEAT_ACK', timestamp: new Date().toISOString() }));
            break;
          }

          case 'STATUS_UPDATE': {
            const userId = data.userId || info.userId;
            if (userId && data.workingStatus) {
              const updated = await User.findByIdAndUpdate(
                userId,
                { workingStatus: data.workingStatus, lastActiveAt: new Date() },
                { new: true }
              ).select('-passwordHash');

              if (updated) {
                broadcast('USER_STATUS_CHANGED', {
                  userId: String(userId),
                  isOnline: true,
                  workingStatus: updated.workingStatus,
                  lastActiveAt: updated.lastActiveAt,
                });
              }
            }
            break;
          }

          case 'LOGOUT': {
            const userId = info.userId;
            info.userId = null;
            clients.set(ws, info);
            if (userId) {
              await handleUserOffline(userId);
            }
            break;
          }

          case 'PING': {
            ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err.message);
      }
    });

    ws.on('close', async () => {
      const info = clients.get(ws);
      clients.delete(ws);
      if (info && info.userId) {
        await handleUserOffline(info.userId);
      }
    });

    ws.on('error', (err) => {
      console.warn(`WebSocket client error from ${clientIp}:`, err.message);
      const info = clients.get(ws);
      clients.delete(ws);
      if (info && info.userId) {
        handleUserOffline(info.userId);
      }
    });
  });

  // Liveness interval ping check every 30 seconds
  const interval = setInterval(() => {
    for (const [ws, info] of clients.entries()) {
      if (!info.isAlive) {
        console.log(`💀 Terminating inactive socket for user ${info.userId || 'anonymous'}`);
        clients.delete(ws);
        if (info.userId) {
          handleUserOffline(info.userId);
        }
        ws.terminate();
        continue;
      }
      info.isAlive = false;
      try {
        ws.ping();
      } catch (e) {
        // Ignored
      }
    }
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  console.log('⚡ Real-time Presence WebSocket Server initialized successfully');
  return wss;
};

/**
 * External helper: Notify all clients when user data changes (e.g. Role changed or profile edited)
 */
const notifyUserUpdated = (user) => {
  broadcast('USER_UPDATED', {
    user: {
      _id: user._id,
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      workingStatus: user.workingStatus,
      isOnline: user.isOnline,
      lastActiveAt: user.lastActiveAt,
    },
  });
};

module.exports = {
  initPresenceServer,
  broadcast,
  getOnlineUserIds,
  handleUserOnline,
  handleUserOffline,
  notifyUserUpdated,
  resetAllPresence,
};

