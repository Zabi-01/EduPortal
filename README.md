# EduPortal LMS — Full-Stack Setup Guide

## Architecture
- **Backend**: Node.js + Express  
- **Oracle DB (via Sequelize)**: Users, Courses, Enrollments, Grades, Attendance, Assignments, Quizzes  
- **MongoDB (via Mongoose)**: Notifications, Quiz Questions, Course Content  
- **Frontend**: React (JSX) — connects to backend via REST API  
- **Security**: JWT auth + RBAC (student / instructor / admin roles)

---

## 1. Oracle Database Setup (Oracle XE on localhost)

### Install Oracle XE 21c
Download from: https://www.oracle.com/database/technologies/xe-downloads.html  
After install, Oracle runs on `localhost:1521` with service `XEPDB1`.

### Create the LMS user and schema

Open SQL*Plus or SQL Developer, connect as SYSDBA:

```sql
-- Connect: sqlplus sys/your_sys_password@localhost:1521/XEPDB1 as sysdba
CREATE USER lms_user IDENTIFIED BY your_password;
GRANT CONNECT, RESOURCE, DBA TO lms_user;
```

Then connect as lms_user and run the full schema:
```
sqlplus lms_user/your_password@localhost:1521/XEPDB1 @docs/schema.sql
```

### Verify in SQL Developer
1. Open SQL Developer → New Connection  
2. Username: `lms_user`  
3. Password: your password  
4. Hostname: `localhost`  
5. Port: `1521`  
6. Service name: `XEPDB1`  
7. Click **Test** → should say "Success"

---

## 2. MongoDB Setup (MongoDB Compass on localhost)

### Install MongoDB Community Server
Download from: https://www.mongodb.com/try/download/community

Start the service:
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Connect in MongoDB Compass
1. Open MongoDB Compass  
2. Connection string: `mongodb://localhost:27017`  
3. Click **Connect**  
4. Create database: **lms_db** (it auto-creates on first write)

No schema setup needed — Mongoose creates collections automatically.

---

## 3. Backend Setup

```bash
cd lms-project/backend

# Install dependencies
npm install

# Copy environment file and fill in your credentials
cp .env.example .env
```

### Edit `.env`:
```env
ORACLE_USER=lms_user
ORACLE_PASSWORD=your_oracle_password
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SID=XEPDB1
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1

MONGO_URI=mongodb://localhost:27017/lms_db

JWT_SECRET=replace_with_random_32+_char_string
JWT_EXPIRES_IN=7d

PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Start the backend:
```bash
npm run dev
# or
node server.js
```

You should see:
```
Oracle DB connected & synced
MongoDB connected: localhost
LMS Server running on http://localhost:5000
```

### Test the API:
```
GET http://localhost:5000/api/health
```

---

## 4. Frontend Setup

The frontend is a React app (Vite or Create React App).

### With Vite (recommended):
```bash
cd lms-project/frontend
npm create vite@latest . -- --template react
# Replace src/App.jsx contents with LMSFrontend.jsx
npm install
npm run dev
# Runs on http://localhost:3000
```

### With Create React App:
```bash
npx create-react-app .
# Replace src/App.js with LMSFrontend.jsx
npm start
```

The API base URL is set to `http://localhost:5000/api` in `src/LMSFrontend.jsx`.

---

## 5. RBAC — Role Permissions

| Action | Student | Instructor | Admin |
|--------|---------|------------|-------|
| View own courses | ✓ | ✓ | ✓ |
| Browse & enroll | ✓ | — | ✓ |
| View own grades | ✓ | — | ✓ |
| View own attendance | ✓ | — | ✓ |
| Create assignments | — | ✓ | ✓ |
| Grade students | — | ✓ | ✓ |
| Mark attendance | — | ✓ | ✓ |
| Manage users | — | — | ✓ |
| Manage departments | — | — | ✓ |
| Manage courses | — | ✓ | ✓ |
| Delete courses | — | — | ✓ |

---

## 6. First User / Seeding Data

Register via the API (no UI register screen by default — for security):

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Admin",
    "last_name": "User",
    "email": "admin@lms.com",
    "username": "admin",
    "password": "Admin@1234",
    "role": "admin"
  }'
```

Then log in via the frontend with that email and password.

---

## 7. Troubleshooting

**Oracle connection fails:**
- Make sure Oracle XE is running: `lsnrctl status`
- Verify service name: `XEPDB1` (not `XE`)
- Check ORACLE_CONNECT_STRING in .env matches exactly

**MongoDB connection fails:**
- Run `mongod --version` to confirm it's installed
- Check `mongod` service is running
- Default URI: `mongodb://localhost:27017/lms_db`

**JWT errors on frontend:**
- Token stored in `localStorage` under key `lms_token`
- Clear site data and log in again if you see 401 errors

**CORS errors:**
- Make sure `FRONTEND_URL=http://localhost:3000` in `.env`
- Frontend must run on port 3000 or update CORS config in server.js
