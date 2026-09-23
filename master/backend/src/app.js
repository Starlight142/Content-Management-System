const express = require('express');
const cors = require('cors');
const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const contentsRoutes = require('./modules/contents/contents.routes');
const teamsRoutes = require('./modules/teams/teams.routes');
const ideasRoutes = require('./modules/ideas/ideas.routes');
const tasksRoutes = require('./modules/tasks/tasks.routes');
const legalRoutes = require('./modules/legal/legal.routes');

const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Content Production Management System API is running' 
  });
});

// Feature Modules
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/contents', contentsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/ideas', ideasRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/legal', legalRoutes);

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

