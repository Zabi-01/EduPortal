const mongoose = require('mongoose');

// Question bank for quizzes — flexible schema suits MongoDB well
const optionSchema = new mongoose.Schema({
  option_text: { type: String, required: true },
  is_correct:  { type: Boolean, default: false },
}, { _id: false });

const quizQuestionSchema = new mongoose.Schema({
  quiz_id: {
    type: Number,       // FK → Oracle QUIZZES.quiz_id
    required: true,
    index: true,
  },
  question_text: {
    type: String,
    required: true,
  },
  question_type: {
    type: String,
    enum: ['mcq', 'true_false', 'short_answer', 'essay'],
    required: true,
  },
  options: {
    type: [optionSchema],       // Only for mcq / true_false
    default: undefined,
  },
  correct_answer: {
    type: String,               // For short_answer; essay graded manually
  },
  points: {
    type: Number,
    required: true,
    default: 1,
  },
  order_index: {
    type: Number,
    default: 0,
  },
  explanation: {
    type: String,               // Shown after attempt
  },
}, {
  timestamps: true,
  collection: 'quiz_questions',
});

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema);
