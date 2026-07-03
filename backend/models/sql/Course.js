const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/oracle');

const Course = sequelize.define('Course', {
  course_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  course_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // FIX: renamed from 'level' — LEVEL is a reserved word in Oracle
  course_level: {
    type: DataTypes.STRING(50),
  },
  dept_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'DEPARTMENTS', key: 'dept_id' },
  },
  instructor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'INSTRUCTORS', key: 'user_id' },
  },
}, {
  tableName: 'COURSES',
  timestamps: false,
});

module.exports = Course;
