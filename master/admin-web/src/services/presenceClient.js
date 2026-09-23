// Client-side Real-time WebSocket Presence Service for Admin Web

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class PresenceClient {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.eventListeners = new Map();
    this.onlineUserIds = new Set();
    this.isConnected = false;
    this.reconnectTimer = null;
    this.currentUserId = 'admin_web_console';
  }

  connect(userId = 'admin_web_console') {
    if (typeof window === 'undefined') return;
    this.currentUserId = userId;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.notifyListeners({ type: 'CONNECTION_CHANGE', isConnected: true });

        // Identify this client
        this.send({
          type: 'IDENTIFY',
          userId: this.currentUserId,
          clientType: 'web',
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleIncomingMessage(data);
        } catch (err) {
          console.warn('Error parsing presence WebSocket message:', err);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.notifyListeners({ type: 'CONNECTION_CHANGE', isConnected: false });
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('Presence WebSocket connection error:', err);
        this.ws?.close();
      };
    } catch (e) {
      console.warn('Failed to initialize WebSocket:', e);
      this.scheduleReconnect();
    }
  }

  handleIncomingMessage(data) {
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

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(this.currentUserId);
    }, 3000);
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  on(eventType, callback) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType).add(callback);
    return () => this.off(eventType, callback);
  }

  off(eventType, callback) {
    if (this.eventListeners.has(eventType)) {
      this.eventListeners.get(eventType).delete(callback);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notifyListeners(data) {
    // 1. General listeners
    for (const listener of this.listeners) {
      try {
        listener(data, this.onlineUserIds);
      } catch (err) {
        console.error('Error in presence listener:', err);
      }
    }

    // 2. Event-specific listeners registered via .on(type, callback)
    if (data?.type && this.eventListeners.has(data.type)) {
      const callbacks = this.eventListeners.get(data.type);
      for (const callback of callbacks) {
        try {
          callback(data);
        } catch (err) {
          console.error(`Error in event listener for ${data.type}:`, err);
        }
      }
    }
  }

  isUserOnline(userId) {
    return this.onlineUserIds.has(String(userId));
  }

  getOnlineCount() {
    return this.onlineUserIds.size;
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const presenceClient = new PresenceClient();

/**
 * Standard REST API helper for Admin Web with Master Key authorization
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'x-admin-key': 'cms-master-2026',
    'x-admin-portal': 'true',
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorText = await res.text();
    let errorJson;
    try {
      errorJson = JSON.parse(errorText);
    } catch {
      // Not JSON
    }
    throw new Error(errorJson?.message || `Request failed with status ${res.status}`);
  }
  return res.json();
}

