package com.attendance.attendance_management.controller;

import com.attendance.attendance_management.model.Attendance;
import com.attendance.attendance_management.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AttendanceController {

    private final AttendanceService attendanceService;

    // Teacher marks attendance
    @PostMapping("/mark")
    public ResponseEntity<String> markAttendance(@RequestBody Map<String, Object> body) {
        Long subjectId = Long.parseLong(body.get("subjectId").toString());
        LocalDate date = LocalDate.parse(body.get("date").toString());

        @SuppressWarnings("unchecked")
        Map<String, String> rawMap = (Map<String, String>) body.get("attendance");

        Map<Long, String> studentStatusMap = new java.util.HashMap<>();
        for (Map.Entry<String, String> entry : rawMap.entrySet()) {
            studentStatusMap.put(Long.parseLong(entry.getKey()), entry.getValue());
        }

        attendanceService.markAttendance(subjectId, date, studentStatusMap);
        return ResponseEntity.ok("Attendance marked successfully");
    }

    // Student views their own attendance
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Attendance>> getStudentAttendance(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudent(studentId));
    }

    // Teacher views attendance for a subject on a date
    @GetMapping("/subject/{subjectId}/date/{date}")
    public ResponseEntity<List<Attendance>> getAttendanceBySubjectAndDate(
            @PathVariable Long subjectId,
            @PathVariable String date) {
        return ResponseEntity.ok(
                attendanceService.getAttendanceBySubjectAndDate(subjectId, LocalDate.parse(date))
        );
    }

    // Teacher views all past records for a subject
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<Attendance>> getAttendanceBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(attendanceService.getAttendanceBySubject(subjectId));
    }
}