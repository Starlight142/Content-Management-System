
import { Platform } from 'react-native';

const CANDIDATE_WS_URLS = Platform.OS === 'android'
  ? ['ws://127.0.0.1:5000', 'ws://localhost:5000', 'ws://10.13.3.200:5000', 'ws://10.0.2.2:5000']
  : ['ws://localhost:5000', 'ws://127.0.0.1:5000'];

let activeWsIndex = 0;

class MobilePresenceService {
  constructor() {
    this.ws = null;
    this.currentUser = null;
    this.listeners = new Set();
    this.onlineUserIds = new Set();
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    this.isConnected = false;
  }

  connect(user) {
    if (!user) return;
    this.currentUser = user;
    const userId = user.id || user._id;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      // Re-identify if user switched
      this.send({
        type: 'IDENTIFY',
        userId,
        clientType: 'mobile',
      });
      return;
    }

    try {
      const targetUrl = CANDIDATE_WS_URLS[activeWsIndex];
      this.ws = new WebSocket(targetUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.send({
          type: 'IDENTIFY',
          userId,
          clientType: 'mobile',
        });
        this.startHeartbeat();
        this.notifyListeners({ type: 'CONNECTION_CHANGE', isConnected: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleIncoming(data);
        } catch (err) {
          console.warn('[Presence] Error parsing message:', err);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.stopHeartbeat();
        this.notifyListeners({ type: 'CONNECTION_CHANGE', isConnected: false });
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[Presence] WebSocket error on', targetUrl, err.message || err);
        activeWsIndex = (activeWsIndex + 1) % CANDIDATE_WS_URLS.length;
        this.ws?.close();
      };
    } catch (e) {
      console.warn('[Presence] Could not connect WebSocket:', e);
      activeWsIndex = (activeWsIndex + 1) % CANDIDATE_WS_URLS.length;
      this.scheduleReconnect();
    }
  }

  handleIncoming(data) {
    if (data.type === 'ONLINE_USERS_SYNC' && Array.isArray(data.onlineUserIds)) {
      this.onlineUserIds = new Set(data.onlineUserIds.map(String));
    } else if (data.type === 'USER_STATUS_CHANGED') {
      const uid = String(data.userId);
      if (data.isOnline) {
        this.onlineUserIds.add(uid);
      } else {
        this.onlineUserIds.delete(uid);
      }
    }

    this.notifyListeners(data);
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
      } catch (err) {
        console.warn('[Presence] Send failed:', err);
      }
    }
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      const userId = this.currentUser?.id || this.currentUser?._id;
      if (userId) {
        this.send({ type: 'HEARTBEAT', userId });
      }
    }, 25000);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer || !this.currentUser) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.currentUser) {
        this.connect(this.currentUser);
      }
    }, 4000);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notifyListeners(data) {
    for (const listener of this.listeners) {
      try {
        listener(data, this.onlineUserIds);
      } catch (err) {
        console.error('[Presence] Error in subscriber:', err);
      }
    }
  }

  isUserOnline(userId) {
    return this.onlineUserIds.has(String(userId));
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.send({ type: 'LOGOUT' });
      this.ws.close();
      this.ws = null;
    }
    this.currentUser = null;
    this.isConnected = false;
  }
}

export const presenceService = new MobilePresenceService();

