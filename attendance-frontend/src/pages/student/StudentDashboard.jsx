import { useState, useEffect } from "react";
import { LogOut, GraduationCap, CheckCircle, XCircle, Calendar, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as api from "../../api";

function getStats(records) {
  const total = records.length;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = total - present;
  const percentage = total === 0 ? 0 : Math.round((present / total) * 100);
  return { total, present, absent, percentage };
}

function ProgressBar({ percentage }) {
  const color =
    percentage >= 75 ? "bg-green-500" :
    percentage >= 60 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }} />
    </div>
  );
}

function AttendanceCalendar({ records }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const recordMap = {};
  records.forEach((r) => { recordMap[r.date] = r.status; });

  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });
  const todayStr = new Date().toISOString().split("T")[0];

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
          className="text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 text-sm"
        >←</button>
        <p className="text-sm font-medium text-gray-700">{monthName}</p>
        <button
          onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
          className="text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 text-sm"
        >→</button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const status = recordMap[dateStr];
          const isToday = dateStr === todayStr;

          let cellClass = "text-xs rounded-lg py-1.5 text-center font-medium transition-colors ";
          if (status === "PRESENT") cellClass += "bg-green-100 text-green-700";
          else if (status === "ABSENT") cellClass += "bg-red-100 text-red-500";
          else cellClass += "text-gray-400";
          if (isToday && !status) cellClass += " ring-1 ring-blue-400";

          return <div key={idx} className={cellClass}>{day}</div>;
        })}
      </div>

      <div className="flex gap-4 mt-3">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <div className="w-3 h-3 rounded-sm bg-green-100 border border-green-200"></div> Present
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <div className="w-3 h-3 rounded-sm bg-red-100 border border-red-200"></div> Absent
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <div className="w-3 h-3 rounded-sm bg-white border border-gray-200"></div> No class
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const studentId = localStorage.getItem("userId");

  const [attendanceData, setAttendanceData] = useState([]);
  const [activeTab, setActiveTab] = useState("report");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const records = await api.getStudentAttendance(studentId);

      // Group records by subject
      const grouped = {};
      records.forEach((r) => {
        const subjectId = r.subject.id;
        if (!grouped[subjectId]) {
          grouped[subjectId] = {
            subjectId,
            subject: r.subject.name,
            code: r.subject.code,
            records: [],
          };
        }
        grouped[subjectId].records.push({
          date: r.date,
          status: r.status,
        });
      });

      const data = Object.values(grouped);
      setAttendanceData(data);
      if (data.length > 0) setSelectedSubject(data[0]);
    } catch (err) {
      setError("Failed to load attendance data.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const allRecords = attendanceData.flatMap((s) => s.records);
  const totalPresent = allRecords.filter((r) => r.status === "PRESENT").length;
  const totalAbsent = allRecords.length - totalPresent;
  const overallPct = allRecords.length === 0 ? 0 : Math.round((totalPresent / allRecords.length) * 100);

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Loading attendance...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-50 p-2 rounded-lg">
            <GraduationCap size={18} className="text-yellow-600" />
          </div>
          <span className="font-semibold text-gray-800">Attendance System</span>
          <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-1 rounded-md ml-2">Student</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{localStorage.getItem("name")}</span>
          <button onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Overall Attendance</p>
            <p className={`text-2xl font-semibold ${
              overallPct >= 75 ? "text-green-600" :
              overallPct >= 60 ? "text-yellow-500" : "text-red-500"
            }`}>{overallPct}%</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Classes Present</p>
            <p className="text-2xl font-semibold text-gray-800">{totalPresent}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Classes Absent</p>
            <p className="text-2xl font-semibold text-red-500">{totalAbsent}</p>
          </div>
        </div>

        {/* Warning */}
        {overallPct < 75 && allRecords.length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
            ⚠️ Your overall attendance is below 75%. Please attend more classes.
          </div>
        )}

        {/* No data state */}
        {attendanceData.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <p className="text-gray-500 font-medium">No attendance records yet.</p>
            <p className="text-gray-400 text-sm mt-1">Your teacher hasn't marked attendance for you yet.</p>
          </div>
        )}

        {attendanceData.length > 0 && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => setActiveTab("report")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "report" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}>
                <BarChart2 size={15} /> Report
              </button>
              <button onClick={() => setActiveTab("calendar")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "calendar" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}>
                <Calendar size={15} /> Calendar
              </button>
            </div>

            {/* Report Tab */}
            {activeTab === "report" && (
              <div className="flex flex-col gap-4">
                {attendanceData.map((subj) => {
                  const { total, present, absent, percentage } = getStats(subj.records);
                  return (
                    <div key={subj.subjectId} className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-800">{subj.subject}</p>
                          <p className="text-xs text-gray-400">{subj.code}</p>
                        </div>
                        <span className={`text-sm font-semibold ${
                          percentage >= 75 ? "text-green-600" :
                          percentage >= 60 ? "text-yellow-500" : "text-red-500"
                        }`}>{percentage}%</span>
                      </div>
                      <ProgressBar percentage={percentage} />
                      <div className="flex gap-4 mt-3 mb-4 text-xs text-gray-500">
                        <span className="text-green-600 font-medium">{present} present</span>
                        <span className="text-red-400 font-medium">{absent} absent</span>
                        <span>{total} total classes</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {subj.records.map((r, i) => (
                          <div key={i} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border ${
                            r.status === "PRESENT"
                              ? "bg-green-50 border-green-100 text-green-700"
                              : "bg-red-50 border-red-100 text-red-500"
                          }`}>
                            {r.status === "PRESENT" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                            {r.date}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Calendar Tab */}
            {activeTab === "calendar" && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Select Subject</p>
                  <div className="flex flex-col gap-2">
                    {attendanceData.map((s) => {
                      const { percentage } = getStats(s.records);
                      return (
                        <button key={s.subjectId} onClick={() => setSelectedSubject(s)}
                          className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedSubject?.subjectId === s.subjectId
                              ? "bg-blue-600 text-white"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}>
                          <p className="font-medium">{s.subject}</p>
                          <p className={`text-xs ${selectedSubject?.subjectId === s.subjectId ? "text-blue-200" : "text-gray-400"}`}>
                            {percentage}% attendance
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
                  {selectedSubject && (() => {
                    const { present, total, percentage } = getStats(selectedSubject.records);
                    return (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{selectedSubject.subject}</p>
                            <p className="text-xs text-gray-400">{selectedSubject.code}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${
                              percentage >= 75 ? "text-green-600" :
                              percentage >= 60 ? "text-yellow-500" : "text-red-500"
                            }`}>{percentage}%</p>
                            <p className="text-xs text-gray-400">{present} of {total} classes</p>
                          </div>
                        </div>
                        <AttendanceCalendar records={selectedSubject.records} />
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}