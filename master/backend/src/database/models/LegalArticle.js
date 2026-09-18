const mongoose = require('mongoose');

const legalArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Music & Audio', 'PDPA', 'Advertising', 'Platform Rules', 'Copyright', 'Trademark', 'Other'],
    default: 'Copyright',
  },
  description: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    default: 'Internal Policy',
  },
  effectiveDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('LegalArticle', legalArticleSchema);

