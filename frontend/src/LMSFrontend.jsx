import { useState, useEffect, useCallback, createContext, useContext } from "react";

// ── API Client ────────────────────────────────────────────────────────────────
const BASE = "http://localhost:5000/api";

function getToken() { return localStorage.getItem("lms_token"); }
function setToken(t) { localStorage.setItem("lms_token", t); }
function clearToken() { localStorage.removeItem("lms_token"); }

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

const api = {
  login:    (b)     => request("POST", "/auth/login", b),
  register: (b)     => request("POST", "/auth/register", b),
  getUsers: ()      => request("GET",  "/users"),
  toggleUser: (id,b) => request("PATCH", `/users/${id}/status`, b),
  getDepartments:   ()      => request("GET",    "/departments"),
  createDepartment: (b)     => request("POST",   "/departments", b),
  deleteDepartment: (id)    => request("DELETE", `/departments/${id}`),
  getCourses:       ()      => request("GET",  "/courses"),
  createCourse:     (b)     => request("POST", "/courses", b),
  deleteCourse:     (id)    => request("DELETE", `/courses/${id}`),
  getMyEnrollments: ()      => request("GET",  "/enrollments/my"),
  getAllEnrollments: ()      => request("GET",  "/enrollments"),
  enroll:           (b)     => request("POST", "/enrollments", b),
  dropEnrollment:   (id)    => request("DELETE", `/enrollments/${id}`),
  getAssignments:   ()      => request("GET",  "/assignments"),
  createAssignment: (b)     => request("POST", "/assignments", b),
  getMyGrades:      ()      => request("GET",  "/grades/my"),
  createGrade:      (b)     => request("POST", "/grades", b),
  getQuizzes:       ()      => request("GET",  "/quizzes"),
  getQuiz:          (id)    => request("GET",  `/quizzes/${id}`),
  submitQuiz:       (id,b)  => request("POST", `/quizzes/${id}/submit`, b),
  getMyAttendance:  ()      => request("GET",  "/attendance/my"),
  markAttendance:   (b)     => request("POST", "/attendance", b),
  getNotifications: ()      => request("GET",  "/notifications"),
  markRead:         (id)    => request("PATCH", `/notifications/${id}/read`),
  markAllRead:      ()      => request("PATCH", "/notifications/read-all"),
};

