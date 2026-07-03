// ── BUG FIX #6 ────────────────────────────────────────────────────────────────
// FIXED two errors in the GET / handler:
//
//  a) Wrong include aliases: the includes used as: 'student', 'instructor',
//     'admin' but the associations in models/sql/index.js define them as
//     'studentInfo', 'instructorInfo', 'adminInfo'. Sequelize throws
//     "Association with alias 'student' does not exist on User."
//
//  b) Wrong field names in withRole: after fixing (a) the JSON keys become
//     studentInfo / instructorInfo / adminInfo, so the role-detection check
//     must use the same names — otherwise every user is mapped to 'admin'.
// ─────────────────────────────────────────────────────────────────────────────
const express = require('express');
const { User, Student, Instructor, Admin } = require('../models/sql');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/users — admin only
router.get('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
      include: [
        // FIX (a): corrected aliases to match index.js association definitions
        { model: Student,    as: 'studentInfo',    required: false },
        { model: Instructor, as: 'instructorInfo', required: false },
        { model: Admin,      as: 'adminInfo',      required: false },
      ],
    });

    const withRole = users.map(u => {
      const json = u.toJSON();
      // FIX (b): use corrected field names to detect role
      const role = json.studentInfo    ? 'student'
                 : json.instructorInfo ? 'instructor'
                 :                       'admin';
      return { ...json, role };
    });

    res.json({ success: true, data: withRole });
  } catch (err) { next(err); }
});

// PATCH /api/users/:id/status — admin toggle active
router.patch('/:id/status', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await User.update(
      { is_active: req.body.is_active },
      { where: { user_id: req.params.id } }
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

// PUT /api/users/:id — update own profile or admin updates anyone
router.put('/:id', authenticate, async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.user_id !== Number(req.params.id)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  try {
    const { first_name, last_name } = req.body;
    await User.update({ first_name, last_name }, { where: { user_id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
