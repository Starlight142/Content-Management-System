const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'General',
  },
  platform: {
    type: String,
    enum: ['YouTube', 'TikTok', 'Instagram', 'Facebook', 'Other'],
    default: 'YouTube',
  },
  proposedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    index: true,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'APPROVED', 'REJECTED'],
    default: 'DRAFT',
  },
  upvotes: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Idea', ideaSchema);