// ── Theme ─────────────────────────────────────────────────────────────────────
const T = {
  bg: "#0B0F19", bgCard: "#111827", bgHover: "#1a2235",
  border: "#1f2d45", accent: "#3B82F6", accentHover: "#2563EB",
  accentSoft: "rgba(59,130,246,0.12)",
  success: "#10B981", warning: "#F59E0B", danger: "#EF4444",
  textPrimary: "#F9FAFB", textSecondary: "#9CA3AF", textMuted: "#6B7280",
  gradient: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: ${T.bg}; color: ${T.textPrimary}; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: ${T.bg}; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
  input, select, textarea {
    font-family: inherit; background: #0d1424; border: 1px solid ${T.border};
    color: ${T.textPrimary}; border-radius: 8px; padding: 9px 13px;
    width: 100%; font-size: 14px; transition: border-color 0.2s; outline: none;
  }
  input:focus, select:focus, textarea:focus { border-color: ${T.accent}; }
  button { font-family: inherit; cursor: pointer; border: none; outline: none; }
  a { color: ${T.accent}; text-decoration: none; }
  .mono { font-family: 'JetBrains Mono', monospace; }
`;

// ── Auth Context ──────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

// ── UI Primitives ─────────────────────────────────────────────────────────────
function Btn({ children, variant = "primary", size = "md", onClick, disabled, style = {}, type = "button" }) {
  const sz = { sm: { padding: "5px 13px", fontSize: "12px" }, md: { padding: "9px 18px", fontSize: "14px" }, lg: { padding: "12px 26px", fontSize: "15px" } };
  const vr = {
    primary:   { background: T.accent,   color: "#fff", fontWeight: 600 },
    secondary: { background: T.bgCard,   color: T.textPrimary, border: `1px solid ${T.border}`, fontWeight: 500 },
    danger:    { background: T.danger,   color: "#fff", fontWeight: 600 },
    ghost:     { background: "transparent", color: T.textSecondary, fontWeight: 500 },
    success:   { background: T.success,  color: "#fff", fontWeight: 600 },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...sz[size], ...vr[variant], borderRadius: 8, transition: "all 0.15s",
        opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex", alignItems: "center", gap: 6, ...style }}>
      {children}
    </button>
  );
}

function Card({ children, style = {}, hover = false }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => hover && setH(true)} onMouseLeave={() => hover && setH(false)}
      style={{ background: h ? T.bgHover : T.bgCard, border: `1px solid ${h ? T.accent + "44" : T.border}`,
        borderRadius: 12, padding: 20, transition: "all 0.2s", ...style }}>
      {children}
    </div>
  );
}

function Badge({ children, color }) {
  const c = { blue: ["rgba(59,130,246,0.15)","#60a5fa"], green: ["rgba(16,185,129,0.15)","#34d399"],
    yellow: ["rgba(245,158,11,0.15)","#fbbf24"], red: ["rgba(239,68,68,0.15)","#f87171"],
    gray: ["rgba(107,114,128,0.15)","#9ca3af"], purple: ["rgba(139,92,246,0.15)","#a78bfa"] }[color] || ["rgba(107,114,128,0.15)","#9ca3af"];
  return <span style={{ background: c[0], color: c[1], borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{children}</span>;
}

function StatusBadge({ status }) {
  const m = { active: "green", completed: "blue", dropped: "red", open: "green", closed: "gray",
    present: "green", absent: "red", late: "yellow", excused: "purple" };
  return <Badge color={m[status] || "gray"}>{status}</Badge>;
}

function GradeBadge({ grade }) {
  const c = !grade ? "gray" : grade.startsWith("A") ? "green" : grade.startsWith("B") ? "blue" : grade.startsWith("C") ? "yellow" : "red";
  return <Badge color={c}>{grade || "—"}</Badge>;
}

function Avatar({ name = "", size = 36 }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  const colors = ["#3B82F6","#8B5CF6","#10B981","#F59E0B","#EF4444","#06B6D4"];
  const color = colors[name.charCodeAt(0) % colors.length] || colors[0];
  return <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{initials}</div>;
}

function StatCard({ label, value, color = T.accent }) {
  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 26, fontWeight: 700, color }}>{value ?? "—"}</div>
      <div style={{ fontSize: 13, color: T.textSecondary }}>{label}</div>
    </Card>
  );
}

function ProgressBar({ value, max, color = T.accent }) {
  const pct = max ? Math.min((value / max) * 100, 100) : 0;
  return <div style={{ background: T.border, borderRadius: 4, height: 5, overflow: "hidden" }}>
    <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.3s" }} />
  </div>;
}

function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", color: T.textMuted, fontSize: 18, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ padding: "20px 22px" }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>{label}</label>
    {children}
    {hint && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 3 }}>{hint}</div>}
  </div>;
}

function Table({ headers, rows, empty = "No records" }) {
  return <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${T.border}` }}>
          {headers.map(h => <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {!rows.length ? <tr><td colSpan={headers.length} style={{ padding: "28px 12px", textAlign: "center", color: T.textMuted }}>{empty}</td></tr>
          : rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${T.border}20` }}
            onMouseEnter={e => e.currentTarget.style.background = T.bgHover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            {row.map((cell, j) => <td key={j} style={{ padding: "11px 12px", verticalAlign: "middle" }}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>;
}

function Tabs({ tabs, active, onChange }) {
  return <div style={{ display: "flex", gap: 3, background: T.bgCard, borderRadius: 10, padding: 4, marginBottom: 20, flexWrap: "wrap" }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)}
        style={{ padding: "7px 16px", borderRadius: 7, fontSize: 13, fontWeight: 500,
          background: active === t.id ? T.accent : "transparent",
          color: active === t.id ? "#fff" : T.textSecondary, transition: "all 0.15s" }}>
        {t.label}
      </button>
    ))}
  </div>;
}

function Spinner() {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
    <div style={{ width: 28, height: 28, border: `3px solid ${T.border}`, borderTopColor: T.accent, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>;
}

function Alert({ type, msg }) {
  if (!msg) return null;
  const c = type === "error" ? T.danger : T.success;
  return <div style={{ background: `${c}18`, border: `1px solid ${c}40`, color: c, borderRadius: 8, padding: "9px 14px", fontSize: 13, marginBottom: 14 }}>{msg}</div>;
}

// ── Login Page ────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true); setError("");
    try {
      const res = await api.login({ email, password });
      setToken(res.token);
      onLogin({ ...res.user, token: res.token });
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ position: "fixed", top: -180, right: -180, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: T.gradient, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, background: T.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>EduPortal LMS</h1>
          <p style={{ color: T.textSecondary, marginTop: 5, fontSize: 13 }}>Sign in to your account</p>
        </div>
        <Card>
          <Field label="Email">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </Field>
          <Field label="Password">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </Field>
          <Alert type="error" msg={error} />
          <Btn onClick={handleLogin} disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Signing in..." : "Sign In"}
          </Btn>
          <p style={{ fontSize: 12, color: T.textMuted, marginTop: 14, textAlign: "center" }}>
            Enter your registered email and password
          </p>
        </Card>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ role, page, setPage, user, unread }) {
  const nav = {
    student: [
      { id: "dashboard",    label: "Dashboard" },
      { id: "courses",      label: "My Courses" },
      { id: "browse",       label: "Browse Courses" },
      { id: "assignments",  label: "Assignments" },
      { id: "quizzes",      label: "Quizzes" },
      { id: "grades",       label: "Grades" },
      { id: "attendance",   label: "Attendance" },
      { id: "notifications",label: "Notifications", badge: unread },
      { id: "profile",      label: "Profile" },
    ],
    instructor: [
      { id: "dashboard",    label: "Dashboard" },
      { id: "my-courses",   label: "My Courses" },
      { id: "assignments",  label: "Assignments" },
      { id: "quizzes",      label: "Quizzes" },
      { id: "grades-mgmt",  label: "Grade Book" },
      { id: "attendance-mgmt", label: "Attendance" },
      { id: "students",     label: "Students" },
      { id: "notifications",label: "Notifications", badge: unread },
    ],
    admin: [
      { id: "dashboard",   label: "Dashboard" },
      { id: "users",       label: "Users" },
      { id: "courses",     label: "Courses" },
      { id: "departments", label: "Departments" },
      { id: "enrollments", label: "Enrollments" },
      { id: "notifications",label: "Notifications", badge: unread },
    ],
  };

  return (
    <div style={{ width: 214, flexShrink: 0, background: T.bgCard, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>
      <div style={{ padding: "18px 14px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: T.gradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>EduPortal</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>LMS</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Avatar name={`${user.first_name || ""} ${user.last_name || ""}`} size={32} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.first_name} {user.last_name}</div>
            <Badge color={role === "admin" ? "red" : role === "instructor" ? "purple" : "blue"}>{role}</Badge>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "8px 6px", overflowY: "auto" }}>
        {(nav[role] || []).map(item => (
          <button key={item.id} onClick={() => setPage(item.id)}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 7, marginBottom: 1,
              display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, fontWeight: 500,
              background: page === item.id ? T.accentSoft : "transparent",
              color: page === item.id ? T.accent : T.textSecondary, textAlign: "left", transition: "all 0.12s",
              borderLeft: `3px solid ${page === item.id ? T.accent : "transparent"}` }}>
            <span>{item.label}</span>
            {item.badge > 0 && <span style={{ background: T.danger, color: "#fff", borderRadius: 9, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>{item.badge}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}

// ── useData hook ──────────────────────────────────────────────────────────────
function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    setState(s => ({ ...s, loading: true, error: null }));
    fn().then(res => setState({ data: res.data, loading: false, error: null }))
       .catch(e  => setState({ data: null, loading: false, error: e.message }));
  }, deps);
  return state;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ user, setPage }) {
  const enrollments = useAsync(user.role === "student" ? api.getMyEnrollments : api.getAllEnrollments);
  const courses      = useAsync(api.getCourses);
  const grades       = useAsync(user.role === "student" ? api.getMyGrades : () => Promise.resolve({ data: [] }));
  const assignments  = useAsync(api.getAssignments);

  if (enrollments.loading || courses.loading) return <Spinner />;

  const myEnrollments = enrollments.data || [];
  const allCourses    = courses.data || [];
  const myGrades      = grades.data || [];
  const allAssignments = assignments.data || [];

  if (user.role === "student") {
    const active = myEnrollments.filter(e => e.status === "active");
    const avg = myGrades.length
      ? (myGrades.reduce((s, g) => s + Number(g.score), 0) / myGrades.length).toFixed(1)
      : null;
    const due = allAssignments.filter(a =>
      active.some(e => e.course_id === a.course_id) && new Date(a.due_date) > new Date()
    ).length;
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Welcome back, {user.first_name}</h2>
          <p style={{ color: T.textSecondary, marginTop: 3, fontSize: 13 }}>Here is your learning overview</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 24 }}>
          <StatCard label="Active Courses" value={active.length} color={T.accent} />
          <StatCard label="Avg Score" value={avg ? `${avg}%` : "—"} color={T.success} />
          <StatCard label="Assignments Due" value={due} color={T.warning} />
          <StatCard label="Grades Received" value={myGrades.length} color="#8B5CF6" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Enrolled Courses</h3>
            {active.length === 0 ? <p style={{ color: T.textMuted, fontSize: 13 }}>No active enrollments</p> :
              active.slice(0, 4).map(e => {
                const c = allCourses.find(x => x.course_id === e.course_id);
                return c ? (
                  <div key={e.enrollment_id} onClick={() => setPage("courses")}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, background: T.bg, marginBottom: 6, cursor: "pointer" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 7, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: T.textMuted }}>{c.course_code}</div>
                    </div>
                  </div>
                ) : null;
              })
            }
          </Card>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Recent Grades</h3>
            {myGrades.length === 0 ? <p style={{ color: T.textMuted, fontSize: 13 }}>No grades yet</p> :
              myGrades.slice(0, 4).map(g => (
                <div key={g.grade_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.border}20` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{g.assignment_title || "Assignment"}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{g.score} / {g.max_points}</div>
                  </div>
                  <GradeBadge grade={g.letter_grade} />
                </div>
              ))
            }
          </Card>
        </div>
      </div>
    );
  }

  if (user.role === "instructor") {
    const myCourses = allCourses.filter(c => c.instructor_id === user.user_id);
    const totalStudents = myCourses.reduce((s, c) => s + (c.enrolled_count || 0), 0);
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Instructor Dashboard</h2>
          <p style={{ color: T.textSecondary, marginTop: 3, fontSize: 13 }}>Manage your courses and students</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 24 }}>
          <StatCard label="My Courses" value={myCourses.length} color={T.accent} />
          <StatCard label="Total Students" value={totalStudents} color={T.success} />
          <StatCard label="Assignments" value={allAssignments.length} color={T.warning} />
        </div>
        <Card>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>My Courses</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
            {myCourses.map(c => (
              <div key={c.course_id} style={{ padding: "12px 14px", borderRadius: 10, background: T.bg, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, marginBottom: 3 }}>{c.course_code}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{c.title}</div>
                <Badge color="green">{c.enrolled_count || 0} students</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Admin
  const users_ = useAsync(api.getUsers);
  const depts  = useAsync(api.getDepartments);
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Admin Dashboard</h2>
        <p style={{ color: T.textSecondary, marginTop: 3, fontSize: 13 }}>System overview</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Users" value={(users_.data || []).length} color={T.accent} />
        <StatCard label="Courses" value={allCourses.length} color={T.success} />
        <StatCard label="Departments" value={(depts.data || []).length} color={T.warning} />
        <StatCard label="Enrollments" value={myEnrollments.length} color="#8B5CF6" />
      </div>
    </div>
  );
}

// ── Courses Page ──────────────────────────────────────────────────────────────
function CoursesPage({ user }) {
  const enrollments = useAsync(api.getMyEnrollments);
  const courses     = useAsync(api.getCourses);

  if (enrollments.loading || courses.loading) return <Spinner />;
  const allCourses = courses.data || [];
  const myEnrolled = (enrollments.data || []).filter(e => e.status === "active");
  const myCourses  = myEnrolled.map(e => ({ ...allCourses.find(c => c.course_id === e.course_id), enrollment: e })).filter(c => c.course_id);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>My Courses</h2>
        <p style={{ color: T.textSecondary, fontSize: 13, marginTop: 3 }}>{myEnrolled.length} active enrollments</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14 }}>
        {myCourses.map(c => (
          <Card key={c.course_id} hover style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: 14, right: 14 }}>
              <StatusBadge status={c.enrollment.status} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, marginBottom: 3 }}>{c.course_code}</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 5, paddingRight: 60 }}>{c.title}</h3>
            <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 10 }}>{c.department?.dept_name || c.dept_name}</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Badge color="blue">{c.level}</Badge>
              <Badge color="gray">{c.credits} credits</Badge>
            </div>
          </Card>
        ))}
        {myCourses.length === 0 && <Card><p style={{ color: T.textMuted, fontSize: 13 }}>Not enrolled in any courses. Browse to enroll.</p></Card>}
      </div>
    </div>
  );
}

