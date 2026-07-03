// ── BUG FIX #8 ────────────────────────────────────────────────────────────────
// ADDED missing GET /api/quizzes route.
// frontend/src/api.js calls getQuizzes() → GET /api/quizzes, but the original
// file only had GET /quizzes/course/:courseId and GET /quizzes/:id.
// Without this route, every call from the frontend received a 404 or — worse —
// Express matched GET /quizzes with the /:id handler (id = undefined) and
// returned an empty object, silently breaking the quiz listing UI.
// ─────────────────────────────────────────────────────────────────────────────
const express = require('express');
const { Quiz, QuizResult, Course } = require('../models/sql');
const QuizQuestion = require('../models/mongo/QuizQuestions');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// FIX: NEW — GET /api/quizzes — admin/instructor sees all; students see none
//            (students should use GET /quizzes/course/:courseId instead)
router.get('/', authenticate, authorize('admin', 'instructor'), async (req, res, next) => {
  try {
    const quizzes = await Quiz.findAll({
      include: [{ model: Course, as: 'course', attributes: ['course_code', 'title'] }],
      order: [['close_date', 'ASC']],
    });
    res.json({ success: true, data: quizzes });
  } catch (err) { next(err); }
});

// GET /api/quizzes/course/:courseId
router.get('/course/:courseId', authenticate, async (req, res, next) => {
  try {
    const quizzes = await Quiz.findAll({ where: { course_id: req.params.courseId } });
    res.json({ success: true, data: quizzes });
  } catch (err) { next(err); }
});

// GET /api/quizzes/:id — quiz details + questions from MongoDB
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const questions = await QuizQuestion.find({ quiz_id: Number(req.params.id) })
                                         .sort({ order_index: 1 });

    // Hide correct answers for students
    const sanitised = req.user.role === 'student'
      ? questions.map(q => {
          const obj = q.toObject();
          if (obj.options) obj.options = obj.options.map(({ option_text }) => ({ option_text }));
          delete obj.correct_answer;
          return obj;
        })
      : questions;

    res.json({ success: true, data: { ...quiz.toJSON(), questions: sanitised } });
  } catch (err) { next(err); }
});

// POST /api/quizzes — create quiz
router.post('/', authenticate, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const { questions, ...quizData } = req.body;
    const quiz = await Quiz.create(quizData);

    if (questions?.length) {
      await QuizQuestion.insertMany(
        questions.map((q, i) => ({ ...q, quiz_id: quiz.quiz_id, order_index: i }))
      );
    }
    res.status(201).json({ success: true, data: quiz });
  } catch (err) { next(err); }
});

// POST /api/quizzes/:id/submit — student submits answers
router.post('/:id/submit', authenticate, authorize('student'), async (req, res, next) => {
  try {
    const quiz      = await Quiz.findByPk(req.params.id);
    const questions = await QuizQuestion.find({ quiz_id: Number(req.params.id) });
    const { answers } = req.body;

    let earned = 0;
    for (const q of questions) {
      const ans = answers.find(a => a.question_id === String(q._id));
      if (!ans) continue;
      if (q.question_type === 'mcq' || q.question_type === 'true_false') {
        const correct = q.options.find(o => o.is_correct)?.option_text;
        if (ans.answer === correct) earned += q.points;
      }
    }

    const score        = earned;
    const letter_grade = score >= quiz.total_points * 0.9 ? 'A'
                       : score >= quiz.total_points * 0.8 ? 'B'
                       : score >= quiz.total_points * 0.7 ? 'C'
                       : score >= quiz.total_points * 0.6 ? 'D' : 'F';

    const result = await QuizResult.create({
      quiz_id:    quiz.quiz_id,
      student_id: req.user.user_id,
      score,
      letter_grade,
    });

    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

module.exports = router;
