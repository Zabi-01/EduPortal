const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/oracle');

const QuizResult = sequelize.define('QuizResult', {
  result_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  quiz_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'QUIZZES', key: 'quiz_id' },
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
    type: DataTypes.STRING(5),
  },
  attempted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'QUIZ_RESULTS',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['quiz_id', 'student_id'] }, // CK from EERD
  ],
});

module.exports = QuizResult;
