const mongoose = require('mongoose');

const teamActivitySchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: false,
    index: true,
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  actionType: {
    type: String,
    enum: [
      'TASK_CREATED',
      'TASK_ASSIGNED',
      'TASK_STATUS_CHANGED',
      'TASK_SUBMITTED',
      'TASK_PROGRESS_UPDATED',
      'TASK_DELETED',
      'CONTENT_CREATED',
      'CONTENT_UPDATED',
      'CONTENT_REVIEWED',
      'CONTENT_APPROVED',
      'CONTENT_REVISED',
      'CONTENT_PUBLISHED',
      'CONTENT_DELETED',
      'IDEA_PROPOSED',
      'USER_LOGIN',
      'USER_CREATED',
      'USER_UPDATED',
      'USER_DELETED',
      'SETTINGS_UPDATED',
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  details: {
    type: String,
    default: '',
    trim: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  entityModel: {
    type: String,
    enum: ['Task', 'Content', 'Idea', 'User'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('TeamActivity', teamActivitySchema);

