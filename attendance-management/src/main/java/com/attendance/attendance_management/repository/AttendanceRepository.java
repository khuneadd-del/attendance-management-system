package com.attendance.attendance_management.repository;

import com.attendance.attendance_management.model.Attendance;
import com.attendance.attendance_management.model.Subject;
import com.attendance.attendance_management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // All attendance for a student across all subjects
    List<Attendance> findByStudent(User student);

    // All attendance for a student in a specific subject
    List<Attendance> findByStudentAndSubject(User student, Subject subject);

    // All attendance for a subject on a specific date (for teacher view)
    List<Attendance> findBySubjectAndDate(Subject subject, LocalDate date);

    // All attendance for a subject (for past records)
    List<Attendance> findBySubject(Subject subject);

    // Check if attendance already marked
    boolean existsByStudentAndSubjectAndDate(User student, Subject subject, LocalDate date);
}