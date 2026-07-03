const express = require('express');
const { Attendance, Course } = require('../models/sql');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/attendance/my
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const records = await Attendance.findAll({
      where: { student_id: req.user.user_id },
      include: [{ model: Course, as: 'course', attributes: ['course_code', 'title'] }],
      order: [['session_date', 'DESC']],
    });
    res.json({ success: true, data: records });
  } catch (err) { next(err); }
});

// GET /api/attendance/course/:courseId — instructor
router.get('/course/:courseId', authenticate, authorize('admin', 'instructor'), async (req, res, next) => {
  try {
    const records = await Attendance.findAll({
      where: { course_id: req.params.courseId },
      order: [['session_date', 'DESC']],
    });
    res.json({ success: true, data: records });
  } catch (err) { next(err); }
});

// POST /api/attendance — mark attendance (instructor/admin)
router.post('/', authenticate, authorize('admin', 'instructor'), async (req, res, next) => {
  try {
    const record = await Attendance.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (err) { next(err); }
});

module.exports = router;
