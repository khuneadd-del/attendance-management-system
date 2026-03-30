package com.attendance.attendance_management.repository;

import com.attendance.attendance_management.model.Enrollment;
import com.attendance.attendance_management.model.Subject;
import com.attendance.attendance_management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findByStudent(User student);

    List<Enrollment> findBySubject(Subject subject);

    boolean existsByStudentAndSubject(User student, Subject subject);
}