const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const { User, Student, Instructor, Admin } = require('../models/sql');
const { sequelize } = require('../config/oracle');

const router = express.Router();

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', [
  body('first_name').notEmpty().trim(),
  body('last_name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3 }).trim(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['student', 'instructor', 'admin']),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { first_name, last_name, email, username, password, role, ...extra } = req.body;

  const t = await sequelize.transaction();
  try {
    const password_hash = await bcrypt.hash(password, 12);

    const user = await User.create(
      { first_name, last_name, email, username, password_hash },
      { transaction: t }
    );

    // Create subtype record based on role
    if (role === 'student') {
      await Student.create({
        user_id:         user.user_id,
        student_number:  extra.student_number || `STU${user.user_id}`,
        enrollment_year: extra.enrollment_year || new Date().getFullYear(),
      }, { transaction: t });
    } else if (role === 'instructor') {
      await Instructor.create({
        user_id:         user.user_id,
        employee_number: extra.employee_number || `EMP${user.user_id}`,
        office_location: extra.office_location || null,
        phone_numbers:   extra.phone_numbers   || [],
      }, { transaction: t });
    } else if (role === 'admin') {
      await Admin.create({
        user_id:    user.user_id,
        admin_role: extra.admin_role || 'general',
      }, { transaction: t });
    }

    await t.commit();

    const token = jwt.sign(
      { user_id: user.user_id, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({ success: true, token, user: { user_id: user.user_id, email, username, role } });
  } catch (err) {
    await t.rollback();
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'Email or username already taken' });
    }
    next(err);
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email, is_active: true } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Determine role from subtype tables
    const [student, instructor, admin] = await Promise.all([
      Student.findOne({ where: { user_id: user.user_id } }),
      Instructor.findOne({ where: { user_id: user.user_id } }),
      Admin.findOne({ where: { user_id: user.user_id } }),
    ]);
    const role = student ? 'student' : instructor ? 'instructor' : 'admin';

    const token = jwt.sign(
      { user_id: user.user_id, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ success: true, token, user: { user_id: user.user_id, email: user.email, username: user.username, role } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
