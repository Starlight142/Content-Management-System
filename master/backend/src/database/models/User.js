const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
    role: {
    type: String,
    enum: ['ADMIN', 'MANAGER', 'MEMBER'],
    default: 'MEMBER',
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'OFFLINE', 'SUSPENDED'],
    default: 'ACTIVE',
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  workingStatus: {
    type: String,
    enum: ['WORKING', 'REVIEWING', 'IDLE', 'OFFLINE'],
    default: 'IDLE',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);

