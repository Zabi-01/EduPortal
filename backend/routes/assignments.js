const express = require('express');
const { Assignment, Course } = require('../models/sql');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/assignments — all (filtered by role server-side)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const assignments = await Assignment.findAll({
      include: [{ model: Course, as: 'course', attributes: ['course_code', 'title', 'instructor_id'] }],
      order: [['due_date', 'ASC']],
    });
    res.json({ success: true, data: assignments });
  } catch (err) { next(err); }
});

// POST /api/assignments
router.post('/', authenticate, authorize('admin', 'instructor'), async (req, res, next) => {
  try {
    const a = await Assignment.create(req.body);
    res.status(201).json({ success: true, data: a });
  } catch (err) { next(err); }
});

// PUT /api/assignments/:id
router.put('/:id', authenticate, authorize('admin', 'instructor'), async (req, res, next) => {
  try {
    await Assignment.update(req.body, { where: { assignment_id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// DELETE /api/assignments/:id
router.delete('/:id', authenticate, authorize('admin', 'instructor'), async (req, res, next) => {
  try {
    await Assignment.destroy({ where: { assignment_id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
