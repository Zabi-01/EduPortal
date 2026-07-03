// ── BUG FIX #1 ────────────────────────────────────────────────────────────────
// REMOVED sync() call. Oracle 19c does NOT support "CREATE TABLE IF NOT EXISTS",
// so calling sequelize.sync() after schema.sql has already created the tables
// throws ORA-00955 ("name is already used by an existing object") and crashes
// the server on every startup. We only need authenticate() to verify the
// connection is alive; schema management is done via docs/schema.sql.
// ─────────────────────────────────────────────────────────────────────────────
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'oracle',
  username: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  host:     process.env.ORACLE_HOST || 'localhost',
  port:     Number(process.env.ORACLE_PORT) || 1521,
  database: process.env.ORACLE_SID || 'ORCLPDB',

  dialectOptions: {
    connectString: process.env.ORACLE_CONNECT_STRING || 'localhost:1521/ORCLPDB',
  },

  logging: process.env.NODE_ENV === 'development' ? console.log : false,

  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle:    10000,
  },
});

async function connectOracle() {
  try {
    await sequelize.authenticate();          // just verifies credentials & connectivity
    console.log('✅ Oracle DB connected');
    // NOTE: Do NOT call sequelize.sync() — tables are managed via docs/schema.sql
  } catch (err) {
    console.error('❌ Oracle connection failed:', err.message);
    throw err;
  }
}

module.exports = { sequelize, connectOracle };
