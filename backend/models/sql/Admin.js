const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/oracle');

const Admin = sequelize.define('Admin', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'USERS', key: 'user_id' },
    onDelete: 'CASCADE',
  },
  admin_role: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  tableName: 'ADMINS',
  timestamps: false,
});

module.exports = Admin;
