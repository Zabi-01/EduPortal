const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/oracle');

const Quiz = sequelize.define('Quiz', {
  quiz_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'COURSES', key: 'course_id' },
  },
  title: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  open_date: {
    type: DataTypes.DATE,
  },
  close_date: {
    type: DataTypes.DATE,
  },
  total_points: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'QUIZZES',
  timestamps: false,
});

module.exports = Quiz;
