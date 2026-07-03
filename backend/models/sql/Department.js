const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/oracle');

const Department = sequelize.define('Department', {
  dept_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  dept_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,          // CK in EERD
  },
  dept_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
}, {
  tableName: 'DEPARTMENTS',
  timestamps: false,
});

module.exports = Department;
