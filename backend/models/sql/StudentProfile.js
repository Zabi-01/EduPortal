const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/oracle');

const StudentProfile = sequelize.define('StudentProfile', {
  profile_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,          // FK + CK in EERD
    references: { model: 'STUDENTS', key: 'user_id' },
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
  },
  address: {
    type: DataTypes.TEXT,
  },
  emergency_contact_name: {
    type: DataTypes.STRING(200),
  },
  emergency_contact_phone: {
    type: DataTypes.STRING(50),
  },
}, {
  tableName: 'STUDENT_PROFILES',
  timestamps: false,
});

module.exports = StudentProfile;
