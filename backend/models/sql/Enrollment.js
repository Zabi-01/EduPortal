// ── BUG FIX #4 ────────────────────────────────────────────────────────────────
// REPLACED DataTypes.ENUM with DataTypes.STRING(20).
// Oracle has NO native ENUM type. Sequelize's Oracle dialect does not
// automatically translate ENUM into VARCHAR2+CHECK, so it throws
// "ORA-00902: invalid datatype" at sync time or emits broken DDL.
// The schema.sql already enforces the constraint via a CHECK clause;
// we just store it as a plain string and rely on that DB-level check.
// ─────────────────────────────────────────────────────────────────────────────
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/oracle');

const Enrollment = sequelize.define('Enrollment', {
  enrollment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'STUDENTS', key: 'user_id' },
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'COURSES', key: 'course_id' },
  },
  enrollment_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  // FIX: was DataTypes.ENUM('active','completed','dropped') — not valid in Oracle
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'active',
    validate: { isIn: [['active', 'completed', 'dropped']] },
  },
}, {
  tableName: 'ENROLLMENTS',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['student_id', 'course_id'] },  // CK from EERD
  ],
});

module.exports = Enrollment;
