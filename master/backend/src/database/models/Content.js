const mongoose = require('mongoose');

const metricSnapshotSchema = new mongoose.Schema({
  collectedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  watchTimeSeconds: { type: Number, default: 0 },
  averageViewDuration: { type: Number, default: 0 },
  engagementRate: { type: Number, default: 0 },
  followersGained: { type: Number, default: 0 },
}, { _id: false });

const fileSchema = new mongoose.Schema({
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['VIDEO', 'IMAGE', 'DOCUMENT', 'AUDIO'], default: 'VIDEO' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

const legalCheckItemSchema = new mongoose.Schema({
  ruleTitle: { type: String, required: true },
  passed: { type: Boolean, default: false },
  note: { type: String, default: '' },
  checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  checkedAt: { type: Date },
}, { _id: false });

const versionSchema = new mongoose.Schema({
  versionNumber: { type: Number, default: 1 },
  fileUrl: { type: String, required: true },
  changelog: { type: String, default: '' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submittedAt: { type: Date, default: Date.now },
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  decision: { type: String, enum: ['APPROVED', 'REVISION'], required: true },
  notes: { type: String, default: '' },
  reviewedAt: { type: Date, default: Date.now },
}, { _id: false });

const DEFAULT_LEGAL_RULES = [
  { ruleTitle: 'ตรวจสอบสิทธิ์การใช้เพลงประกอบ (Music License)', passed: false },
  { ruleTitle: 'ตรวจสอบแหล่งที่มาของรูปภาพและฟุตเทจ (Stock License)', passed: false },
  { ruleTitle: 'ตรวจสอบความยินยอมข้อมูลส่วนบุคคลและใบหน้า (PDPA)', passed: false },
  { ruleTitle: 'ตรวจสอบเครื่องหมายการค้าและการแสดงสปอนเซอร์ (Trademark)', passed: false },
  { ruleTitle: 'ตรวจสอบเกณฑ์ชุมชนและข้อห้ามแพลตฟอร์ม (Community Rules)', passed: false },
];

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  platform: {
    type: String,
    enum: ['YouTube', 'TikTok', 'Instagram', 'Other'],
    default: 'TikTok',
  },
  status: {
    type: String,
    enum: ['PLANNING', 'PRODUCTION', 'REVIEW', 'REVISION', 'APPROVED', 'SCHEDULED', 'PUBLISHED'],
    default: 'PLANNING',
  },
  category: {
    type: String,
    default: 'General',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dueDate: {
    type: Date,
  },
  publishedAt: {
    type: Date,
  },
  ideaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea',
  },
  files: [fileSchema],
  versions: [versionSchema],
  reviewHistory: [reviewSchema],
  metrics: [metricSnapshotSchema],
  legalChecklist: {
    type: [legalCheckItemSchema],
    default: DEFAULT_LEGAL_RULES,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Content', contentSchema);

