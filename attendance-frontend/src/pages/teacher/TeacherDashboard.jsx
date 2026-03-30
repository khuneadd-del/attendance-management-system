import { useState, useEffect } from "react";
import { Users, LogOut, CheckCircle, XCircle, Save, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as api from "../../api";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const teacherId = localStorage.getItem("userId");

  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [date, setDate] = useState(today);
  const [attendance, setAttendance] = useState({});
  const [pastRecords, setPastRecords] = useState([]);
  const [activeTab, setActiveTab] = useState("mark");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load subjects and students on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load past records when subject changes
  useEffect(() => {
    if (selectedSubject) loadPastRecords();
  }, [selectedSubject]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [subs, studs] = await Promise.all([
        api.getSubjectsByTeacher(teacherId),
        api.getStudents(),
      ]);
      setSubjects(subs);
      setStudents(studs);
      if (subs.length > 0) {
        setSelectedSubject(subs[0]);
        // Default all students to PRESENT
        const defaultAttendance = {};
        studs.forEach((s) => (defaultAttendance[s.id] = "PRESENT"));
        setAttendance(defaultAttendance);
      }
    } catch (err) {
      setError("Failed to load data. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const loadPastRecords = async () => {
    try {
      const records = await api.getAttendanceBySubject(selectedSubject.id);
      // Group by date
      const grouped = {};
      records.forEach((r) => {
        const key = r.date;
        if (!grouped[key]) {
          grouped[key] = {
            date: r.date,
            subject: selectedSubject.name,
            subjectId: selectedSubject.id,
            records: [],
          };
        }
        grouped[key].records.push({
          name: r.student.name,
          status: r.status,
        });
      });
      setPastRecords(Object.values(grouped).reverse());
    } catch (err) {
      console.error("Failed to load past records", err);
    }
  };

  const toggle = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "PRESENT" ? "ABSENT" : "PRESENT",
    }));
    setSaved(false);
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    setSaved(false);
    const defaultAttendance = {};
    students.forEach((s) => (defaultAttendance[s.id] = "PRESENT"));
    setAttendance(defaultAttendance);
  };

  const handleSave = async () => {
    try {
      // Convert attendance map: { studentId: "PRESENT"/"ABSENT" }
      const attendanceMap = {};
      Object.entries(attendance).forEach(([id, status]) => {
        attendanceMap[id] = status;
      });
      await api.markAttendance(selectedSubject.id, date, attendanceMap);
      setSaved(true);
      await loadPastRecords();
    } catch (err) {
      alert("Failed to save attendance: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const presentCount = Object.values(attendance).filter((v) => v === "PRESENT").length;

  const filteredPast = pastRecords.filter((r) => {
    const matchSubject = filterSubject === "All" || r.subject === filterSubject;
    const matchDate = filterDate === "" || r.date === filterDate;
    return matchSubject && matchDate;
  });

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Loading dashboard...</p>
    </div>
  );

  if (subjects.length === 0) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center flex-col gap-3">
      <p className="text-gray-600 font-medium">No subjects assigned yet.</p>
      <p className="text-gray-400 text-sm">Ask the admin to assign subjects to your account.</p>
      <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-600 mt-2">
        Logout
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-green-50 p-2 rounded-lg">
            <Users size={18} className="text-green-600" />
          </div>
          <span className="font-semibold text-gray-800">Attendance System</span>
          <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md ml-2">Teacher</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{localStorage.getItem("name")}</span>
          <button onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors">
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
            <p className="text-xs text-gray-500 mb-1">Subject</p>
            <p className="text-lg font-semibold text-gray-800">{selectedSubject?.name}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Present Today</p>
            <p className="text-2xl font-semibold text-green-600">{presentCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Absent Today</p>
            <p className="text-2xl font-semibold text-red-500">{students.length - presentCount}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setActiveTab("mark")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "mark" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}>
            <CheckCircle size={15} /> Mark Attendance
          </button>
          <button onClick={() => setActiveTab("past")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "past" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}>
            <ClipboardList size={15} /> Past Records
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              {pastRecords.length}
            </span>
          </button>
        </div>

        {/* Mark Attendance Tab */}
        {activeTab === "mark" && (
          <div className="grid grid-cols-3 gap-4">

            {/* Left panel */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Select Subject</p>
              <div className="flex flex-col gap-2 mb-5">
                {subjects.map((s) => (
                  <button key={s.id} onClick={() => handleSubjectChange(s)}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedSubject?.id === s.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}>
                    <p className="font-medium">{s.name}</p>
                    <p className={`text-xs ${selectedSubject?.id === s.id ? "text-blue-200" : "text-gray-400"}`}>
                      {s.code}
                    </p>
                  </button>
                ))}
              </div>
              <p className="text-sm font-medium text-gray-700 mb-2">Date</p>
              <input type="date" value={date}
                onChange={(e) => { setDate(e.target.value); setSaved(false); }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Right panel */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-700">
                  Mark Attendance — <span className="text-blue-600">{selectedSubject?.name}</span>
                </p>
                <button onClick={handleSave}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    saved
                      ? "bg-green-50 text-green-600 border border-green-200"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}>
                  {saved ? <><CheckCircle size={14} /> Saved!</> : <><Save size={14} /> Save Attendance</>}
                </button>
              </div>

              {students.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No students found.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-500 font-medium">Student</th>
                      <th className="text-center py-2 text-gray-500 font-medium">Status</th>
                      <th className="text-center py-2 text-gray-500 font-medium">Toggle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const isPresent = attendance[student.id] === "PRESENT";
                      return (
                        <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 text-gray-800 font-medium">{student.name}</td>
                          <td className="py-3 text-center">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              isPresent ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                            }`}>
                              {isPresent ? "Present" : "Absent"}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <button onClick={() => toggle(student.id)}>
                              {isPresent
                                ? <CheckCircle size={20} className="text-green-500 hover:text-gray-400" />
                                : <XCircle size={20} className="text-red-400 hover:text-gray-400" />
                              }
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Past Records Tab */}
        {activeTab === "past" && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex gap-3 mb-5">
              <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="All">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
              <input type="date" value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {(filterSubject !== "All" || filterDate !== "") && (
                <button onClick={() => { setFilterSubject("All"); setFilterDate(""); }}
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors px-2">
                  Clear filters
                </button>
              )}
            </div>

            {filteredPast.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">No records found.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredPast.map((record, idx) => {
                  const presentCount = record.records.filter((r) => r.status === "PRESENT").length;
                  return (
                    <div key={idx} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-800">{record.subject}</p>
                          <p className="text-xs text-gray-400">{record.date}</p>
                        </div>
                        <span className="text-sm font-semibold text-green-600">
                          {presentCount}/{record.records.length} present
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {record.records.map((r, i) => (
                          <div key={i} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border ${
                            r.status === "PRESENT"
                              ? "bg-green-50 border-green-100 text-green-700"
                              : "bg-red-50 border-red-100 text-red-500"
                          }`}>
                            {r.status === "PRESENT" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                            {r.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}