function BrowseCoursesPage({ user }) {
  const courses = useAsync(api.getCourses);
  const depts   = useAsync(api.getDepartments);
  const enrollments = useAsync(api.getMyEnrollments);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [enrolling, setEnrolling] = useState(null);

  if (courses.loading) return <Spinner />;
  const allCourses = courses.data || [];
  const myEnrolled = (enrollments.data || []).map(e => e.course_id);
  const filtered = allCourses.filter(c => {
    const q = search.toLowerCase();
    return (!q || c.title.toLowerCase().includes(q) || c.course_code.toLowerCase().includes(q))
      && (dept === "all" || c.dept_id === Number(dept));
  });

  const handleEnroll = async (course_id) => {
    setEnrolling(course_id);
    try {
      await api.enroll({ course_id });
      setMsg({ type: "success", text: "Enrolled successfully!" });
      enrollments.reload?.();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setEnrolling(null);
      setTimeout(() => setMsg({ type: "", text: "" }), 3000);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Browse Courses</h2>
        <p style={{ color: T.textSecondary, fontSize: 13, marginTop: 3 }}>Explore all available courses</p>
      </div>
      <Alert type={msg.type} msg={msg.text} />
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..." style={{ flex: 1, minWidth: 180, maxWidth: 300 }} />
        <select value={dept} onChange={e => setDept(e.target.value)} style={{ width: "auto" }}>
          <option value="all">All Departments</option>
          {(depts.data || []).map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14 }}>
        {filtered.map(c => {
          const enrolled = myEnrolled.includes(c.course_id);
          return (
            <Card key={c.course_id} hover>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, marginBottom: 3 }}>{c.course_code}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 5 }}>{c.title}</h3>
              <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 10 }}>{c.department?.dept_name}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                <Badge color="blue">{c.level}</Badge>
                <Badge color="gray">{c.credits} credits</Badge>
              </div>
              {enrolled
                ? <Btn size="sm" variant="secondary" disabled style={{ width: "100%", justifyContent: "center" }}>Enrolled</Btn>
                : <Btn size="sm" onClick={() => handleEnroll(c.course_id)} disabled={enrolling === c.course_id} style={{ width: "100%", justifyContent: "center" }}>
                    {enrolling === c.course_id ? "Enrolling..." : "Enroll"}
                  </Btn>
              }
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Assignments Page ──────────────────────────────────────────────────────────
function AssignmentsPage({ user }) {
  const { data: assignments, loading } = useAsync(api.getAssignments);
  const { data: courses } = useAsync(api.getCourses);
  const { data: enrollments } = useAsync(user.role === "student" ? api.getMyEnrollments : () => Promise.resolve({ data: [] }));
  const [tab, setTab] = useState("upcoming");
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ title: "", due_date: "", max_points: 100, course_id: "", description: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });

  if (loading) return <Spinner />;
  const allCourses = courses || [];
  const myEnrolledIds = user.role === "student" ? (enrollments || []).filter(e => e.status === "active").map(e => e.course_id) : [];
  const myCourseIds   = user.role === "instructor" ? allCourses.filter(c => c.instructor_id === user.user_id).map(c => c.course_id) : [];
  const myAssignments = user.role === "student"
    ? (assignments || []).filter(a => myEnrolledIds.includes(a.course_id))
    : user.role === "instructor"
      ? (assignments || []).filter(a => myCourseIds.includes(a.course_id))
      : assignments || [];
  const now = new Date();
  const upcoming = myAssignments.filter(a => new Date(a.due_date) > now);
  const past = myAssignments.filter(a => new Date(a.due_date) <= now);
  const shown = tab === "upcoming" ? upcoming : past;

  const handleAdd = async () => {
    try {
      await api.createAssignment({ ...form, max_points: Number(form.max_points), course_id: Number(form.course_id) });
      setMsg({ type: "success", text: "Assignment created" });
      setAddModal(false);
    } catch (e) { setMsg({ type: "error", text: e.message }); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Assignments</h2>
          <p style={{ color: T.textSecondary, fontSize: 13, marginTop: 3 }}>{upcoming.length} upcoming</p>
        </div>
        {user.role !== "student" && <Btn onClick={() => setAddModal(true)}>+ New Assignment</Btn>}
      </div>
      <Alert type={msg.type} msg={msg.text} />
      <Tabs tabs={[{ id: "upcoming", label: `Upcoming (${upcoming.length})` }, { id: "past", label: `Past (${past.length})` }]} active={tab} onChange={setTab} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {shown.map(a => {
          const course = allCourses.find(c => c.course_id === a.course_id);
          const daysLeft = Math.ceil((new Date(a.due_date) - now) / 86400000);
          return (
            <Card key={a.assignment_id}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{a.title}</span>
                    <Badge color="gray">{course?.course_code}</Badge>
                  </div>
                  <p style={{ fontSize: 12, color: T.textSecondary, marginTop: 3 }}>{a.description}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: daysLeft <= 3 && daysLeft > 0 ? T.danger : T.warning }}>
                    {daysLeft > 0 ? `${daysLeft}d left` : "Overdue"}
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{a.max_points} pts</div>
                </div>
              </div>
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: T.textMuted }}>Due {new Date(a.due_date).toLocaleDateString()}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {user.role === "student" && <Btn size="sm">Submit</Btn>}
                  {user.role === "instructor" && <Btn size="sm" variant="secondary">Submissions</Btn>}
                </div>
              </div>
            </Card>
          );
        })}
        {shown.length === 0 && <Card><p style={{ color: T.textMuted, textAlign: "center", padding: "18px 0", fontSize: 13 }}>No {tab} assignments</p></Card>}
      </div>
      <Modal open={addModal} onClose={() => setAddModal(false)} title="New Assignment">
        <Field label="Course">
          <select value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}>
            <option value="">Select course</option>
            {allCourses.filter(c => c.instructor_id === user.user_id).map(c => <option key={c.course_id} value={c.course_id}>{c.title}</option>)}
          </select>
        </Field>
        <Field label="Title"><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></Field>
        <Field label="Due Date"><input type="datetime-local" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></Field>
        <Field label="Max Points"><input type="number" value={form.max_points} onChange={e => setForm(f => ({ ...f, max_points: e.target.value }))} /></Field>
        <Field label="Description"><textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn variant="secondary" onClick={() => setAddModal(false)}>Cancel</Btn>
          <Btn onClick={handleAdd} disabled={!form.title || !form.course_id || !form.due_date}>Create</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ── Grades Page ───────────────────────────────────────────────────────────────
