package com.attendance.attendance_management.service;

import com.attendance.attendance_management.model.Attendance;
import com.attendance.attendance_management.model.Subject;
import com.attendance.attendance_management.model.User;
import com.attendance.attendance_management.repository.AttendanceRepository;
import com.attendance.attendance_management.repository.SubjectRepository;
import com.attendance.attendance_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;

    // Mark attendance for multiple students at once
    public void markAttendance(Long subjectId, LocalDate date,
                               Map<Long, String> studentStatusMap) {

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        for (Map.Entry<Long, String> entry : studentStatusMap.entrySet()) {
            Long studentId = entry.getKey();
            Attendance.Status status = Attendance.Status.valueOf(entry.getValue());

            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // If already marked, update it
            if (attendanceRepository.existsByStudentAndSubjectAndDate(student, subject, date)) {
                List<Attendance> existing = attendanceRepository
                        .findByStudentAndSubject(student, subject)
                        .stream()
                        .filter(a -> a.getDate().equals(date))
                        .toList();
                if (!existing.isEmpty()) {
                    Attendance a = existing.get(0);
                    a.setStatus(status);
                    attendanceRepository.save(a);
                }
            } else {
                // Create new record
                Attendance attendance = Attendance.builder()
                        .student(student)
                        .subject(subject)
                        .date(date)
                        .status(status)
                        .build();
                attendanceRepository.save(attendance);
            }
        }
    }

    // Get all attendance for a student (for student dashboard)
    public List<Attendance> getAttendanceByStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return attendanceRepository.findByStudent(student);
    }

    // Get attendance for a subject on a date (for teacher - mark attendance view)
    public List<Attendance> getAttendanceBySubjectAndDate(Long subjectId, LocalDate date) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        return attendanceRepository.findBySubjectAndDate(subject, date);
    }

    // Get all attendance for a subject (for teacher - past records)
    public List<Attendance> getAttendanceBySubject(Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        return attendanceRepository.findBySubject(subject);
    }
}