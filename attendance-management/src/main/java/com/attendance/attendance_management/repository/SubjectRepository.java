package com.attendance.attendance_management.repository;

import com.attendance.attendance_management.model.Subject;
import com.attendance.attendance_management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    List<Subject> findByTeacher(User teacher);

    boolean existsByCode(String code);
}