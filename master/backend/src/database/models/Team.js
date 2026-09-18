const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  roleInTeam: {
    type: String,
    enum: ['LEAD', 'CREATOR', 'EDITOR', 'DESIGNER', 'MEMBER'],
    default: 'MEMBER',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  members: [teamMemberSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Team', teamSchema);