function GradesPage({ user }) {
  const { data: grades, loading } = useAsync(api.getMyGrades);
  const { data: courses } = useAsync(api.getCourses);
  if (loading) return <Spinner />;
  const allGrades = grades || [];
  const allCourses = courses || [];
  const avg = allGrades.length ? (allGrades.reduce((s, g) => s + Number(g.score), 0) / allGrades.length).toFixed(1) : null;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Grade Book</h2>
          <p style={{ color: T.textSecondary, fontSize: 13, marginTop: 3 }}>Your academic performance</p>
        </div>
        {avg && (
          <div style={{ textAlign: "center", padding: "8px 18px", background: T.accentSoft, borderRadius: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.accent }}>{avg}%</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>Average</div>
          </div>
        )}
      </div>
      <Card>
        <Table
          headers={["Assignment", "Course", "Score", "Max", "Grade", "Date"]}
          rows={allGrades.map(g => {
            const c = allCourses.find(x => x.course_id === g.course_id);
            return [
              g.assignment_title || "—",
              <Badge color="gray">{c?.course_code || "—"}</Badge>,
              g.score,
              g.max_points || "—",
              <GradeBadge grade={g.letter_grade} />,
              g.graded_at ? new Date(g.graded_at).toLocaleDateString() : "—",
            ];
          })}
        />
      </Card>
    </div>
  );
}

