const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/oracle');

const Instructor = sequelize.define('Instructor', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'USERS', key: 'user_id' },
    onDelete: 'CASCADE',
  },
  employee_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,          // CK in EERD
  },
  office_location: {
    type: DataTypes.STRING(200),
  },
  // Multivalued attribute → stored as comma-separated or separate table
  phone_numbers: {
    type: DataTypes.STRING(500),
    get() {
      const raw = this.getDataValue('phone_numbers');
      return raw ? raw.split(',') : [];
    },
    set(val) {
      this.setDataValue('phone_numbers', Array.isArray(val) ? val.join(',') : val);
    },
  },
}, {
  tableName: 'INSTRUCTORS',
  timestamps: false,
});

module.exports = Instructor;
