-- ============================================================
-- LMS Oracle Schema — mirrors the EERD exactly
-- Run in order; each section depends on the previous.
-- ============================================================

-- 1. USERS (supertype)
CREATE TABLE USERS (
    user_id        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name     VARCHAR2(100)  NOT NULL,
    last_name      VARCHAR2(100)  NOT NULL,
    email          VARCHAR2(255)  NOT NULL,
    username       VARCHAR2(100)  NOT NULL,
    password_hash  VARCHAR2(255)  NOT NULL,
    created_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    is_active      NUMBER(1)      DEFAULT 1 CHECK (is_active IN (0,1)),
    CONSTRAINT uq_users_email    UNIQUE (email),     -- CK
    CONSTRAINT uq_users_username UNIQUE (username)   -- CK
);

-- 2. STUDENTS (subtype — disjoint)
CREATE TABLE STUDENTS (
    user_id         NUMBER PRIMARY KEY,
    student_number  VARCHAR2(50) NOT NULL,
    enrollment_year NUMBER(4)   NOT NULL,
    CONSTRAINT fk_students_user   FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT uq_student_number  UNIQUE (student_number)  -- CK
);

-- 3. INSTRUCTORS (subtype)
CREATE TABLE INSTRUCTORS (
    user_id         NUMBER PRIMARY KEY,
    employee_number VARCHAR2(50)  NOT NULL,
    office_location VARCHAR2(200),
    phone_numbers   VARCHAR2(500),              -- multivalued: comma-separated
    CONSTRAINT fk_instructors_user   FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT uq_employee_number    UNIQUE (employee_number)  -- CK
);

-- 4. ADMINS (subtype)
CREATE TABLE ADMINS (
    user_id    NUMBER PRIMARY KEY,
    admin_role VARCHAR2(100) NOT NULL,
    CONSTRAINT fk_admins_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

-- 5. DEPARTMENTS
CREATE TABLE DEPARTMENTS (
    dept_id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dept_code VARCHAR2(20)  NOT NULL,
    dept_name VARCHAR2(200) NOT NULL,
    CONSTRAINT uq_dept_code UNIQUE (dept_code)   -- CK
);

-- 6. COURSES
CREATE TABLE COURSES (
    course_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_code   VARCHAR2(20)  NOT NULL,
    title         VARCHAR2(300) NOT NULL,
    description   CLOB,
    credits       NUMBER        NOT NULL,
    course_level  VARCHAR2(50),
    dept_id       NUMBER        NOT NULL,
    instructor_id NUMBER        NOT NULL,
    CONSTRAINT uq_course_code      UNIQUE (course_code),   -- CK
    CONSTRAINT fk_course_dept      FOREIGN KEY (dept_id)       REFERENCES DEPARTMENTS(dept_id),
    CONSTRAINT fk_course_instructor FOREIGN KEY (instructor_id) REFERENCES INSTRUCTORS(user_id)
);

-- 7. STUDENT_PROFILES
CREATE TABLE STUDENT_PROFILES (
    profile_id              NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id              NUMBER NOT NULL,
    date_of_birth           DATE,
    address                 CLOB,
    emergency_contact_name  VARCHAR2(200),
    emergency_contact_phone VARCHAR2(50),
    CONSTRAINT fk_profile_student FOREIGN KEY (student_id) REFERENCES STUDENTS(user_id) ON DELETE CASCADE,
    CONSTRAINT uq_profile_student UNIQUE (student_id)   -- FK + CK
);

-- 8. ENROLLMENTS
CREATE TABLE ENROLLMENTS (
    enrollment_id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id      NUMBER NOT NULL,
    course_id       NUMBER NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status          VARCHAR2(20) DEFAULT 'active'
                        CHECK (status IN ('active','completed','dropped')),
    CONSTRAINT fk_enrol_student FOREIGN KEY (student_id) REFERENCES STUDENTS(user_id),
    CONSTRAINT fk_enrol_course  FOREIGN KEY (course_id)  REFERENCES COURSES(course_id),
    CONSTRAINT uq_enrollment    UNIQUE (student_id, course_id)  -- CK
);

-- 9. ASSIGNMENTS
CREATE TABLE ASSIGNMENTS (
    assignment_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id     NUMBER        NOT NULL,
    title         VARCHAR2(300) NOT NULL,
    due_date      TIMESTAMP     NOT NULL,
    max_points    NUMBER(8,2)   NOT NULL,
    description   CLOB,
    CONSTRAINT fk_assign_course FOREIGN KEY (course_id) REFERENCES COURSES(course_id) ON DELETE CASCADE
);

-- 10. QUIZZES
CREATE TABLE QUIZZES (
    quiz_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id    NUMBER        NOT NULL,
    title        VARCHAR2(300) NOT NULL,
    open_date    TIMESTAMP,
    close_date   TIMESTAMP,
    total_points NUMBER(8,2)   NOT NULL,
    CONSTRAINT fk_quiz_course FOREIGN KEY (course_id) REFERENCES COURSES(course_id) ON DELETE CASCADE
);

-- 11. ATTENDANCE
CREATE TABLE ATTENDANCE (
    attendance_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id     NUMBER     NOT NULL,
    student_id    NUMBER     NOT NULL,
    session_date  DATE       NOT NULL,
    status        VARCHAR2(10) NOT NULL
                      CHECK (status IN ('present','absent','late','excused')),
    CONSTRAINT fk_att_course  FOREIGN KEY (course_id)  REFERENCES COURSES(course_id),
    CONSTRAINT fk_att_student FOREIGN KEY (student_id) REFERENCES STUDENTS(user_id),
    CONSTRAINT uq_attendance  UNIQUE (student_id, course_id, session_date)  -- CK
);

-- 12. GRADES
CREATE TABLE GRADES (
    grade_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    assignment_id NUMBER      NOT NULL,
    student_id    NUMBER      NOT NULL,
    score         NUMBER(8,2) NOT NULL,
    letter_grade  VARCHAR2(5),
    graded_at     TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_grade_assignment FOREIGN KEY (assignment_id) REFERENCES ASSIGNMENTS(assignment_id) ON DELETE CASCADE,
    CONSTRAINT fk_grade_student    FOREIGN KEY (student_id)    REFERENCES STUDENTS(user_id),
    CONSTRAINT uq_grade            UNIQUE (assignment_id, student_id)  -- CK
);

-- 13. QUIZ_RESULTS
CREATE TABLE QUIZ_RESULTS (
    result_id    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    quiz_id      NUMBER      NOT NULL,
    student_id   NUMBER      NOT NULL,
    score        NUMBER(8,2) NOT NULL,
    letter_grade VARCHAR2(5),
    attempted_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_qr_quiz    FOREIGN KEY (quiz_id)    REFERENCES QUIZZES(quiz_id) ON DELETE CASCADE,
    CONSTRAINT fk_qr_student FOREIGN KEY (student_id) REFERENCES STUDENTS(user_id),
    CONSTRAINT uq_quiz_result UNIQUE (quiz_id, student_id)  -- CK
);

-- ── Indexes for common queries ──────────────────────────────────────────────
CREATE INDEX idx_courses_dept       ON COURSES(dept_id);
CREATE INDEX idx_courses_instructor ON COURSES(instructor_id);
CREATE INDEX idx_enrollments_student ON ENROLLMENTS(student_id);
CREATE INDEX idx_enrollments_course  ON ENROLLMENTS(course_id);
CREATE INDEX idx_grades_student      ON GRADES(student_id);
CREATE INDEX idx_attendance_date     ON ATTENDANCE(session_date);
