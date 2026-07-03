const express = require('express');
const { Department, Course } = require('../models/sql');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/departments
router.get('/', async (req, res, next) => {
  try {
    const depts = await Department.findAll({ order: [['dept_name', 'ASC']] });
    res.json({ success: true, data: depts });
  } catch (err) { next(err); }
});

// POST /api/departments — admin only
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json({ success: true, data: dept });
  } catch (err) { next(err); }
});

// PUT /api/departments/:id
router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const [n] = await Department.update(req.body, { where: { dept_id: req.params.id } });
    if (!n) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, message: 'Updated' });
  } catch (err) { next(err); }
});

// DELETE /api/departments/:id
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await Department.destroy({ where: { dept_id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
