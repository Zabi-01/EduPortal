const express = require('express');
const { Course, Department, Instructor, User, Enrollment, Student } = require('../models/sql');
const CourseContent = require('../models/mongo/CourseContent');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/courses — list all courses
router.get('/', async (req, res, next) => {
  try {
    const courses = await Course.findAll({
      include: [
        { model: Department, as: 'department', attributes: ['dept_name', 'dept_code'] },
        { model: Instructor, as: 'instructor', include: [{ model: User, attributes: ['first_name', 'last_name'] }] },
      ],
    });
    res.json({ success: true, data: courses });
  } catch (err) { next(err); }
});

// GET /api/courses/:id — single course with its MongoDB content
router.get('/:id', async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: Department, as: 'department' },
        { model: Instructor, as: 'instructor', include: [{ model: User, attributes: ['first_name', 'last_name', 'email'] }] },
      ],
    });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Fetch rich content from MongoDB
    const content = await CourseContent.find({ course_id: course.course_id, is_published: true })
                                        .sort({ order_index: 1 });

    res.json({ success: true, data: { ...course.toJSON(), content } });
  } catch (err) { next(err); }
});

// POST /api/courses — create course (instructor/admin only)
router.post('/', authenticate, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (err) { next(err); }
});

// PUT /api/courses/:id — update course
router.put('/:id', authenticate, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const [updated] = await Course.update(req.body, { where: { course_id: req.params.id } });
    if (!updated) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course updated' });
  } catch (err) { next(err); }
});

// POST /api/courses/:id/content — add MongoDB content block
router.post('/:id/content', authenticate, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const content = await CourseContent.create({ course_id: Number(req.params.id), ...req.body });
    res.status(201).json({ success: true, data: content });
  } catch (err) { next(err); }
});

// DELETE /api/courses/:id — soft delete by deactivating (or hard delete)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await Course.destroy({ where: { course_id: req.params.id } });
    await CourseContent.deleteMany({ course_id: Number(req.params.id) });
    res.json({ success: true, message: 'Course and its content deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
