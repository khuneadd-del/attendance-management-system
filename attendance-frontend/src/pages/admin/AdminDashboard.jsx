import { useState, useEffect } from "react";
import { Users, BookOpen, GraduationCap, Trash2, Plus, LogOut, Search, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import * as api from "../../api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState("students");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newStudent, setNewStudent] = useState({ name: "", email: "" });
  const [newTeacher, setNewTeacher] = useState({ name: "", email: "" });
  const [newSubject, setNewSubject] = useState({ name: "", code: "", teacherId: "" });

  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");

  // Load all data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, t, sub] = await Promise.all([
        api.getStudents(),
        api.getTeachers(),
        api.getSubjects(),
      ]);
      setStudents(s);
      setTeachers(t);
      setSubjects(sub);
    } catch (err) {
      setError("Failed to load data. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.email) return;
    try {
      const s = await api.addStudent(newStudent.name, newStudent.email);
      setStudents([...students, s]);
      setNewStudent({ name: "", email: "" });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddTeacher = async () => {
    if (!newTeacher.name || !newTeacher.email) return;
    try {
      const t = await api.addTeacher(newTeacher.name, newTeacher.email);
      setTeachers([...teachers, t]);
      setNewTeacher({ name: "", email: "" });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.name || !newSubject.code) return;
    try {
      const sub = await api.addSubject(
        newSubject.name,
        newSubject.code,
        newSubject.teacherId || null
      );
      setSubjects([...subjects, sub]);
      setNewSubject({ name: "", code: "" });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.deleteUser(id);
      setStudents(students.filter((s) => s.id !== id));
      setTeachers(teachers.filter((t) => t.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSubject = async (id) => {
    try {
      await api.deleteSubject(id);
      setSubjects(subjects.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  const chartData = subjects.map((s) => ({
    subject: s.code,
    name: s.name,
  }));

  const tabs = [
    { key: "students", label: "Students", icon: GraduationCap },
    { key: "teachers", label: "Teachers", icon: Users },
    { key: "subjects", label: "Subjects", icon: BookOpen },
    { key: "chart", label: "Attendance Chart", icon: BarChart2 },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Loading dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 p-2 rounded-lg">
            <Users size={18} className="text-blue-600" />
          </div>
          <span className="font-semibold text-gray-800">Attendance System</span>
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md ml-2">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{localStorage.getItem("name")}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Students</p>
            <p className="text-2xl font-semibold text-gray-800">{students.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Teachers</p>
            <p className="text-2xl font-semibold text-gray-800">{teachers.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Subjects</p>
            <p className="text-2xl font-semibold text-gray-800">{subjects.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Students Tab */}
        {activeTab === "students" && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex gap-2 mb-3">
              <input placeholder="Name" value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input placeholder="Email" value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={handleAddStudent}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                <Plus size={15} /> Add
              </button>
            </div>
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Search students..." value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Name</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Email</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 && (
                  <tr><td colSpan={3} className="py-6 text-center text-gray-400 text-sm">No students found</td></tr>
                )}
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 text-gray-800">{s.name}</td>
                    <td className="py-3 text-gray-500">{s.email}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDeleteUser(s.id)}
                        className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === "teachers" && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex gap-2 mb-3">
              <input placeholder="Name" value={newTeacher.name}
                onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input placeholder="Email" value={newTeacher.email}
                onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={handleAddTeacher}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                <Plus size={15} /> Add
              </button>
            </div>
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Search teachers..." value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Name</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Email</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.length === 0 && (
                  <tr><td colSpan={3} className="py-6 text-center text-gray-400 text-sm">No teachers found</td></tr>
                )}
                {filteredTeachers.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 text-gray-800">{t.name}</td>
                    <td className="py-3 text-gray-500">{t.email}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDeleteUser(t.id)}
                        className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        
        {/* Subjects Tab */}
        {activeTab === "subjects" && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex gap-2 mb-3">
              <input
                placeholder="Subject Name"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Code (e.g. CS101)"
                value={newSubject.code}
                onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Teacher dropdown */}
              <select
                value={newSubject.teacherId || ""}
                onChange={(e) => setNewSubject({ ...newSubject, teacherId: e.target.value })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Assign Teacher (optional)</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <button
                onClick={handleAddSubject}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <Plus size={15} /> Add
              </button>
            </div>

            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search subjects..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Subject</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Code</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Teacher</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-gray-400 text-sm">No subjects found</td></tr>
                )}
                {filteredSubjects.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 text-gray-800">{s.name}</td>
                    <td className="py-3 text-gray-500">{s.code}</td>
                    <td className="py-3 text-gray-500">
                      {s.teacher ? (
                        <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md">
                          {s.teacher.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteSubject(s.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


        {/* Chart Tab */}
        {activeTab === "chart" && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-medium text-gray-700 mb-1">Subjects Overview</p>
            <p className="text-xs text-gray-400 mb-6">All registered subjects in the system</p>
            {subjects.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">No subjects added yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="subject" tick={{ fontSize: 13, fill: "#6b7280" }} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value, name, props) => [props.payload.name, "Subject"]}
                    contentStyle={{ fontSize: 13, borderRadius: 8, border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey={() => 1} name="Subject" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>
    </div>
  );
}