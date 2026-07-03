const express = require('express');
const { Enrollment, Course, Student } = require('../models/sql');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/enrollments/my — student sees own
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const rows = await Enrollment.findAll({
      where: { student_id: req.user.user_id },
      include: [{ model: Course, as: 'course' }],
    });
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

// GET /api/enrollments — admin/instructor sees all
router.get('/', authenticate, authorize('admin', 'instructor'), async (req, res, next) => {
  try {
    const rows = await Enrollment.findAll({
      include: [{ model: Course, as: 'course' }],
    });
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

// POST /api/enrollments
router.post('/', authenticate, async (req, res, next) => {
  try {
    const student_id = req.user.role === 'student' ? req.user.user_id : req.body.student_id;
    const course_id  = req.body.course_id;
    const existing = await Enrollment.findOne({ where: { student_id, course_id } });
    if (existing) return res.status(409).json({ success: false, message: 'Already enrolled' });
    const enroll = await Enrollment.create({ student_id, course_id, status: 'active' });
    res.status(201).json({ success: true, data: enroll });
  } catch (err) { next(err); }
});

// PUT /api/enrollments/:id — update status
router.put('/:id', authenticate, authorize('admin', 'instructor'), async (req, res, next) => {
  try {
    const [n] = await Enrollment.update(req.body, { where: { enrollment_id: req.params.id } });
    if (!n) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// DELETE /api/enrollments/:id — drop
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const enroll = await Enrollment.findByPk(req.params.id);
    if (!enroll) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user.role === 'student' && enroll.student_id !== req.user.user_id)
      return res.status(403).json({ success: false, message: 'Access denied' });
    await enroll.destroy();
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
