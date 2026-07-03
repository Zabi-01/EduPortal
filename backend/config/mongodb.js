// ── BUG FIX #2 ────────────────────────────────────────────────────────────────
// REMOVED deprecated Mongoose 8 options: useNewUrlParser & useUnifiedTopology.
// Mongoose 8 removed these options entirely — passing them throws a warning
// and in some versions causes an unhandled-options error. mongoose.connect()
// in v8+ uses the new unified topology driver by default; no flags needed.
// ─────────────────────────────────────────────────────────────────────────────
const mongoose = require('mongoose');

async function connectMongoDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    throw err;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

module.exports = { connectMongoDB };
