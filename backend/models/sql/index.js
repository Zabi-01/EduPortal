// ── BUG FIX #3 ────────────────────────────────────────────────────────────────
// ADDED missing `as` aliases to every belongsTo/hasMany association that lacked
// them. Without `as`, Sequelize throws:
//   "Association with alias '<name>' does not exist on <Model>"
// whenever a route uses { model: X, as: 'name' } in an include clause.
// Every route already assumed lowercase aliases ('course', 'student',
// 'assignment', etc.), so we align the association definitions to match.
// ─────────────────────────────────────────────────────────────────────────────

const User           = require('./User');
const Student        = require('./Student');
const Instructor     = require('./Instructor');
const Admin          = require('./Admin');
const Department     = require('./Department');
const Course         = require('./Course');
const StudentProfile = require('./StudentProfile');
const Enrollment     = require('./Enrollment');
const Assignment     = require('./Assignment');
const Quiz           = require('./Quiz');
const Attendance     = require('./Attendance');
const Grade          = require('./Grade');
const QuizResult     = require('./QuizResult');

// ── USER → subclasses (disjoint total specialisation 'd' in EERD) ─────────────
User.hasOne(Student,    { foreignKey: 'user_id', as: 'studentInfo'    });
User.hasOne(Instructor, { foreignKey: 'user_id', as: 'instructorInfo' });
User.hasOne(Admin,      { foreignKey: 'user_id', as: 'adminInfo'      });
Student.belongsTo(User,    { foreignKey: 'user_id' });
Instructor.belongsTo(User, { foreignKey: 'user_id' });
Admin.belongsTo(User,      { foreignKey: 'user_id' });

// ── DEPARTMENT offers COURSE (1,N) ────────────────────────────────────────────
Department.hasMany(Course,   { foreignKey: 'dept_id',       as: 'courses'    });
Course.belongsTo(Department, { foreignKey: 'dept_id',       as: 'department' });

// ── INSTRUCTOR teaches COURSE (1,N) ───────────────────────────────────────────
Instructor.hasMany(Course,   { foreignKey: 'instructor_id', as: 'taughtCourses' });
Course.belongsTo(Instructor, { foreignKey: 'instructor_id', as: 'instructor'    });

// ── STUDENT has STUDENTPROFILE (1,1) ─────────────────────────────────────────
Student.hasOne(StudentProfile,   { foreignKey: 'student_id', as: 'profile' });
StudentProfile.belongsTo(Student, { foreignKey: 'student_id'                });

// ── STUDENT enrols COURSE via ENROLLMENT (M:N) ───────────────────────────────
Student.belongsToMany(Course, {
  through: Enrollment, foreignKey: 'student_id', otherKey: 'course_id',
  as: 'enrolledCourses',
});
Course.belongsToMany(Student, {
  through: Enrollment, foreignKey: 'course_id', otherKey: 'student_id',
  as: 'enrolledStudents',
});
// FIX: added as: 'student' and as: 'course' so routes can include them by alias
Enrollment.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
Enrollment.belongsTo(Course,  { foreignKey: 'course_id',  as: 'course'  });

// ── COURSE includes ASSIGNMENT (1,N) ─────────────────────────────────────────
Course.hasMany(Assignment,   { foreignKey: 'course_id', as: 'assignments' });
// FIX: added as: 'course'
Assignment.belongsTo(Course, { foreignKey: 'course_id', as: 'course'      });

// ── COURSE includes QUIZ (1,N) ───────────────────────────────────────────────
Course.hasMany(Quiz,   { foreignKey: 'course_id', as: 'quizzes' });
// FIX: added as: 'course'
Quiz.belongsTo(Course, { foreignKey: 'course_id', as: 'course'  });

// ── ATTENDANCE (COURSE + STUDENT) ────────────────────────────────────────────
Student.hasMany(Attendance, { foreignKey: 'student_id', as: 'attendanceRecords' });
Course.hasMany(Attendance,  { foreignKey: 'course_id',  as: 'attendanceRecords' });
// FIX: added as: 'student' and as: 'course'
Attendance.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
Attendance.belongsTo(Course,  { foreignKey: 'course_id',  as: 'course'  });

// ── GRADE (ASSIGNMENT + STUDENT) ─────────────────────────────────────────────
Assignment.hasMany(Grade, { foreignKey: 'assignment_id', as: 'grades' });
Student.hasMany(Grade,    { foreignKey: 'student_id',    as: 'grades' });
// FIX: added as: 'assignment' and as: 'student'
Grade.belongsTo(Assignment, { foreignKey: 'assignment_id', as: 'assignment' });
Grade.belongsTo(Student,    { foreignKey: 'student_id',    as: 'student'    });

// ── QUIZ_RESULT (QUIZ + STUDENT) ─────────────────────────────────────────────
Quiz.hasMany(QuizResult,    { foreignKey: 'quiz_id',    as: 'results'     });
Student.hasMany(QuizResult, { foreignKey: 'student_id', as: 'quizResults' });
// FIX: added as: 'quiz' and as: 'student'
QuizResult.belongsTo(Quiz,    { foreignKey: 'quiz_id',    as: 'quiz'    });
QuizResult.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

module.exports = {
  User, Student, Instructor, Admin,
  Department, Course, StudentProfile,
  Enrollment, Assignment, Quiz,
  Attendance, Grade, QuizResult,
};
