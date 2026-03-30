const BASE_URL = "http://localhost:8080/api";

// Helper to get token from localStorage
const getToken = () => localStorage.getItem("token");

// Helper for auth headers
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── Auth ──────────────────────────────────────────
export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Invalid email or password");
  return res.json();
};

// ── Users ─────────────────────────────────────────
export const getStudents = async () => {
  const res = await fetch(`${BASE_URL}/users/students`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const getTeachers = async () => {
  const res = await fetch(`${BASE_URL}/users/teachers`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const addStudent = async (name, email) => {
  const res = await fetch(`${BASE_URL}/users/students`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, email }),
  });
  if (!res.ok) throw new Error("Failed to add student");
  return res.json();
};

export const addTeacher = async (name, email) => {
  const res = await fetch(`${BASE_URL}/users/teachers`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, email }),
  });
  if (!res.ok) throw new Error("Failed to add teacher");
  return res.json();
};

export const deleteUser = async (id) => {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete user");
};

// ── Subjects ──────────────────────────────────────
export const getSubjects = async () => {
  const res = await fetch(`${BASE_URL}/subjects`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const getSubjectsByTeacher = async (teacherId) => {
  const res = await fetch(`${BASE_URL}/subjects/teacher/${teacherId}`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const addSubject = async (name, code, teacherId = null) => {
  const res = await fetch(`${BASE_URL}/subjects`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, code, teacherId }),
  });
  if (!res.ok) throw new Error("Failed to add subject");
  return res.json();
};

export const deleteSubject = async (id) => {
  const res = await fetch(`${BASE_URL}/subjects/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete subject");
};

// ── Attendance ────────────────────────────────────
export const markAttendance = async (subjectId, date, attendance) => {
  const res = await fetch(`${BASE_URL}/attendance/mark`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ subjectId, date, attendance }),
  });
  if (!res.ok) throw new Error("Failed to mark attendance");
};

export const getStudentAttendance = async (studentId) => {
  const res = await fetch(`${BASE_URL}/attendance/student/${studentId}`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const getAttendanceBySubject = async (subjectId) => {
  const res = await fetch(`${BASE_URL}/attendance/subject/${subjectId}`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const getAttendanceBySubjectAndDate = async (subjectId, date) => {
  const res = await fetch(`${BASE_URL}/attendance/subject/${subjectId}/date/${date}`, {
    headers: authHeaders(),
  });
  return res.json();
};