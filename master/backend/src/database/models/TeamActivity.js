const mongoose = require('mongoose');

const teamActivitySchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true,
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  actionType: {
    type: String,
    enum: [
      'TASK_CREATED',
      'TASK_ASSIGNED',
      'TASK_STATUS_CHANGED',
      'TASK_SUBMITTED',
      'TASK_PROGRESS_UPDATED',
      'CONTENT_CREATED',
      'CONTENT_REVIEWED',
      'CONTENT_APPROVED',
      'CONTENT_REVISED',
      'CONTENT_PUBLISHED',
      'IDEA_PROPOSED',
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

