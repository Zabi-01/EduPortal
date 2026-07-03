const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/oracle');

const Student = sequelize.define('Student', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'USERS', key: 'user_id' },
    onDelete: 'CASCADE',
  },
  student_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,          // CK in EERD
  },
  enrollment_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'STUDENTS',
  timestamps: false,
});

module.exports = Student;
