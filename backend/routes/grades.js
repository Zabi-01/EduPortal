// ── BUG FIX #7 ────────────────────────────────────────────────────────────────
// FIXED incorrect max_points source in POST /api/grades.
//
// Original code read max_points from req.body:
//   const pct = (req.body.score / req.body.max_points) * 100;
//
// max_points is NOT a field in the GRADES table — it belongs to ASSIGNMENTS.
// If the client doesn't send max_points (it usually doesn't), the division
// produces NaN and every grade gets letter_grade 'F'. We now look up the
// Assignment record to get the authoritative max_points value.
// ─────────────────────────────────────────────────────────────────────────────
const express  = require('express');
const { Grade, Assignment, Course } = require('../models/sql');
const { authenticate, authorize }   = require('../middleware/auth');
const router = express.Router();

// GET /api/grades/my — student's own grades
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const grades = await Grade.findAll({
      where: { student_id: req.user.user_id },
      include: [{
        model: Assignment,
        as: 'assignment',
        include: [{ model: Course, as: 'course' }],
      }],
    });
    const shaped = grades.map(g => ({
      ...g.toJSON(),
      assignment_title: g.assignment?.title,
      max_points:       g.assignment?.max_points,
      course_id:        g.assignment?.course_id,
    }));
    res.json({ success: true, data: shaped });
  } catch (err) { next(err); }
});

// GET /api/grades/student/:id — instructor/admin
router.get('/student/:id', authenticate, authorize('admin', 'instructor'), async (req, res, next) => {
  try {
    const grades = await Grade.findAll({
      where: { student_id: req.params.id },
      include: [{ model: Assignment, as: 'assignment' }],
    });
    res.json({ success: true, data: grades });
  } catch (err) { next(err); }
});

// POST /api/grades — instructor/admin create grade
router.post('/', authenticate, authorize('admin', 'instructor'), async (req, res, next) => {
  try {
    // FIX: fetch max_points from the Assignment record instead of req.body
    const assignment = await Assignment.findByPk(req.body.assignment_id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const pct = (req.body.score / assignment.max_points) * 100;
    const letter_grade = pct >= 90 ? 'A'
                       : pct >= 80 ? 'B'
                       : pct >= 70 ? 'C'
                       : pct >= 60 ? 'D' : 'F';

    const grade = await Grade.create({ ...req.body, letter_grade });
    res.status(201).json({ success: true, data: grade });
  } catch (err) { next(err); }
});

// PUT /api/grades/:id
router.put('/:id', authenticate, authorize('admin', 'instructor'), async (req, res, next) => {
  try {
    await Grade.update(req.body, { where: { grade_id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
