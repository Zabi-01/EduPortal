const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/oracle');

const Assignment = sequelize.define('Assignment', {
  assignment_id: {
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
  due_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  max_points: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'ASSIGNMENTS',
  timestamps: false,
});

module.exports = Assignment;
