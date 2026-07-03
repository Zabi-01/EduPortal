const mongoose = require('mongoose');

// High-volume, schema-flexible notifications stored in MongoDB
const notificationSchema = new mongoose.Schema({
  user_id: {
    type: Number,       // FK → Oracle USERS.user_id
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['assignment_due', 'quiz_open', 'grade_released', 'enrollment', 'announcement', 'system'],
    required: true,
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false },
  metadata: {
    course_id:      Number,
    assignment_id:  Number,
    quiz_id:        Number,
    link:           String,
  },
}, {
  timestamps: true,
  collection: 'notifications',
});

// Auto-expire notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);
