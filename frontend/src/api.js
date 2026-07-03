const BASE = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('lms_token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login:    (body) => request('POST', '/auth/login', body),
  register: (body) => request('POST', '/auth/register', body),

  // Users
  getUsers:       ()     => request('GET',    '/users'),
  updateUser:     (id, b) => request('PUT',   `/users/${id}`, b),
  toggleUserActive: (id, b) => request('PATCH', `/users/${id}/status`, b),

  // Departments
  getDepartments:   ()     => request('GET',    '/departments'),
  createDepartment: (b)    => request('POST',   '/departments', b),
  updateDepartment: (id,b) => request('PUT',    `/departments/${id}`, b),
  deleteDepartment: (id)   => request('DELETE', `/departments/${id}`),

  // Courses
  getCourses:    ()      => request('GET',    '/courses'),
  getCourse:     (id)    => request('GET',    `/courses/${id}`),
  createCourse:  (b)     => request('POST',   '/courses', b),
  updateCourse:  (id, b) => request('PUT',    `/courses/${id}`, b),
  deleteCourse:  (id)    => request('DELETE', `/courses/${id}`),

  // Enrollments
  getEnrollments:    ()      => request('GET',    '/enrollments'),
  getMyEnrollments:  ()      => request('GET',    '/enrollments/my'),
  enroll:            (b)     => request('POST',   '/enrollments', b),
  updateEnrollment:  (id, b) => request('PUT',    `/enrollments/${id}`, b),
  dropEnrollment:    (id)    => request('DELETE', `/enrollments/${id}`),

  // Assignments
  getAssignments:   ()      => request('GET',    '/assignments'),
  createAssignment: (b)     => request('POST',   '/assignments', b),
  updateAssignment: (id, b) => request('PUT',    `/assignments/${id}`, b),
  deleteAssignment: (id)    => request('DELETE', `/assignments/${id}`),

  // Grades
  getMyGrades:    ()          => request('GET',  '/grades/my'),
  getGradesByStudent: (sid)   => request('GET',  `/grades/student/${sid}`),
  createGrade:    (b)         => request('POST', '/grades', b),
  updateGrade:    (id, b)     => request('PUT',  `/grades/${id}`, b),

  // Quizzes
  getQuizzes:   ()      => request('GET',  '/quizzes'),
  getQuiz:      (id)    => request('GET',  `/quizzes/${id}`),
  submitQuiz:   (id, b) => request('POST', `/quizzes/${id}/submit`, b),
  createQuiz:   (b)     => request('POST', '/quizzes', b),

  // Attendance
  getMyAttendance: ()      => request('GET',  '/attendance/my'),
  getAttendance:   (cid)   => request('GET',  `/attendance/course/${cid}`),
  markAttendance:  (b)     => request('POST', '/attendance', b),

  // Notifications
  getNotifications: ()   => request('GET',   '/notifications'),
  markRead:         (id) => request('PATCH', `/notifications/${id}/read`),
  markAllRead:      ()   => request('PATCH', '/notifications/read-all'),
};
