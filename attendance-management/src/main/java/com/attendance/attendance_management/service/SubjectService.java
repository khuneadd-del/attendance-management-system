package com.attendance.attendance_management.service;

import com.attendance.attendance_management.model.Subject;
import com.attendance.attendance_management.model.User;
import com.attendance.attendance_management.repository.SubjectRepository;
import com.attendance.attendance_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    // Get all subjects
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    // Get subjects by teacher
    public List<Subject> getSubjectsByTeacher(Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        return subjectRepository.findByTeacher(teacher);
    }

    // Add a new subject
    public Subject addSubject(String name, String code, Long teacherId) {
        if (subjectRepository.existsByCode(code)) {
            throw new RuntimeException("Subject code already exists: " + code);
        }
        User teacher = null;
        if (teacherId != null) {
            teacher = userRepository.findById(teacherId)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
        }
        Subject subject = Subject.builder()
                .name(name)
                .code(code)
                .teacher(teacher)
                .build();
        return subjectRepository.save(subject);
    }

    // Delete a subject
    public void deleteSubject(Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new RuntimeException("Subject not found with id: " + id);
        }
        subjectRepository.deleteById(id);
    }

    // Get subject by ID
    public Subject getSubjectById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
    }
}