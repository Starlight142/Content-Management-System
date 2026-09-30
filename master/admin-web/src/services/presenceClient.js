// Client-side Real-time WebSocket Presence Service for Admin Web

export function getWsUrl() {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    const proto = isHttps ? 'wss:' : 'ws:';
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${proto}//localhost:5000`;
    }

    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return `${proto}//${hostname}:5000`;
    }

    if (window.location.port && window.location.port !== '80' && window.location.port !== '443') {
      return `${proto}//${hostname}:5000`;
    }
    return `${proto}//${window.location.host}/ws`;
  }
  return 'ws://localhost:5000';
}

export function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//localhost:5000/api`;
    }

    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return `${protocol}//${hostname}:5000/api`;
    }

    if (window.location.port && window.location.port !== '80' && window.location.port !== '443') {
      return `${protocol}//${hostname}:5000/api`;
    }
    return `${protocol}//${window.location.host}/api`;
  }
  return 'http://localhost:5000/api';
}

export const API_BASE_URL = getApiBaseUrl();

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

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.isConnected = true;
      this.notifyListeners({ type: 'CONNECTION_CHANGE', isConnected: true });
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      this.ws = new WebSocket(getWsUrl());

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
        this.isConnected = false;
        this.notifyListeners({ type: 'CONNECTION_CHANGE', isConnected: false });
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

    // If already connected and listener is waiting for CONNECTION_CHANGE, fire immediately
    if (eventType === 'CONNECTION_CHANGE' && this.isConnected) {
      try {
        callback({ type: 'CONNECTION_CHANGE', isConnected: true });
      } catch (err) {
        console.error('Error in immediate CONNECTION_CHANGE callback:', err);
      }
    }

    return () => this.off(eventType, callback);
  }

  off(eventType, callback) {
    if (this.eventListeners.has(eventType)) {
      this.eventListeners.get(eventType).delete(callback);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);

    // If already connected, immediately inform subscriber
    if (this.isConnected) {
      try {
        listener({ type: 'CONNECTION_CHANGE', isConnected: true }, this.onlineUserIds);
        if (this.onlineUserIds.size > 0) {
          listener({ type: 'ONLINE_USERS_SYNC', onlineUserIds: Array.from(this.onlineUserIds) }, this.onlineUserIds);
        }
      } catch (err) {
        console.error('Error in immediate subscribe callback:', err);
      }
    }

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
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  const authHeader = {};
  if (typeof window !== 'undefined') {
    try {
      const session = sessionStorage.getItem('admin_session') || localStorage.getItem('admin_session');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed.token) {
          authHeader['Authorization'] = `Bearer ${parsed.token}`;
        }
      }
    } catch {
      // Ignore
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    'x-admin-key': 'cms-master-2026',
    'x-admin-portal': 'true',
    ...authHeader,
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

