const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/oracle');

const Grade = sequelize.define('Grade', {
  grade_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  assignment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'ASSIGNMENTS', key: 'assignment_id' },
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'STUDENTS', key: 'user_id' },
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  letter_grade: {
    type: DataTypes.STRING(5),   // A+, A, B+, etc.
  },
  graded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'GRADES',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['assignment_id', 'student_id'] }, // CK from EERD
  ],
});

module.exports = Grade;
