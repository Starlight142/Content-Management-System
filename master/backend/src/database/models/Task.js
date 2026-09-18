const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
  },
  taskType: {
    type: String,
    enum: ['Scripting', 'Filming', 'Editing', 'Graphic Design', 'Sound Design', 'Legal Check', 'Other'],
    default: 'Editing',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'],
    default: 'TODO',
  },
  dueDate: {
    type: Date,
  },
  submissionUrl: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Task', taskSchema);

