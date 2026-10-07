const express = require('express');
const cors = require('cors');
const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const contentsRoutes = require('./modules/contents/contents.routes');
const teamsRoutes = require('./modules/teams/teams.routes');
const ideasRoutes = require('./modules/ideas/ideas.routes');
const tasksRoutes = require('./modules/tasks/tasks.routes');
const logsRoutes = require('./modules/logs/logs.routes');

const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Detailed Health & System Status Route (Admin Req 5)
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  let metrics = { usersCount: 0, contentsCount: 0, tasksCount: 0, logsCount: 0 };

  if (dbStatus === 'connected') {
    try {
      const [users, contents, tasks, logs] = await Promise.all([
        mongoose.model('User').countDocuments().catch(() => 0),
        mongoose.model('Content').countDocuments().catch(() => 0),
        mongoose.model('Task').countDocuments().catch(() => 0),
        mongoose.model('TeamActivity').countDocuments().catch(() => 0),
      ]);
      metrics = {
        usersCount: users,
        contentsCount: contents,
        tasksCount: tasks,
        logsCount: logs,
      };
    } catch {
      // Standby
    }
  }

  res.status(200).json({ 
    status: 'healthy', 
    message: 'Content Production Management System API is running',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'production_cms',
    },
    services: {
      api: 'online',
      database: dbStatus,
      webSocket: 'online',
    },
    metrics,
    environment: process.env.NODE_ENV || 'development',
  });
});

// Feature Modules
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/contents', contentsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/ideas', ideasRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/logs', logsRoutes);

const http = require('http');
const { initPresenceServer } = require('./services/presence.service');

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Real-time Presence WebSocket Server
initPresenceServer(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (HTTP & WebSocket)`);
});

module.exports = { app, server };

