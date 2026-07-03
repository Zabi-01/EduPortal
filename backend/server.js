require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const { connectOracle }  = require('./config/oracle');
const { connectMongoDB } = require('./config/mongodb');

const authRoutes        = require('./routes/auth');
const courseRoutes      = require('./routes/courses');
const enrollmentRoutes  = require('./routes/enrollments');
const assignmentRoutes  = require('./routes/assignments');
const quizRoutes        = require('./routes/quizzes');
const attendanceRoutes  = require('./routes/attendance');
const gradeRoutes       = require('./routes/grades');
const userRoutes        = require('./routes/users');
const departmentRoutes  = require('./routes/departments');
const notificationRoutes = require('./routes/notifications');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/courses',       courseRoutes);
app.use('/api/enrollments',   enrollmentRoutes);
app.use('/api/assignments',   assignmentRoutes);
app.use('/api/quizzes',       quizRoutes);
app.use('/api/attendance',    attendanceRoutes);
app.use('/api/grades',        gradeRoutes);
app.use('/api/departments',   departmentRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

async function startServer() {
  try {
    await connectOracle();
    await connectMongoDB();
    app.listen(PORT, () => {
      console.log(`\nLMS Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
