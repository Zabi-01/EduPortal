// ── BUG FIX #5 ────────────────────────────────────────────────────────────────
// REPLACED DataTypes.ENUM with DataTypes.STRING(10).
// Same Oracle ENUM issue as Enrollment.js — Oracle has no ENUM type.
// The CHECK constraint in schema.sql already enforces valid values at DB level.
// ─────────────────────────────────────────────────────────────────────────────
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/oracle');

const Attendance = sequelize.define('Attendance', {
  attendance_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'COURSES', key: 'course_id' },
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'STUDENTS', key: 'user_id' },
  },
  session_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  // FIX: was DataTypes.ENUM('present','absent','late','excused') — not valid in Oracle
  status: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: { isIn: [['present', 'absent', 'late', 'excused']] },
  },
}, {
  tableName: 'ATTENDANCE',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['student_id', 'course_id', 'session_date'] }, // CK from EERD
  ],
});

module.exports = Attendance;