// ── Attendance Page ───────────────────────────────────────────────────────────
function AttendancePage({ user }) {
  const { data: attendance, loading } = useAsync(api.getMyAttendance);
  const { data: courses } = useAsync(api.getCourses);
  if (loading) return <Spinner />;
  const records = attendance || [];
  const total   = records.length;
  const present = records.filter(a => a.status === "present").length;
  const late    = records.filter(a => a.status === "late").length;
  const absent  = records.filter(a => a.status === "absent").length;
  const pct = total ? (((present + late) / total) * 100).toFixed(1) : "0.0";
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Attendance</h2>
        <p style={{ color: T.textSecondary, fontSize: 13, marginTop: 3 }}>Your class participation record</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 20 }}>
        <StatCard label="Present" value={present} color={T.success} />
        <StatCard label="Late" value={late} color={T.warning} />
        <StatCard label="Absent" value={absent} color={T.danger} />
        <StatCard label="Rate" value={`${pct}%`} color={T.accent} />
      </div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Overall Attendance</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: Number(pct) >= 75 ? T.success : T.danger }}>{pct}%</span>
        </div>
        <ProgressBar value={Number(pct)} max={100} color={Number(pct) >= 75 ? T.success : T.danger} />
        {Number(pct) < 75 && <p style={{ marginTop: 8, fontSize: 12, color: T.warning }}>Attendance below 75% threshold.</p>}
      </Card>
      <Card>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>History</h3>
        <Table
          headers={["Date", "Course", "Status"]}
          rows={records.map(a => {
            const c = (courses || []).find(x => x.course_id === a.course_id);
            return [
              new Date(a.session_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
              <Badge color="gray">{c?.course_code || "—"}</Badge>,
              <StatusBadge status={a.status} />,
            ];
          })}
        />
      </Card>
    </div>
  );
}

