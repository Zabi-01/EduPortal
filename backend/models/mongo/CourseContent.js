const mongoose = require('mongoose');

// Stores rich course content (videos, PDFs, text) — too unstructured for Oracle
const courseContentSchema = new mongoose.Schema({
  course_id: {
    type: Number,       // FK → Oracle COURSES.course_id
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content_type: {
    type: String,
    enum: ['video', 'pdf', 'text', 'link', 'image'],
    required: true,
  },
  content_url: {
    type: String,        // S3/CDN URL for media
  },
  content_body: {
    type: String,        // Rich text / HTML for text type
  },
  order_index: {
    type: Number,
    default: 0,
  },
  is_published: {
    type: Boolean,
    default: false,
  },
  metadata: {
    duration_minutes: Number,   // for videos
    file_size_kb:     Number,   // for PDFs
    tags:             [String],
  },
}, {
  timestamps: true,           // createdAt, updatedAt
  collection: 'course_contents',
});

module.exports = mongoose.model('CourseContent', courseContentSchema);
