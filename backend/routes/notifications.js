const express = require('express');
const Notification = require('../models/mongo/Notification');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// GET /api/notifications — own notifications
router.get('/', authenticate, async (req, res, next) => {
  try {
    const query = req.user.role === 'admin'
      ? {}
      : { user_id: req.user.user_id };
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: notifications });
  } catch (err) { next(err); }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.user_id },
      { is_read: true }
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    await Notification.updateMany({ user_id: req.user.user_id }, { is_read: true });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// POST /api/notifications — create (instructor/admin can broadcast)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const n = await Notification.create({ ...req.body });
    res.status(201).json({ success: true, data: n });
  } catch (err) { next(err); }
});

module.exports = router;