// ── Notifications Page ────────────────────────────────────────────────────────
function NotificationsPage({ notifications, onRead, onReadAll }) {
  const unread = (notifications || []).filter(n => !n.is_read).length;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Notifications</h2>
          <p style={{ color: T.textSecondary, fontSize: 13, marginTop: 3 }}>{unread} unread</p>
        </div>
        {unread > 0 && <Btn variant="secondary" size="sm" onClick={onReadAll}>Mark all read</Btn>}
      </div>
      <Card style={{ padding: 0 }}>
        {(notifications || []).length === 0
          ? <div style={{ padding: 28, textAlign: "center", color: T.textMuted, fontSize: 13 }}>No notifications</div>
          : (notifications || []).map(n => (
            <div key={n._id} onClick={() => !n.is_read && onRead(n._id)}
              style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}20`, cursor: n.is_read ? "default" : "pointer", background: n.is_read ? "transparent" : T.accentSoft }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: n.is_read ? 400 : 600 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 2 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 3 }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                </div>
                {!n.is_read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.accent, flexShrink: 0, marginTop: 3 }} />}
              </div>
            </div>
          ))
        }
      </Card>
    </div>
  );
}

// ── Profile Page ──────────────────────────────────────────────────────────────
function ProfilePage({ user }) {
  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Profile</h2>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <Avatar name={`${user.first_name} ${user.last_name}`} size={56} />
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>{user.first_name} {user.last_name}</h3>
            <p style={{ color: T.textSecondary, fontSize: 13, marginTop: 2 }}>{user.email}</p>
            <div style={{ marginTop: 6 }}>
              <Badge color={user.role === "admin" ? "red" : user.role === "instructor" ? "purple" : "blue"}>{user.role}</Badge>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="First Name"><input value={user.first_name || ""} readOnly /></Field>
          <Field label="Last Name"><input value={user.last_name || ""} readOnly /></Field>
          <Field label="Email"><input value={user.email || ""} readOnly /></Field>
          <Field label="Username"><input value={user.username || ""} readOnly /></Field>
        </div>
        <Btn style={{ marginTop: 6 }}>Edit Profile</Btn>
      </Card>
      <Card>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Change Password</h3>
        <Field label="Current Password"><input type="password" placeholder="••••••••" /></Field>
        <Field label="New Password"><input type="password" placeholder="Min 8 characters" /></Field>
        <Field label="Confirm Password"><input type="password" placeholder="Repeat new password" /></Field>
        <Btn>Update Password</Btn>
      </Card>
    </div>
  );
}

// ── Admin Users Page ──────────────────────────────────────────────────────────
function AdminUsersPage() {
  const { data: users, loading } = useAsync(api.getUsers);
  const [toggling, setToggling] = useState(null);
  const [localUsers, setLocalUsers] = useState(null);
  useEffect(() => { if (users) setLocalUsers(users); }, [users]);
  if (loading) return <Spinner />;
  const all = localUsers || [];
  const toggle = async (u) => {
    setToggling(u.user_id);
    try {
      await api.toggleUser(u.user_id, { is_active: !u.is_active });
      setLocalUsers(prev => prev.map(x => x.user_id === u.user_id ? { ...x, is_active: !x.is_active } : x));
    } catch (e) { alert(e.message); } finally { setToggling(null); }
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>User Management</h2>
          <p style={{ color: T.textSecondary, fontSize: 13, marginTop: 3 }}>{all.length} users</p>
        </div>
        <Btn>+ Add User</Btn>
      </div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <Table
          headers={["User", "Email", "Role", "Status", "Actions"]}
          rows={all.map(u => [
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Avatar name={`${u.first_name} ${u.last_name}`} size={30} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>{u.first_name} {u.last_name}</span>
            </div>,
            <span style={{ color: T.textSecondary, fontSize: 12 }}>{u.email}</span>,
            <Badge color={u.role === "admin" ? "red" : u.role === "instructor" ? "purple" : "blue"}>{u.role}</Badge>,
            <Badge color={u.is_active ? "green" : "gray"}>{u.is_active ? "Active" : "Inactive"}</Badge>,
            <div style={{ display: "flex", gap: 6 }}>
              <Btn size="sm" variant="secondary">Edit</Btn>
              <Btn size="sm" variant={u.is_active ? "danger" : "success"}
                disabled={toggling === u.user_id}
                onClick={() => toggle(u)}>
                {u.is_active ? "Deactivate" : "Activate"}
              </Btn>
            </div>,
          ])}
        />
      </Card>
    </div>
  );
}

// ── Admin Departments Page ────────────────────────────────────────────────────
function DepartmentsPage() {
  const { data: depts, loading } = useAsync(api.getDepartments);
  const { data: courses } = useAsync(api.getCourses);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ dept_code: "", dept_name: "" });
  const [localDepts, setLocalDepts] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  useEffect(() => { if (depts) setLocalDepts(depts); }, [depts]);
  if (loading) return <Spinner />;
  const all = localDepts || [];
  const handleAdd = async () => {
    try {
      const res = await api.createDepartment(form);
      setLocalDepts(prev => [...prev, res.data]);
      setModal(false); setForm({ dept_code: "", dept_name: "" });
      setMsg({ type: "success", text: "Department added" });
    } catch (e) { setMsg({ type: "error", text: e.message }); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await api.deleteDepartment(id);
      setLocalDepts(prev => prev.filter(d => d.dept_id !== id));
    } catch (e) { alert(e.message); }
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Departments</h2>
          <p style={{ color: T.textSecondary, fontSize: 13, marginTop: 3 }}>{all.length} departments</p>
        </div>
        <Btn onClick={() => setModal(true)}>+ Add Department</Btn>
      </div>
      <Alert type={msg.type} msg={msg.text} />
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <Table
          headers={["Code", "Name", "Courses", "Actions"]}
          rows={all.map(d => [
            <span className="mono" style={{ color: T.accent, fontSize: 13 }}>{d.dept_code}</span>,
            <span style={{ fontSize: 13 }}>{d.dept_name}</span>,
            <Badge color="blue">{(courses || []).filter(c => c.dept_id === d.dept_id).length}</Badge>,
            <div style={{ display: "flex", gap: 6 }}>
              <Btn size="sm" variant="secondary">Edit</Btn>
              <Btn size="sm" variant="danger" onClick={() => handleDelete(d.dept_id)}>Delete</Btn>
            </div>,
          ])}
        />
      </Card>
      <Modal open={modal} onClose={() => setModal(false)} title="Add Department">
        <Field label="Code"><input value={form.dept_code} onChange={e => setForm(f => ({ ...f, dept_code: e.target.value }))} placeholder="e.g. CS" /></Field>
        <Field label="Name"><input value={form.dept_name} onChange={e => setForm(f => ({ ...f, dept_name: e.target.value }))} placeholder="e.g. Computer Science" /></Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn onClick={handleAdd} disabled={!form.dept_code || !form.dept_name}>Add</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ── Admin Courses Page ────────────────────────────────────────────────────────
function AdminCoursesPage() {
  const { data: courses, loading } = useAsync(api.getCourses);
  const { data: depts } = useAsync(api.getDepartments);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ course_code: "", title: "", credits: 3, level: "Beginner", dept_id: "", instructor_id: "" });
  const [localCourses, setLocalCourses] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  useEffect(() => { if (courses) setLocalCourses(courses); }, [courses]);
  if (loading) return <Spinner />;
  const all = localCourses || [];
  const handleAdd = async () => {
    try {
      const res = await api.createCourse(form);
      setLocalCourses(prev => [...prev, res.data]);
      setModal(false); setMsg({ type: "success", text: "Course created" });
    } catch (e) { setMsg({ type: "error", text: e.message }); }
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Courses</h2>
          <p style={{ color: T.textSecondary, fontSize: 13, marginTop: 3 }}>{all.length} courses</p>
        </div>
        <Btn onClick={() => setModal(true)}>+ Add Course</Btn>
      </div>
      <Alert type={msg.type} msg={msg.text} />
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <Table
          headers={["Code", "Title", "Department", "Credits", "Level", "Actions"]}
          rows={all.map(c => [
            <span className="mono" style={{ color: T.accent, fontSize: 12 }}>{c.course_code}</span>,
            <span style={{ fontSize: 13 }}>{c.title}</span>,
            <span style={{ fontSize: 12, color: T.textSecondary }}>{c.department?.dept_name || "—"}</span>,
            <Badge color="gray">{c.credits}</Badge>,
            <Badge color="blue">{c.level}</Badge>,
            <Btn size="sm" variant="danger" onClick={() => api.deleteCourse(c.course_id).then(() => setLocalCourses(p => p.filter(x => x.course_id !== c.course_id)))}>Delete</Btn>,
          ])}
        />
      </Card>
      <Modal open={modal} onClose={() => setModal(false)} title="Add Course">
        <Field label="Code"><input value={form.course_code} onChange={e => setForm(f => ({ ...f, course_code: e.target.value }))} placeholder="CS101" /></Field>
        <Field label="Title"><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></Field>
        <Field label="Department">
          <select value={form.dept_id} onChange={e => setForm(f => ({ ...f, dept_id: e.target.value }))}>
            <option value="">Select department</option>
            {(depts || []).map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
          </select>
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Credits"><input type="number" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: e.target.value }))} /></Field>
          <Field label="Level">
            <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
              {["Beginner","Intermediate","Advanced"].map(l => <option key={l}>{l}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn onClick={handleAdd} disabled={!form.course_code || !form.title || !form.dept_id}>Create</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem("lms_user");
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });
  const [page, setPage] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;
    api.getNotifications()
      .then(r => setNotifications(r.data || []))
      .catch(() => {});
  }, [user]);

  const handleLogin = (u) => {
    localStorage.setItem("lms_user", JSON.stringify(u));
    setUser(u);
    setPage("dashboard");
  };
  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("lms_user");
    setUser(null);
    setPage("dashboard");
  };
  const handleRead = async (id) => {
    await api.markRead(id).catch(() => {});
    setNotifications(ns => ns.map(n => n._id === id ? { ...n, is_read: true } : n));
  };
  const handleReadAll = async () => {
    await api.markAllRead().catch(() => {});
    setNotifications(ns => ns.map(n => ({ ...n, is_read: true })));
  };

  if (!user) return <><style>{css}</style><LoginPage onLogin={handleLogin} /></>;

  const unread = notifications.filter(n => !n.is_read).length;
  const pageMap = {
    dashboard:       <Dashboard user={user} setPage={setPage} />,
    courses:         user.role === "student" ? <CoursesPage user={user} /> : <AdminCoursesPage />,
    browse:          <BrowseCoursesPage user={user} />,
    "my-courses":    <CoursesPage user={user} />,
    assignments:     <AssignmentsPage user={user} />,
    quizzes:         <AssignmentsPage user={user} />,
    grades:          <GradesPage user={user} />,
    "grades-mgmt":   <GradesPage user={user} />,
    attendance:      <AttendancePage user={user} />,
    "attendance-mgmt": <AttendancePage user={user} />,
    notifications:   <NotificationsPage notifications={notifications} onRead={handleRead} onReadAll={handleReadAll} />,
    profile:         <ProfilePage user={user} />,
    users:           <AdminUsersPage />,
    departments:     <DepartmentsPage />,
    enrollments:     <CoursesPage user={user} />,
    students:        <AdminUsersPage />,
  };

  return (
    <>
      <style>{css}</style>
      <AuthCtx.Provider value={{ user, logout: handleLogout }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar role={user.role} page={page} setPage={setPage} user={user} unread={unread} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {/* Topbar */}
            <div style={{ height: 56, background: T.bgCard, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", flexShrink: 0 }}>
              <div style={{ fontSize: 13, color: T.textMuted }}>
                <span>Home</span>
                <span style={{ margin: "0 6px" }}>›</span>
                <span style={{ fontWeight: 600, color: T.textPrimary, textTransform: "capitalize" }}>{page.replace(/-/g, " ")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => setPage("notifications")}
                  style={{ position: "relative", background: "none", color: T.textSecondary, cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  {unread > 0 && <span style={{ position: "absolute", top: -4, right: -4, width: 15, height: 15, background: T.danger, borderRadius: "50%", fontSize: 9, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{unread}</span>}
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Avatar name={`${user.first_name} ${user.last_name}`} size={28} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{user.first_name}</span>
                </div>
                <Btn variant="ghost" size="sm" onClick={handleLogout} style={{ color: T.danger, padding: "5px 10px" }}>Sign out</Btn>
              </div>
            </div>
            <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
              {pageMap[page] || pageMap.dashboard}
            </main>
          </div>
        </div>
      </AuthCtx.Provider>
    </>
  );
}
