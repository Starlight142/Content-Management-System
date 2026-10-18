const mongoose = require('mongoose');
require('dotenv').config();
const { autoCheckAndSyncOnBoot } = require('../services/dbSync.service');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/content_management';
    const conn = await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB successfully: ${conn.connection.host}`);
    await autoCheckAndSyncOnBoot();
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
};

module.exports = connectDB;

